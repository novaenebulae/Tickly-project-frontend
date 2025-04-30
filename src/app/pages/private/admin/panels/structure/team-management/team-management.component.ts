import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';

// Importer les dialogues (adapter les chemins)
import { TeamDetailDialogComponent, TeamDialogResult, TeamDialogData} from './team-detail-dialog/team-detail-dialog.component'; // Renommé
import { ConfirmationDialogComponent, ConfirmationDialogData} from '../../../../../../shared/ui/confirmation-dialog/confirmation-dialog.component';

// Interfaces
interface Role { id: number; name: string; key?: string; }
interface TeamMember { // Utilisation de TeamMember
  id: number; firstName: string | null; lastName: string | null; email: string;
  roleId: number; status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  dateAdded?: Date; lastActivity?: Date; phone?: string; position?: string;
}

@Component({
  selector: 'app-team-management', // Renommé si le fichier est aussi renommé
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSelectModule,
    MatChipsModule, MatProgressSpinnerModule, MatDialogModule, MatTooltipModule, MatCardModule
  ],
  templateUrl: './team-management.component.html', // Assurez-vous que ce fichier existe
  styleUrls: ['./team-management.component.scss']   // Assurez-vous que ce fichier existe
})
export class TeamManagementComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];
  dataSource: MatTableDataSource<TeamMember>; // Utilise TeamMember

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filterInput') filterInput!: HTMLInputElement;

  inviteForm: FormGroup;
  showInviteForm: boolean = false;
  isSendingInvite: boolean = false;
  inviteError: string | null = null;

  // Données locales
  private teamMembers: TeamMember[] = [ // Renommé
    { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice.martin@example.com', roleId: 1, status: 'ACTIVE' },
    { id: 2, firstName: 'Bob', lastName: 'Durand', email: 'bob.durand@example.com', roleId: 2, status: 'ACTIVE' },
    { id: 3, firstName: null, lastName: null, email: 'invite.pending@example.com', roleId: 3, status: 'PENDING' },
    { id: 4, firstName: 'Charlie', lastName: 'Petit', email: 'charlie.petit@example.com', roleId: 4, status: 'ACTIVE' },
    { id: 5, firstName: 'Diane', lastName: 'Leroy', email: 'diane.leroy@example.com', roleId: 2, status: 'INACTIVE' },
  ];
  availableRoles: Role[] = [
    { id: 1, name: 'Administrateur Structure', key: 'ADMIN_STRUCTURE' },
    { id: 2, name: 'Organisateur', key: 'ORGANIZER' },
    { id: 3, name: 'Service Réservation', key: 'BOOKING_SERVICE' },
    { id: 4, name: 'Agent d\'Accueil', key: 'RECEPTION_AGENT' },
  ];

  private subscriptions = new Subscription();
  private avatarColors = ['#673AB7', '#3F51B5', '#009688', '#FF5722', '#795548', '#E91E63', '#03A9F4']; // Défini ici ou service

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog
    /*, private teamService: TeamService, private authService: AuthService */ // Renommer le service si besoin
  ) {
    this.dataSource = new MatTableDataSource(this.teamMembers); // Utilise teamMembers
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      roleId: [null, Validators.required]
    });
  }

  ngOnInit(): void { /* TODO: Load data */ }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => { // Utilise TeamMember implicitement
      switch (property) {
        case 'name': return `${item.firstName} ${item.lastName}`.toLowerCase();
        case 'role': return this.getRoleName(item.roleId).toLowerCase();
        default: return (item as any)[property];
      }
    };
  }

  ngOnDestroy(): void { this.subscriptions.unsubscribe(); }

  applyFilter(event: Event | string): void {
    const filterValue = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  clearFilter(): void {
    if (this.filterInput) { this.filterInput.value = ''; }
    this.applyFilter('');
  }
  toggleInviteForm(): void {
    this.showInviteForm = !this.showInviteForm;
    if (!this.showInviteForm) { this.inviteForm.reset(); this.inviteError = null; }
  }

  sendInvitation(): void {
    if (this.inviteForm.invalid) { return; }
    this.isSendingInvite = true; this.inviteError = null;
    const { email, roleId } = this.inviteForm.value;
    console.log(`TODO: Appel API pour inviter ${email} avec rôle ID ${roleId}`);
    // Simulation
    setTimeout(() => {
      if (this.teamMembers.some(m => m.email.toLowerCase() === email.toLowerCase())) {
        this.inviteForm.get('email')?.setErrors({ alreadyMember: true });
        this.inviteError = "Ce membre fait déjà partie de l'équipe."; this.isSendingInvite = false; return;
      }
      const newMember: TeamMember = {
        id: Math.max(...this.teamMembers.map(m => m.id), 0) + 1, firstName: null, lastName: null,
        email: email, roleId: roleId, status: 'PENDING'
      };
      this.teamMembers.push(newMember);
      this.dataSource.data = [...this.teamMembers];
      this.showInviteForm = false; this.inviteForm.reset(); this.isSendingInvite = false;
      console.log("Invitation envoyée (simulé)");
    }, 1500);
  }

  resendInvite(member: TeamMember): void { // Utilise TeamMember
    if (member.status !== 'PENDING') return;
    console.log(`TODO: Appel API pour renvoyer l'invitation à ${member.email}`);
    alert(`Invitation renvoyée (simulé) à ${member.email}`);
  }

  // Ouvrir la dialogue de détails
  openTeamDetailDialog(member: TeamMember): void { // Utilise TeamMember
    const dialogRef = this.dialog.open<TeamDetailDialogComponent, TeamDialogData, TeamDialogResult>(TeamDetailDialogComponent, {
      width: '800px', // Largeur augmentée
      maxWidth: '95vw',
      data: { member: { ...member }, availableRoles: this.availableRoles }
    });

    dialogRef.afterClosed().subscribe((result: TeamDialogResult | undefined) => {
      if (!result) return;
      switch (result.action) {
        case 'save': this.updateMemberRole(member.id, result.payload); break;
        case 'resend': this.resendInvite(member); break;
        case 'close': default: break;
      }
    });
  }

  // Mettre à jour le rôle (après dialogue)
  private updateMemberRole(memberId: number, newRoleId: number): void {
    console.log(`TODO: Appel API UPDATE ROLE membre ID ${memberId} => Rôle ID ${newRoleId}`);
    // Simulation succès
    const index = this.teamMembers.findIndex(m => m.id === memberId);
    if (index > -1 && this.teamMembers[index].roleId !== newRoleId) {
      this.teamMembers[index].roleId = newRoleId;
      this.dataSource.data = [...this.teamMembers];
      console.log("Rôle màj localement (simulé)");
    }
    // Gérer erreur API
  }

  // Confirmer et supprimer un membre
  confirmAndDeleteMember(memberToDelete: TeamMember): void { // Utilise TeamMember
    const dialogRef = this.dialog.open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir retirer ${memberToDelete.firstName || memberToDelete.email} de l'équipe ?`,
        confirmButtonText: 'Retirer',
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed === true) {
        console.log(`TODO: Appel API DELETE membre ID ${memberToDelete.id}`);
        // Simulation succès
        this.teamMembers = this.teamMembers.filter(m => m.id !== memberToDelete.id);
        this.dataSource.data = this.teamMembers;
        console.log("Membre retiré (simulé)");
        // Gérer erreur API
      }
    });
  }

  // --- Utilitaires (inchangés) ---
  getInitials(firstName: string | null, lastName: string | null): string {
    const first = firstName?.trim()?.[0] ?? ''; const last = lastName?.trim()?.[0] ?? ''; return `${first}${last}` || '?';
  }
  getAvatarColor(memberId: number): string {
    const index = memberId % this.avatarColors.length; return this.avatarColors[index];
  }
  getRoleName(roleId: number): string {
    return this.availableRoles.find(r => r.id === roleId)?.name ?? 'Inconnu';
  }
  getRoleChipColor(roleId: number): 'primary' | 'accent' | 'warn' | undefined {
    const role = this.availableRoles.find(r => r.id === roleId);
    switch (role?.key) {
      case 'ADMIN_STRUCTURE': return 'primary'; case 'ORGANIZER': return 'accent';
      case 'BOOKING_SERVICE': return undefined; case 'RECEPTION_AGENT': return 'warn';
      default: return undefined;
    }
  }
  canDeleteMember(member: TeamMember): boolean { // Utilise TeamMember
    const currentUserId = 1; // TODO: AuthService
    if (member.id === currentUserId) return false;
    return true; // Simplifié, le backend gère le dernier admin
  }
}
