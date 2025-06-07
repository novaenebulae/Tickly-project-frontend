import { Component, OnInit, inject, computed, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { TeamManagementService } from '../../../../../../core/services/domain/team-management/team-management.service';
import { UserStructureService } from '../../../../../../core/services/domain/user-structure/user-structure.service';
import { NotificationService } from '../../../../../../core/services/domain/utilities/notification.service';

// Models
import { TeamMember, TeamMemberStatus, Role, TEAM_ROLES_DISPLAY } from '../../../../../../core/models/user/team-member.model';
import { UserRole } from '../../../../../../core/models/user/user-role.enum';

// Dialogs
import { ConfirmationDialogComponent } from '../../../../../../shared/ui/dialogs/confirmation-dialog/confirmation-dialog.component';

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
  private userStructureService = inject(UserStructureService);
  private notification = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // ✅ Signaux du service
  protected readonly teamMembers = this.teamService.teamMembers;
  protected readonly availableRoles = this.teamService.allowedTeamRoles;
  protected readonly isLoading = this.teamService.isLoading;
  protected readonly isInviting = this.teamService.isInviting;
  protected readonly isUpdating = this.teamService.isUpdating;

  // ✅ Statistiques calculées
  protected readonly activeMembers = this.teamService.activeMembers;
  protected readonly pendingMembers = this.teamService.pendingMembers;
  protected readonly inactiveMembers = this.teamService.inactiveMembers;

  // ✅ Signaux locaux pour l'UI
  private showInviteFormSig = signal(false);
  private selectedMemberSig = signal<TeamMember | null>(null);
  private viewModeSig = signal<'active' | 'pending' | 'inactive' | 'all'>('all');

  readonly showInviteForm = computed(() => this.showInviteFormSig());
  protected readonly selectedMember = computed(() => this.selectedMemberSig());
  protected readonly viewMode = computed(() => this.viewModeSig());

  // ✅ Formulaire d'invitation
  inviteForm: FormGroup;

  // ✅ Colonnes pour la table
  protected displayedColumns: string[] = ['member', 'role', 'status', 'lastActivity', 'actions'];

  // ✅ Données filtrées selon le mode de vue
  protected readonly filteredMembers = computed(() => {
    const mode = this.viewMode();
    const members = this.teamMembers();

    switch (mode) {
      case 'active':
        return members.filter(m => m.status === TeamMemberStatus.ACTIVE);
      case 'pending':
        return members.filter(m => m.status === TeamMemberStatus.PENDING);
      case 'inactive':
        return members.filter(m => m.status === TeamMemberStatus.INACTIVE);
      default:
        return members;
    }
  });

  // ✅ Enums et constantes pour le template
  protected readonly TeamMemberStatus = TeamMemberStatus;
  protected readonly UserRole = UserRole;
  protected readonly TEAM_ROLES_DISPLAY = TEAM_ROLES_DISPLAY;

  constructor() {
    this.inviteForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      roleId: ['', [Validators.required]]
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
  private loadTeamData(): void {
    this.teamService.loadTeamMembers().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: value => this.teamMembers,
      complete: () => {
        console.log('Team data loaded');}
    });
  }

  /**
   * ✅ Rafraîchit les données
   */
  refreshData(): void {
    this.teamService.refreshTeamMembers().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.notification.displayNotification('Données mises à jour', 'valid');
      },
      error: () => {
        this.notification.displayNotification('Erreur lors de la mise à jour', 'error');
      }
    });
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
      const { email, roleId } = this.inviteForm.value;

      this.teamService.inviteTeamMember(email, roleId).pipe(
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
  updateMemberRole(member: TeamMember, newRoleId: number): void {
    if (!this.teamService.canEditMember(member)) {
      this.notification.displayNotification('Vous n\'avez pas les permissions pour modifier ce membre', 'error');
      return;
    }

    this.teamService.updateTeamMemberRole(member.id, newRoleId).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /**
   * ✅ Change le statut d'un membre
   */
  updateMemberStatus(member: TeamMember, newStatus: TeamMemberStatus): void {
    if (!this.teamService.canEditMember(member)) {
      this.notification.displayNotification('Vous n\'avez pas les permissions pour modifier ce membre', 'error');
      return;
    }

    this.teamService.updateTeamMemberStatus(member.id, newStatus).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /**
   * ✅ Renvoie une invitation
   */
  resendInvitation(member: TeamMember): void {
    this.teamService.resendInvitation(member.id).pipe(
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
      case TeamMemberStatus.INACTIVE:
        return 'cancel';
      default:
        return 'help';
    }
  }

  /**
   * ✅ Obtient la couleur pour le statut
   */
  getStatusColor(status: TeamMemberStatus): string {
    switch (status) {
      case TeamMemberStatus.ACTIVE:
        return 'primary';
      case TeamMemberStatus.PENDING:
        return 'accent';
      case TeamMemberStatus.INACTIVE:
        return 'warn';
      default:
        return '';
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
   * ✅ Formate la date de dernière activité
   */
  formatLastActivity(date: Date | undefined): string {
    if (!date) return 'Jamais';

    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Aujourd\'hui';
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;

    return new Date(date).toLocaleDateString('fr-FR');
  }
}
