/**
 * @file Service de domaine pour la gestion des équipes de structures.
 * @licence Proprietary
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';

// Services API
import { TeamApiService } from '../../api/team/team-api.service';

// Services de domaine
import { UserStructureService } from '../user-structure/user-structure.service';
import { NotificationService } from '../utilities/notification.service';
import { AuthService } from '../user/auth.service';

// Modèles
import {
  TeamMember,
  Role,
  InviteTeamMemberDto,
  UpdateTeamMemberDto,
  InviteTeamMemberResponseDto,
  TeamMemberStatus,
  ALLOWED_TEAM_ROLES,
  isAllowedTeamRole
} from '../../../models/user/team-member.model';
import { UserRole } from '../../../models/user/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class TeamManagementService {
  private teamApiService = inject(TeamApiService);
  private userStructureService = inject(UserStructureService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  // Signals pour la gestion d'état
  private teamMembersSig = signal<TeamMember[]>([]);
  private availableRolesSig = signal<Role[]>([]);
  private isLoadingSig = signal(false);
  private isInvitingSig = signal(false);
  private isUpdatingSig = signal(false);

  // Computed signals
  public readonly teamMembers = computed(() => this.teamMembersSig());
  public readonly availableRoles = computed(() => this.availableRolesSig());
  public readonly isLoading = computed(() => this.isLoadingSig());
  public readonly isInviting = computed(() => this.isInvitingSig());
  public readonly isUpdating = computed(() => this.isUpdatingSig());

  // Computed signals pour les statistiques
  public readonly activeMembers = computed(() =>
    this.teamMembersSig().filter(member => member.status === TeamMemberStatus.ACTIVE)
  );

  public readonly pendingMembers = computed(() =>
    this.teamMembersSig().filter(member => member.status === TeamMemberStatus.PENDING)
  );

  public readonly inactiveMembers = computed(() =>
    this.teamMembersSig().filter(member => member.status === TeamMemberStatus.INACTIVE)
  );

  // Computed signals pour les rôles autorisés dans une équipe
  public readonly allowedTeamRoles = computed(() =>
    this.availableRolesSig().filter(role => isAllowedTeamRole(role.key))
  );

  constructor() {
    this.loadAvailableRoles();
  }

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
   * Charge les rôles disponibles.
   */
  private loadAvailableRoles(): void {
    this.teamApiService.getAvailableRoles().pipe(
      tap(roles => this.availableRolesSig.set(roles)),
      catchError(error => {
        this.handleError('Impossible de charger les rôles disponibles.', error);
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Invite un utilisateur à rejoindre l'équipe.
   */
  inviteTeamMember(email: string, roleId: number): Observable<TeamMember | null> {
    const role = this.availableRolesSig().find(r => r.id === roleId);

    if (!role || !isAllowedTeamRole(role.key)) {
      this.notificationService.displayNotification(
        'Le rôle sélectionné n\'est pas autorisé pour une équipe.',
        'error'
      );
      return of(null);
    }

    const inviteDto: InviteTeamMemberDto = { email, roleId };

    this.isInvitingSig.set(true);

    return this.teamApiService.inviteTeamMember(inviteDto).pipe(
      tap(response => {
        if (response.success && response.member) {
          // Ajouter le nouveau membre à la liste
          const currentMembers = this.teamMembersSig();
          this.teamMembersSig.set([...currentMembers, response.member]);

          this.notificationService.displayNotification(
            response.message || 'Invitation envoyée avec succès !',
            'valid'
          );
        } else {
          this.notificationService.displayNotification(
            response.message || 'Erreur lors de l\'envoi de l\'invitation.',
            'error'
          );
        }
      }),
      map(response => response.member || null),
      catchError(error => {
        this.handleError('Impossible d\'envoyer l\'invitation.', error);
        return of(null);
      }),
      finalize(() => this.isInvitingSig.set(false))
    );
  }

  /**
   * Met à jour un membre d'équipe.
   */
  updateTeamMember(memberId: number, updateData: UpdateTeamMemberDto): Observable<TeamMember | null> {
    this.isUpdatingSig.set(true);

    return this.teamApiService.updateTeamMember(memberId, updateData).pipe(
      tap(updatedMember => {
        // Mettre à jour le membre dans la liste
        const currentMembers = this.teamMembersSig();
        const memberIndex = currentMembers.findIndex(m => m.id === memberId);

        if (memberIndex !== -1) {
          const updatedMembers = [...currentMembers];
          updatedMembers[memberIndex] = updatedMember;
          this.teamMembersSig.set(updatedMembers);

          this.notificationService.displayNotification(
            'Membre d\'équipe mis à jour avec succès !',
            'valid'
          );
        }
      }),
      catchError(error => {
        this.handleError('Impossible de mettre à jour le membre d\'équipe.', error);
        return of(null);
      }),
      finalize(() => this.isUpdatingSig.set(false))
    );
  }

  /**
   * Change le rôle d'un membre d'équipe.
   */
  updateTeamMemberRole(memberId: number, roleId: number): Observable<TeamMember | null> {
    const role = this.availableRolesSig().find(r => r.id === roleId);

    if (!role || !isAllowedTeamRole(role.key)) {
      this.notificationService.displayNotification(
        'Le rôle sélectionné n\'est pas autorisé pour une équipe.',
        'error'
      );
      return of(null);
    }

    return this.updateTeamMember(memberId, { roleId });
  }

  /**
   * Change le statut d'un membre d'équipe.
   */
  updateTeamMemberStatus(memberId: number, status: TeamMemberStatus): Observable<TeamMember | null> {
    return this.updateTeamMember(memberId, { status });
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
   * Renvoie une invitation à un membre en attente.
   */
  resendInvitation(memberId: number): Observable<boolean> {
    const member = this.teamMembersSig().find(m => m.id === memberId);

    if (!member || member.status !== TeamMemberStatus.PENDING) {
      this.notificationService.displayNotification(
        'Seuls les membres en attente peuvent recevoir une nouvelle invitation.',
        'error'
      );
      return of(false);
    }

    return this.teamApiService.resendTeamMemberInvitation(memberId).pipe(
      tap(response => {
        if (response.success) {
          // Mettre à jour la date d'invitation dans le cache local
          const currentMembers = this.teamMembersSig();
          const memberIndex = currentMembers.findIndex(m => m.id === memberId);

          if (memberIndex !== -1) {
            const updatedMembers = [...currentMembers];
            updatedMembers[memberIndex] = {
              ...updatedMembers[memberIndex],
              invitedAt: new Date()
            };
            this.teamMembersSig.set(updatedMembers);
          }

          this.notificationService.displayNotification(
            response.message || 'Invitation renvoyée avec succès !',
            'valid'
          );
        }
      }),
      map(response => response.success),
      catchError(error => {
        this.handleError('Impossible de renvoyer l\'invitation.', error);
        return of(false);
      })
    );
  }

  /**
   * Vérifie si l'utilisateur actuel peut gérer l'équipe.
   */
  canManageTeam(): boolean {
    const userRole = this.authService.currentUser()?.role;
    return userRole === UserRole.STRUCTURE_ADMINISTRATOR;
  }

  /**
   * Vérifie si l'utilisateur actuel peut modifier un membre spécifique.
   */
  canEditMember(member: TeamMember): boolean {
    if (!this.canManageTeam()) return false;

    const currentUserId = this.authService.currentUser()?.userId;
    // Ne pas permettre à un utilisateur de se modifier lui-même
    return member.userId !== currentUserId;
  }

  /**
   * Vérifie si un membre peut être supprimé.
   */
  canRemoveMember(member: TeamMember): boolean {
    if (!this.canEditMember(member)) return false;

    // Un administrateur de structure ne peut pas supprimer un autre administrateur
    const currentUserRole = this.authService.currentUser()?.role;
    return !(currentUserRole === UserRole.STRUCTURE_ADMINISTRATOR &&
      member.role.key === UserRole.STRUCTURE_ADMINISTRATOR);
  }

  /**
   * Obtient un membre par son ID.
   */
  getMemberById(memberId: number): TeamMember | undefined {
    return this.teamMembersSig().find(member => member.id === memberId);
  }

  /**
   * Obtient les membres par statut.
   */
  getMembersByStatus(status: TeamMemberStatus): TeamMember[] {
    return this.teamMembersSig().filter(member => member.status === status);
  }

  /**
   * Obtient les membres par rôle.
   */
  getMembersByRole(roleKey: UserRole): TeamMember[] {
    return this.teamMembersSig().filter(member => member.role.key === roleKey);
  }

  /**
   * Rafraîchit la liste des membres d'équipe.
   */
  refreshTeamMembers(): Observable<TeamMember[]> {
    return this.loadTeamMembers(true);
  }

  /**
   * Nettoie le cache.
   */
  clearCache(): void {
    this.teamMembersSig.set([]);
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
