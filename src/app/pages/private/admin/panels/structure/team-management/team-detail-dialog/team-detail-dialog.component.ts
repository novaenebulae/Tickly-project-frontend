import {Component, OnInit, inject, Inject} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Ajout DatePipe
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
// InputModule n'est pas strictement nécessaire si pas d'input texte, mais MatFormFieldModule l'importe souvent
// import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

// --- Interfaces (Assurez-vous qu'elles sont cohérentes dans votre projet) ---
interface Role { id: number; name: string; key?: string; }
interface TeamMember { // Renommé de StaffMember
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  roleId: number;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  dateAdded?: Date;
  lastActivity?: Date;
  phone?: string;
  position?: string;
}
export interface TeamDialogData { // Renommé de StaffDialogData
  member: TeamMember;
  availableRoles: Role[];
}
export interface TeamDialogResult { // Renommé de StaffDialogResult
  action: 'save' | 'delete' | 'resend' | 'close';
  payload?: any;
}

@Component({
  selector: 'app-team-detail-dialog', // Renommé
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    /* MatInputModule, */ MatButtonModule, MatIconModule, MatSelectModule,
    MatDividerModule, MatListModule, MatChipsModule, MatTooltipModule,
    DatePipe // Ajouté pour le pipe date
  ],
  template: `
  <div mat-dialog-title class="d-flex align-items-center gap-3 border-bottom pb-2 mb-4 mt-3"> <!-- Marge mb-4 ajoutée -->
     <!-- Avatar (plus grand) -->
     <div class="team-avatar-large" [style.background-color]="getAvatarColor(data.member.id)">
        {{ getInitials(data.member.firstName, data.member.lastName) || '?' }}
     </div>
     <!-- Nom & Email -->
     <div>
       <h2 class="mat-headline-6 mb-0">
         {{ data.member.firstName || '' }} {{ data.member.lastName || 'Utilisateur invité' }}
       </h2>
       <p class="mat-body-2 text-muted mb-0">{{ data.member.email }}</p>
     </div>
     <!-- Bouton Fermer -->
      <button mat-icon-button class="ms-auto" (click)="onClose()" matTooltip="Fermer" aria-label="Fermer la dialogue">
        <mat-icon>close</mat-icon>
      </button>
  </div>

  <mat-dialog-content>
    <form [formGroup]="detailForm">
      <div class="row">
        <!-- Colonne Gauche: Infos & Rôle -->
        <div class="col-md-6">
          <h3 class="mat-subheader">Informations Structure</h3>
          <mat-list dense>
            <mat-list-item class="h-auto">
              <mat-icon matListItemIcon class="icon-muted">assignment_ind</mat-icon>
              <span matListItemTitle>Rôle</span>
              <span matListItemLine>
                    <!-- Select pour modifier le rôle -->
                    <mat-form-field appearance="outline" class="w-100 mb-0 role-select-field mt-3" subscriptSizing="dynamic">
                        <mat-label>Modifier le rôle</mat-label>
                      <!-- AJOUT de panelClass ici -->
                        <mat-select formControlName="roleId" required panelClass="role-select-panel">
                          @for (role of data.availableRoles; track role.id) {
                            <mat-option [value]="role.id">{{ role.name }}</mat-option>
                          }
                        </mat-select>
                      @if (detailForm.get('roleId')?.hasError('required')) {
                        <mat-error>Le rôle est requis</mat-error>
                      }
                    </mat-form-field>
                    </span>
                 </mat-list-item>
                 <mat-list-item>
                   <mat-icon matListItemIcon class="icon-muted">calendar_today</mat-icon>
                   <span matListItemTitle>Membre depuis</span>
                   <span matListItemLine>{{ (data.member.dateAdded | date:'dd/MM/yyyy') || 'N/A' }}</span>
                 </mat-list-item>
                  <mat-list-item>
                    <mat-icon matListItemIcon class="icon-muted">update</mat-icon>
                    <span matListItemTitle>Dernière activité</span>
                    <span matListItemLine>{{ (data.member.lastActivity | date:'medium') || 'Aucune' }}</span>
                  </mat-list-item>
                  <mat-list-item>
                     <mat-icon matListItemIcon class="icon-muted">visibility</mat-icon>
                     <span matListItemTitle>Statut</span>
                     <span matListItemLine>
                       <mat-chip [color]="getStatusChipColor(data.member.status)" density="-2" selected disabled>
                          {{ getStatusText(data.member.status) }}
                       </mat-chip>
                     </span>
                  </mat-list-item>
              </mat-list>
          </div>

           <!-- Colonne Droite: Infos Profil (Simulé) -->
          <div class="col-md-6">
             <h3 class="mat-subheader">Profil Utilisateur (Simulé)</h3>
             <mat-list dense>
               <mat-list-item>
                 <mat-icon matListItemIcon class="icon-muted">phone</mat-icon>
                 <span matListItemTitle>Téléphone</span>
                 <span matListItemLine>{{ data.member.phone || 'Non renseigné' }}</span>
               </mat-list-item>
               <mat-list-item>
                 <mat-icon matListItemIcon class="icon-muted">work_outline</mat-icon>
                 <span matListItemTitle>Poste / Fonction</span>
                 <span matListItemLine>{{ data.member.position || 'Non spécifié' }}</span>
               </mat-list-item>
             </mat-list>
          </div>
       </div>
    </form>
  </mat-dialog-content>

  <mat-dialog-actions align="end" class="pt-3 mt-3 border-top"> <!-- mt-3 ajouté -->
    <!-- Bouton Renvoyer Invitation (si PENDING) -->
    @if (data.member.status === 'PENDING') {
      <button mat-stroked-button color="accent" (click)="onResendInvite()" class="me-auto">
          <mat-icon>outgoing_mail</mat-icon>
          Renvoyer l'invitation
      </button>
    }

    <!-- Bouton Enregistrer (si rôle changé) -->
    <button mat-raised-button color="primary"
            [disabled]="detailForm.invalid || !isRoleChanged()"
            (click)="onSave()">
      <mat-icon>save</mat-icon>
      Enregistrer
    </button>
  </mat-dialog-actions>
  `,
  // Styles spécifiques à la dialogue
  styles: [`
    // --- Styles En-tête (Avatar, etc.) ---
    .team-avatar-large {
      width: 64px; height: 64px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; color: white;
      font-weight: 500; font-size: 1.8rem; flex-shrink: 0; text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .mat-mdc-list-item-icon { margin-right: 16px !important; }
    .icon-muted { color: rgba(0,0,0,0.54); }

    // --- Styles pour le MatFormField du Select ---
    // Cibler spécifiquement les form-fields dans la mat-list pour éviter effets de bord
    mat-list mat-form-field.role-select-field {
      // Garantir la hauteur standard du conteneur outline
      --mdc-outlined-text-field-container-height: 56px;
      margin-bottom: 0; // Pas de marge superflue dans la liste
      width: 100%;      // Prend toute la largeur disponible dans la cellule de liste
    }

    // Ajustement mineur pour l'alignement vertical du texte sélectionné si nécessaire
    mat-list mat-form-field.role-select-field .mat-mdc-select-value {
       // padding-top: 0 !important; // Généralement plus nécessaire si hauteur standard est bonne
    }
  `]
})
export class TeamDetailDialogComponent implements OnInit { // Renommé
  detailForm: FormGroup;
  initialRoleId: number;
  // Palette couleurs avatar
  private avatarColors = ['#673AB7', '#3F51B5', '#009688', '#FF5722', '#795548', '#E91E63', '#03A9F4'];

  constructor(
    public dialogRef: MatDialogRef<TeamDetailDialogComponent, TeamDialogResult>, // Renommé
    @Inject(MAT_DIALOG_DATA) public data: TeamDialogData, // Renommé
    private fb: FormBuilder
  ) {
    this.detailForm = this.fb.group({
      roleId: [this.data.member.roleId, Validators.required]
    });
    this.initialRoleId = this.data.member.roleId;

    // Simuler données manquantes (inchangé)
    this.data.member.dateAdded = this.data.member.dateAdded ?? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    this.data.member.lastActivity = this.data.member.lastActivity ?? (this.data.member.status === 'ACTIVE' ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) : undefined);
    this.data.member.phone = this.data.member.phone ?? (Math.random() > 0.5 ? `06 XX XX XX ${Math.floor(Math.random()*90)+10}`: undefined);
    this.data.member.position = this.data.member.position ?? (Math.random() > 0.3 ? this.data.availableRoles.find(r=>r.id === this.data.member.roleId)?.name : undefined);
  }

  ngOnInit(): void { }

  isRoleChanged(): boolean { return this.detailForm.get('roleId')?.value !== this.initialRoleId; }

  onSave(): void {
    if (this.detailForm.valid && this.isRoleChanged()) {
      this.dialogRef.close({ action: 'save', payload: this.detailForm.value.roleId });
    }
  }

  onClose(): void { this.dialogRef.close({ action: 'close' }); }
  onResendInvite(): void { this.dialogRef.close({ action: 'resend' }); }

/* --- Optionnel : Si on déplace la suppression ici ---
onDelete(): void {
   // Ici, on devrait ouvrir la dialogue de Confirmation
   // Si confirmé, on ferme CE dialogue avec action: 'delete'
   // this.dialogRef.close({ action: 'delete' });
}
*/

  // --- Fonctions utilitaires (dupliquées ou importées) ---
  getInitials(firstName: string | null, lastName: string | null): string {
    const first = firstName?.trim()?.[0] ?? '';
    const last = lastName?.trim()?.[0] ?? '';
    return `${first}${last}` || '?';
  }

  getAvatarColor(memberId: number): string {
    const index = memberId % this.avatarColors.length;
    return this.avatarColors[index];
  }

  getStatusText(status: TeamMember['status']): string {
    switch(status) {
      case 'ACTIVE': return 'Actif';
      case 'PENDING': return 'En attente';
      case 'INACTIVE': return 'Inactif';
      default: return 'Inconnu';
    }
  }

  getStatusChipColor(status: TeamMember['status']): 'primary' | 'accent' | 'warn' | undefined {
    switch(status) {
      case 'ACTIVE': return 'primary'; // Vert implicite via primary? ou une autre couleur
      case 'PENDING': return 'accent'; // Orange/Jaune
      case 'INACTIVE': return undefined; // Gris (défaut)
      default: return undefined;
    }
  }
}
