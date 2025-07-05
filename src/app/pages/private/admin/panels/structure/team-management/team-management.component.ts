import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

// Angular Material
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatTableModule} from '@angular/material/table';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDividerModule} from '@angular/material/divider';

// Services
import {TeamManagementService} from '../../../../../../core/services/domain/team-management/team-management.service';
import {NotificationService} from '../../../../../../core/services/domain/utilities/notification.service';
import {AuthService} from '../../../../../../core/services/domain/user/auth.service';

// Models
import {getRoleDisplayName, TeamMember, TeamMemberStatus} from '../../../../../../core/models/user/team-member.model';
import {UserRole} from '../../../../../../core/models/user/user-role.enum';

// Dialogs
import {
  ConfirmationDialogComponent
} from '../../../../../../shared/ui/dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
    MatChipsModule,
    MatTableModule,
    MatMenuModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.scss']
})
export class TeamManagementComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private formBuilder = inject(FormBuilder);
  private teamService = inject(TeamManagementService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // ✅ Signaux du service
  protected readonly teamMembers = this.teamService.teamMembers;
  protected readonly allowedTeamRoles = this.teamService.allowedTeamRoles;
  protected readonly isLoading = this.teamService.isLoading;
  protected readonly isInviting = this.teamService.isInviting;
  protected readonly isUpdating = this.teamService.isUpdating;

  // ✅ Statistiques calculées
  protected readonly activeMembers = this.teamService.activeMembers;
  protected readonly pendingMembers = this.teamService.pendingMembers;

  // ✅ Signaux locaux pour l'UI
  private showInviteFormSig = signal(false);
  private selectedMemberSig = signal<TeamMember | null>(null);
  private viewModeSig = signal<'active' | 'pending' | 'inactive' | 'all'>('all');

  readonly showInviteForm = computed(() => this.showInviteFormSig());
  protected readonly viewMode = computed(() => this.viewModeSig());

  // ✅ Formulaire d'invitation
  inviteForm: FormGroup;

  // ✅ Colonnes pour la table
  protected displayedColumns: string[] = ['member', 'role', 'status', 'actions'];

  // ✅ Données filtrées selon le mode de vue
  protected readonly filteredMembers = computed(() => {
    const mode = this.viewMode();
    const members = this.teamMembers();

    switch (mode) {
      case 'active':
        return members.filter(m => m.status === TeamMemberStatus.ACTIVE);
      case 'pending':
        return members.filter(m => m.status === TeamMemberStatus.PENDING);
      default:
        return members;
    }
  });

  // ✅ Enums et constantes pour le template
  protected readonly TeamMemberStatus = TeamMemberStatus;
  protected readonly UserRole = UserRole;

  constructor() {
    this.inviteForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadTeamData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ✅ Charge les données de l'équipe
   */
  protected loadTeamData(): void {
    this.teamService.loadTeamMembers().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (members: TeamMember[]) => {
        // Trier les membres pour placer l'utilisateur actuel en premier
        const sortedMembers = this.sortMembersWithCurrentUserFirst(members);

        // Mettre à jour le signal avec les membres triés
        this.teamService.setTeamMembers(sortedMembers);

        this.notification.displayNotification('Équipe chargée avec succès', 'valid');
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'équipe:', error);
        this.notification.displayNotification('Erreur lors du chargement de l\'équipe', 'error');
      }
    });
  }

  private sortMembersWithCurrentUserFirst(members: TeamMember[]): TeamMember[] {
    const currentUserId = this.authService.currentUser()?.userId;

    if (!currentUserId) {
      return members; // Retourner tel quel si pas d'utilisateur connecté
    }

    // Séparer l'utilisateur actuel des autres membres
    const currentUserMember = members.find(member => member.userId === currentUserId);
    const otherMembers = members.filter(member => member.userId !== currentUserId);

    // Trier les autres membres par nom/email pour une présentation cohérente
    otherMembers.sort((a, b) => {
      const nameA = this.getMemberDisplayName(a).toLowerCase();
      const nameB = this.getMemberDisplayName(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Retourner l'utilisateur actuel en premier, suivi des autres
    return currentUserMember ? [currentUserMember, ...otherMembers] : otherMembers;
  }


  /**
   * ✅ Affiche/masque le formulaire d'invitation
   */
  toggleInviteForm(): void {
    this.showInviteFormSig.set(!this.showInviteForm());
    if (!this.showInviteForm()) {
      this.inviteForm.reset();
    }
  }

  /**
   * ✅ Envoie une invitation
   */
  sendInvitation(): void {
    if (this.inviteForm.valid) {
      const { email, role } = this.inviteForm.value;

      this.teamService.inviteTeamMember(email, role).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (member) => {
          if (member) {
            this.toggleInviteForm();
            this.notification.displayNotification('Invitation envoyée avec succès !', 'valid');
          }
        }
      });
    }
  }

  /**
   * ✅ Change le mode de vue
   */
  setViewMode(mode: 'active' | 'pending' | 'inactive' | 'all'): void {
    this.viewModeSig.set(mode);
  }

  /**
   * ✅ Change le rôle d'un membre
   */
  updateMemberRole(member: TeamMember, newRole: UserRole): void {
    if (!this.teamService.canEditMember(member)) {
      this.notification.displayNotification('Vous n\'avez pas les permissions pour modifier ce membre', 'error');
      return;
    }

    this.teamService.updateTeamMemberRole(member.id, newRole).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /**
   * ✅ Supprime un membre de l'équipe
   */
  removeMember(member: TeamMember): void {
    if (!this.teamService.canRemoveMember(member)) {
      this.notification.displayNotification('Vous ne pouvez pas supprimer ce membre', 'error');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer le membre',
        message: `Êtes-vous sûr de vouloir supprimer ${member.firstName} ${member.lastName} de l'équipe ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.teamService.removeTeamMember(member.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe();
      }
    });
  }

  /**
   * ✅ Retourne à la gestion de structure
   */
  navigateBack(): void {
    this.router.navigate(['/admin/structure']);
  }

  /**
   * ✅ Obtient l'icône pour le statut
   */
  getStatusIcon(status: TeamMemberStatus): string {
    switch (status) {
      case TeamMemberStatus.ACTIVE:
        return 'check_circle';
      case TeamMemberStatus.PENDING:
        return 'schedule';
      default:
        return 'help';
    }
  }

  /**
   * ✅ Obtient le nom d'affichage d'un membre
   */
  getMemberDisplayName(member: TeamMember): string {
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    }
    return member.email;
  }

  /**
   * ✅ Obtient le nom d'affichage d'un rôle
   */
  getRoleDisplayName(role: UserRole): string {
    return getRoleDisplayName(role);
  }

  /**
   * ✅ Vérifie si un membre peut être modifié
   */
  canEditMember(member: TeamMember): boolean {
    return this.teamService.canEditMember(member);
  }

  /**
   * ✅ Vérifie si un membre peut être supprimé
   */
  canRemoveMember(member: TeamMember): boolean {
    return this.teamService.canRemoveMember(member);
  }

  /**
   * ✅ Vérifie si l'utilisateur peut gérer l'équipe
   */
  canManageTeam(): boolean {
    return this.teamService.canManageTeam();
  }

  /**
   * ✅ Vérifie si le membre est l'utilisateur connecté
   */
  isCurrentUser(member: TeamMember): boolean {
    const currentUserId = this.authService.currentUser()?.userId;
    return member.userId === currentUserId;
  }

  /**
   * ✅ Vérifie si un membre a des actions disponibles
   */
  hasAvailableActions(member: TeamMember): boolean {
    // L'utilisateur connecté ne peut pas avoir d'actions sur lui-même
    if (this.isCurrentUser(member)) {
      return false;
    }

    // Vérifier s'il y a au moins une action possible
    const canResend = member.status === TeamMemberStatus.PENDING;
    const canRemove = this.canRemoveMember(member);

    return canResend || canRemove;
  }

  /**
   * ✅ Obtient l'icône d'action pour un membre
   */
  getActionIcon(member: TeamMember): string {
    if (this.isCurrentUser(member)) {
      return 'block'; // Icône interdite pour l'utilisateur connecté
    }

    if (this.canRemoveMember(member)) {
      return 'delete'; // Icône de suppression
    }

    return 'block'; // Icône interdite par défaut
  }

  /**
   * ✅ Obtient le tooltip pour l'action
   */
  getActionTooltip(member: TeamMember): string {
    if (this.isCurrentUser(member)) {
      return 'Vous ne pouvez pas vous supprimer vous-même';
    }

    if (this.canRemoveMember(member)) {
      return 'Supprimer ce membre';
    }

    return 'Action non autorisée';
  }

  /**
   * ✅ Obtient la couleur de l'icône d'action
   */
  getActionColor(member: TeamMember): string {
    if (this.isCurrentUser(member) || !this.canRemoveMember(member)) {
      return 'disabled'; // Couleur grisée
    }

    return 'warn'; // Rouge pour la suppression
  }

  /**
   * ✅ Vérifie si l'action est cliquable
   */
  isActionClickable(member: TeamMember): boolean {
    return !this.isCurrentUser(member) && this.canRemoveMember(member);
  }

  /**
   * ✅ Gère le clic sur l'action
   */
  onActionClick(member: TeamMember): void {
    if (!this.isActionClickable(member)) {
      return;
    }

    this.removeMember(member);
  }
}
