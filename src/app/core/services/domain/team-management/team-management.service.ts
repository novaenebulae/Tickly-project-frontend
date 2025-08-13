/**
 * @file Service de domaine pour la gestion des équipes de structures.
 * @licence Proprietary
 */

import {computed, inject, Injectable, signal} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, finalize, map, tap} from 'rxjs/operators';

// Services API
import {TeamApiService} from '../../api/team/team-api.service';

// Services de domaine
import {UserStructureService} from '../user-structure/user-structure.service';
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from '../user/auth.service';

// Modèles
import {
  ALLOWED_TEAM_ROLES,
  InviteTeamMemberDto,
  isAllowedTeamRole,
  TeamMember,
  TeamMemberStatus
} from '../../../models/user/team-member.model';
import {UserRole} from '../../../models/user/user-role.enum';
import {UserService} from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class TeamManagementService {
  private teamApiService = inject(TeamApiService);
  private userStructureService = inject(UserStructureService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  // Signals pour la gestion d'état
  private teamMembersSig = signal<TeamMember[]>([]);
  private isLoadingSig = signal(false);
  private isInvitingSig = signal(false);
  private isUpdatingSig = signal(false);
  private storedInvitationTokenSig = signal<string | null>(null);

  // Computed signals
  public readonly teamMembers = computed(() => this.teamMembersSig());
  public readonly isLoading = computed(() => this.isLoadingSig());
  public readonly isInviting = computed(() => this.isInvitingSig());
  public readonly isUpdating = computed(() => this.isUpdatingSig());
  public readonly storedInvitationToken = computed(() => this.storedInvitationTokenSig());

  // Computed signals pour les statistiques
  public readonly activeMembers = computed(() =>
    this.teamMembersSig().filter(member => member.status === TeamMemberStatus.ACTIVE)
  );

  public readonly pendingMembers = computed(() =>
    this.teamMembersSig().filter(member => member.status === TeamMemberStatus.PENDING)
  );

  // Computed signals pour les rôles autorisés dans une équipe
  public readonly allowedTeamRoles = computed(() => [...ALLOWED_TEAM_ROLES]);

  /**
   * Charge les membres d'équipe pour la structure de l'utilisateur actuel.
   */
  loadTeamMembers(forceRefresh = false): Observable<TeamMember[]> {
    const structureId = this.userStructureService.userStructureId();

    if (!structureId) {
      this.notificationService.displayNotification(
        'Aucune structure associée à votre compte.',
        'error'
      );
      return of([]);
    }

    if (!forceRefresh && this.teamMembersSig().length > 0) {
      return of(this.teamMembersSig());
    }

    this.isLoadingSig.set(true);

    return this.teamApiService.getStructureTeamMembers(structureId).pipe(
      tap(members => {
        this.teamMembersSig.set(members);
      }),
      catchError(error => {
        this.handleError('Impossible de charger les membres de l\'équipe.', error);
        return of([]);
      }),
      finalize(() => this.isLoadingSig.set(false))
    );
  }

  /**
   * Invite un utilisateur à rejoindre l'équipe.
   */
  inviteTeamMember(email: string, role: UserRole): Observable<TeamMember | null> {
    const structureId = this.userStructureService.userStructureId();

    if (!structureId) {
      this.notificationService.displayNotification(
        'Aucune structure associée à votre compte.',
        'error'
      );
      return of(null);
    }

    if (!role || !isAllowedTeamRole(role)) {
      this.notificationService.displayNotification(
        'Le rôle sélectionné n\'est pas autorisé pour une équipe.',
        'error'
      );
      return of(null);
    }

    const inviteDto: InviteTeamMemberDto = { email, role };

    this.isInvitingSig.set(true);

    return this.teamApiService.inviteTeamMember(structureId, inviteDto).pipe(
      tap(updatedTeamMembers => {
        // Mettre à jour directement avec la liste complète retournée par l'API
        this.teamMembersSig.set(updatedTeamMembers);

        // Trouver le nouveau membre invité pour afficher une notification personnalisée
        const newMember = updatedTeamMembers.find(member =>
          member.email === email && member.status === TeamMemberStatus.PENDING
        );

        if (newMember) {
          this.notificationService.displayNotification(
            `Invitation envoyée avec succès à ${email} !`,
            'valid'
          );
        } else {
          this.notificationService.displayNotification(
            'Invitation envoyée avec succès !',
            'valid'
          );
        }
      }),
      map(updatedTeamMembers => {
        // Retourner le nouveau membre invité ou null
        return updatedTeamMembers.find(member =>
          member.email === email && member.status === TeamMemberStatus.PENDING
        ) || null;
      }),
      catchError(error => {
        this.handleError('Impossible d\'envoyer l\'invitation.', error);
        return of(null);
      }),
      finalize(() => this.isInvitingSig.set(false))
    );
  }

  setTeamMembers(teamMember: TeamMember[]): void {
    this.teamMembersSig.set(teamMember);
  }

  /**
   * Change le rôle d'un membre d'équipe.
   */
  updateTeamMemberRole(memberId: number, role: UserRole): Observable<TeamMember | null> {
    if (!role || !isAllowedTeamRole(role)) {
      this.notificationService.displayNotification(
        'Le rôle sélectionné n\'est pas autorisé pour une équipe.',
        'error'
      );
      return of(null);
    }

    this.isUpdatingSig.set(true);

    return this.teamApiService.updateTeamMemberRole(memberId, role).pipe(
      tap(updatedMember => {
        // Mettre à jour le membre dans la liste
        const currentMembers = this.teamMembersSig();
        const memberIndex = currentMembers.findIndex(m => m.id === memberId);

        if (memberIndex !== -1) {
          const updatedMembers = [...currentMembers];
          updatedMembers[memberIndex] = updatedMember;
          this.teamMembersSig.set(updatedMembers);

          this.notificationService.displayNotification(
            'Rôle du membre mis à jour avec succès !',
            'valid'
          );
        }
      }),
      catchError(error => {
        this.handleError('Impossible de mettre à jour le rôle du membre.', error);
        return of(null);
      }),
      finalize(() => this.isUpdatingSig.set(false))
    );
  }

  /**
   * Supprime un membre d'équipe.
   */
  removeTeamMember(memberId: number): Observable<boolean> {
    this.isUpdatingSig.set(true);

    return this.teamApiService.removeTeamMember(memberId).pipe(
      tap(() => {
        // Retirer le membre de la liste
        const currentMembers = this.teamMembersSig();
        const updatedMembers = currentMembers.filter(m => m.id !== memberId);
        this.teamMembersSig.set(updatedMembers);

        this.notificationService.displayNotification(
          'Membre d\'équipe supprimé avec succès !',
          'valid'
        );
      }),
      map(() => true),
      catchError(error => {
        this.handleError('Impossible de supprimer le membre d\'équipe.', error);
        return of(false);
      }),
      finalize(() => this.isUpdatingSig.set(false))
    );
  }

  /**
   * Vérifie si l'utilisateur actuel peut gérer l'équipe.
   */
  canManageTeam(): boolean {
    const currentUserRole = this.userService.currentUserProfileData()?.role;
    return currentUserRole === UserRole.STRUCTURE_ADMINISTRATOR;
  }

  /**
   * Vérifie si l'utilisateur actuel peut modifier un membre spécifique.
   */
  canEditMember(member: TeamMember): boolean {
    if (!this.canManageTeam()) return false;

    const currentUser = this.authService.currentUser();
    // Ne pas permettre à un utilisateur de se modifier lui-même
    return member.userId !== currentUser?.userId;
  }

  /**
   * Vérifie si un membre peut être supprimé.
   */
  canRemoveMember(member: TeamMember): boolean {
    if (!this.canEditMember(member)) return false;

    const currentUserRole = this.userService.currentUserProfileData()?.role;
    // Un administrateur de structure ne peut pas supprimer un autre administrateur
    return !(currentUserRole === UserRole.STRUCTURE_ADMINISTRATOR &&
      member.role === UserRole.STRUCTURE_ADMINISTRATOR);
  }

  /**
   * Gestion des erreurs centralisée.
   */
  private handleError(message: string, error: any): void {
    console.error('TeamManagementService Error:', error);

    // Extraire le message d'erreur spécifique si disponible
    let errorMessage = message;
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    }

    this.notificationService.displayNotification(errorMessage, 'error');
  }
}
