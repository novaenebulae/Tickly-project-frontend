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

// Importer la nouvelle dialogue de détails et l'ancienne de confirmation
import { StaffDialogResult, StaffDialogData, StaffDetailDialogComponent} from './staff-detail-dialog/staff-detail-dialog.component';
import { ConfirmationDialogComponent, ConfirmationDialogData} from '../../../../../../shared/ui/confirmation-dialog/confirmation-dialog.component';

// Interfaces (dupliquées ou importées)
interface Role { id: number; name: string; key?: string; }
interface TeamMember {
  id: number; firstName: string | null; lastName: string | null; email: string;
  roleId: number; status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  dateAdded?: Date; lastActivity?: Date; phone?: string; position?: string; // Champs simulés ajoutés
}


@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatSelectModule,
    MatChipsModule, MatProgressSpinnerModule, MatDialogModule, MatTooltipModule, MatCardModule
  ],
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.scss']
})
export class TeamManagementComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];
  dataSource: MatTableDataSource<TeamMember>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filterInput') filterInput!: HTMLInputElement;

  inviteForm: FormGroup;
  showInviteForm: boolean = false;
  isSendingInvite: boolean = false;
  inviteError: string | null = null;

  // Suppression des états d'édition inline
  // editingMemberId: number | null = null;
  // selectedRoleId: number | null = null;

  private teamMembers: TeamMember[] = [
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

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog
    /*, private teamService: TeamService, private authService: AuthService */
  ) {
    this.dataSource = new MatTableDataSource(this.teamMembers);
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      roleId: [null, Validators.required]
    });
  }

  ngOnInit(): void { /* TODO: Load data */ }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name': return `${item.firstName} ${item.lastName}`.toLowerCase();
        case 'role': return this.getRoleName(item.roleId).toLowerCase();
        default: return (item as any)[property];
      }
    };
  }

  ngOnDestroy(): void { this.subscriptions.unsubscribe(); }

  // Appliquer le filtre sur la source de données
  applyFilter(event: Event | string): void {
    const filterValue = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Effacer le contenu du champ de filtre
  clearFilter(): void {
    if (this.filterInput) {
      this.filterInput.value = '';
    }
    this.applyFilter('');
  }

  // --- Méthodes d'Invitation ---

  // Afficher/Masquer le formulaire d'invitation
  toggleInviteForm(): void {
    this.showInviteForm = !this.showInviteForm;
    if (!this.showInviteForm) {
      this.inviteForm.reset(); // Réinitialiser le formulaire en le fermant
      this.inviteError = null; // Effacer les erreurs précédentes
    }
  }

  // Envoyer l'invitation via le service
  sendInvitation(): void {
    if (this.inviteForm.invalid) {
      return; // Ne rien faire si le formulaire est invalide
    }
    this.isSendingInvite = true;
    this.inviteError = null;
    const { email, roleId } = this.inviteForm.value;

    console.log(`TODO: Appel API pour inviter ${email} avec rôle ID ${roleId}`);
    // --- Simulation d'appel API ---
    // Remplacer par this.teamService.inviteMember(email, roleId).subscribe(...)
    setTimeout(() => {
      // --- Gestion du succès (simulé) ---
      // Vérifier si l'email existe déjà (simulation)
      if (this.teamMembers.some(m => m.email.toLowerCase() === email.toLowerCase())) {
        this.inviteForm.get('email')?.setErrors({ alreadyMember: true });
        this.inviteError = "Ce membre fait déjà partie de l'équipe.";
        this.isSendingInvite = false;
        return;
      }
      // Ajout simulé à la liste
      const newMember: TeamMember = {
        id: Math.max(...this.teamMembers.map(m => m.id), 0) + 1,
        firstName: null,
        lastName: null,
        email: email,
        roleId: roleId,
        status: 'PENDING'
      };
      this.teamMembers.push(newMember);
      this.dataSource.data = [...this.teamMembers]; // Mettre à jour le tableau
      this.showInviteForm = false; // Masquer le formulaire
      this.inviteForm.reset(); // Réinitialiser le formulaire
      this.isSendingInvite = false;
      // Afficher un message de succès (ex: avec MatSnackBar)
      console.log("Invitation envoyée (simulé)");

      // --- Gestion de l'erreur (simulé) ---
      /*
      this.inviteError = "Une erreur est survenue lors de l'invitation.";
      this.isSendingInvite = false;
      */
    }, 1500); // Simule une latence réseau
  }

  // Renvoyer une invitation (pour les membres en attente)
  resendInvite(member: TeamMember): void {
    if (member.status !== 'PENDING') return;
    console.log(`TODO: Appel API pour renvoyer l'invitation à ${member.email}`);
    // Afficher un indicateur de chargement ou un message de succès/erreur
    // Exemple:
    // this.teamService.resendInvitation(member.id).subscribe(...)
    alert(`Invitation renvoyée (simulé) à ${member.email}`);
  }

  // --- Nouvelle Méthode pour ouvrir la dialogue de détails ---
  openTeamDetailDialog(member: TeamMember): void {
    const dialogRef = this.dialog.open<StaffDetailDialogComponent, StaffDialogData, StaffDialogResult>(StaffDetailDialogComponent, {
      width: '650px', // Plus large pour 2 colonnes
      maxWidth: '95vw',
      data: {
        member: { ...member }, // Passer une copie pour éviter modif directe
        availableRoles: this.availableRoles
      }
    });

    // Gérer le résultat de la dialogue
    dialogRef.afterClosed().subscribe((result: StaffDialogResult | undefined) => {
      if (!result) return; // Si fermé sans action

      switch (result.action) {
        case 'save':
          const newRoleId = result.payload;
          this.updateMemberRole(member.id, newRoleId);
          break;
        case 'resend':
          this.resendInvite(member);
          break;
        // case 'delete': // Si on mettait la suppression ici
        //     this.confirmAndDeleteMember(member);
        //     break;
        case 'close':
        default:
          // Rien à faire
          break;
      }
    });
  }

  // --- Méthode pour mettre à jour le rôle (appelée après fermeture dialogue) ---
  private updateMemberRole(memberId: number, newRoleId: number): void {
    console.log(`TODO: Appel API UPDATE ROLE pour membre ID ${memberId} vers Rôle ID ${newRoleId}`);
    // --- Simulation Succès API ---
    const index = this.teamMembers.findIndex(m => m.id === memberId);
    if (index > -1 && this.teamMembers[index].roleId !== newRoleId) {
      this.teamMembers[index].roleId = newRoleId;
      this.dataSource.data = [...this.teamMembers]; // Mettre à jour tableau
      console.log("Rôle mis à jour localement (simulé)");
      // Afficher feedback succès (SnackBar)
    }
    // --- Gérer Erreur API ---
    /* else { console.error("Erreur API ou rôle non changé"); } */
  }

  // --- Suppression (inchangée, mais renommée pour clarté) ---
  confirmAndDeleteMember(memberToDelete: TeamMember): void {
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
        console.log(`TODO: Appel API DELETE pour membre ID ${memberToDelete.id}`);
        // --- Simulation Succès API ---
        this.teamMembers = this.teamMembers.filter(m => m.id !== memberToDelete.id);
        this.dataSource.data = this.teamMembers;
        console.log("Membre retiré (simulé)");
        // --- Gérer Erreur API ---
      }
    });
  }

  // --- Méthodes d'Affichage et Utilitaires ---

  // Générer les initiales à partir du nom/prénom
  getInitials(firstName: string | null, lastName: string | null): string {
    const first = firstName?.trim()?.[0] ?? '';
    const last = lastName?.trim()?.[0] ?? '';
    return `${first}${last}` || '?'; // Retourne '?' si aucun nom/prénom
  }

  // Déterminer la couleur de fond de l'avatar basé sur l'ID
  getAvatarColor(memberId: number): string {
    const colors = ['#673AB7', '#3F51B5', '#009688', '#FF5722', '#795548', '#E91E63', '#03A9F4'];
    const index = memberId % colors.length; // Utilise modulo pour cycler dans les couleurs
    return colors[index];
  }

  // Trouver le nom d'un rôle à partir de son ID
  getRoleName(roleId: number): string {
    const role = this.availableRoles.find(r => r.id === roleId);
    return role ? role.name : 'Inconnu';
  }

  // Déterminer la couleur du MatChip basé sur l'ID du rôle
  getRoleChipColor(roleId: number): 'primary' | 'accent' | 'warn' | undefined {
    const role = this.availableRoles.find(r => r.id === roleId);
    switch (role?.key) { // Utilise la clé unique si disponible
      case 'ADMIN_STRUCTURE': return 'primary';
      case 'ORGANIZER': return 'accent';
      case 'BOOKING_SERVICE': return undefined; // Couleur par défaut (gris)
      case 'RECEPTION_AGENT': return 'warn';
      default: return undefined;
    }
  }

  // --- Logique de Permissions (Exemples simples, à adapter) ---

  // Peut-on modifier le rôle de ce membre ?
  canEditRole(member: TeamMember): boolean {
    // Exemple: Ne pas modifier son propre rôle, ne pas modifier d'autres admins si on n'est pas admin
    const currentUserId = 1; // TODO: Récupérer l'ID de l'utilisateur connecté via AuthService
    const currentUserRoleId = 1; // TODO: Récupérer le rôle de l'utilisateur connecté
    const isAdminRole = (roleId: number) => this.availableRoles.find(r => r.id === roleId)?.key === 'ADMIN_STRUCTURE';

    if (member.id === currentUserId) return false; // Ne peut pas modifier son propre rôle
    if (isAdminRole(member.roleId) && !isAdminRole(currentUserRoleId)) return false; // Seul un admin peut modifier un autre admin
    // Peut-être d'autres règles...
    return true;
  }

  canDeleteMember(member: TeamMember): boolean {
    const currentUserId = 1; // TODO: Récupérer via AuthService
    if (member.id === currentUserId) return false; // Ne pas se supprimer
    // Le backend doit vérifier si c'est le dernier admin
    return true; // On autorise le clic, la confirmation/backend gère le reste
  }
}
