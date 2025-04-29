import {Component, OnInit, inject, Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list'; // Pour afficher les détails
import { MatChipsModule } from '@angular/material/chips'; // Pour le statut visuel
import { MatTooltipModule } from '@angular/material/tooltip';

// Interfaces (doivent être définies ou importées)
interface Role { id: number; name: string; key?: string; }
interface StaffMember {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  roleId: number;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  // --- Champs simulés pour la démo ---
  dateAdded?: Date;
  lastActivity?: Date;
  phone?: string;
  position?: string;
}
export interface StaffDialogData {
  member: StaffMember;
  availableRoles: Role[];
  // Potentiellement d'autres infos comme les permissions de l'utilisateur courant
}
// Interface pour le résultat retourné par la dialogue
export interface StaffDialogResult {
  action: 'save' | 'delete' | 'resend' | 'close';
  payload?: any; // Contient le roleId mis à jour si 'save'
}

@Component({
  selector: 'app-staff-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule, // Bien que pas d'input texte, utile pour le style form-field
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
  <div mat-dialog-title class="d-flex align-items-center gap-3 border-bottom pb-2 mb-3">
     <!-- Avatar -->
     <div class="staff-avatar-large" [style.background-color]="getAvatarColor(data.member.id)">
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
      <button mat-icon-button class="ms-auto" (click)="onClose()" matTooltip="Fermer">
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
                 <mat-list-item>
                    <mat-icon matListItemIcon class="icon-muted">assignment_ind</mat-icon>
                    <span matListItemTitle>Rôle</span>
                    <span matListItemLine>
                      <!-- Select pour modifier le rôle -->
                      <mat-form-field appearance="outline" class="w-100 mb-0 role-select-field" subscriptSizing="dynamic">
                          <mat-label>Modifier le rôle</mat-label>
                          <mat-select formControlName="roleId" required>
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
               <!-- Autres infos possibles -->
             </mat-list>
          </div>
       </div>
    </form>
  </mat-dialog-content>

  <mat-dialog-actions align="end" class="pt-3 border-top">
    <!-- Bouton Renvoyer Invitation (si PENDING) -->
    @if (data.member.status === 'PENDING') {
      <button mat-stroked-button color="accent" (click)="onResendInvite()" class="me-auto">
          <mat-icon>outgoing_mail</mat-icon>
          Renvoyer l'invitation
      </button>
    }

    <!-- Bouton Supprimer (si autorisé) -->
    <!-- <button mat-stroked-button color="warn" (click)="onDelete()" [disabled]="!canBeDeleted">
        <mat-icon>delete_outline</mat-icon>
        Supprimer le membre
    </button> -->

    <!-- Bouton Enregistrer (si rôle changé) -->
    <button mat-raised-button color="primary"
            [disabled]="detailForm.invalid || !isRoleChanged()"
            (click)="onSave()">
      <mat-icon>save</mat-icon>
      Enregistrer les modifications
    </button>
  </mat-dialog-actions>
  `,
  // Styles spécifiques à la dialogue
  styles: [`
    .staff-avatar-large {
      width: 50px; height: 50px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; color: white;
      font-weight: 500; font-size: 1.3rem; flex-shrink: 0; text-transform: uppercase;
    }
    .mat-mdc-list-item-icon { margin-right: 16px !important; }
    .icon-muted { color: rgba(0,0,0,0.54); }
    // Ajuster le champ select pour qu'il s'intègre mieux dans la liste
    .role-select-field .mat-mdc-form-field-infix { padding-top: 0.5em; padding-bottom: 0.5em; }
    .role-select-field .mat-mdc-select-value { padding-top: 0 !important; }
  `]
})
export class StaffDetailDialogComponent implements OnInit {
  detailForm: FormGroup;
  initialRoleId: number; // Pour vérifier si le rôle a changé
  // Couleurs pour les avatars (dupliqué ici ou importé d'une constante partagée)
  private avatarColors = ['#673AB7', '#3F51B5', '#009688', '#FF5722', '#795548', '#E91E63', '#03A9F4'];

  constructor(
    public dialogRef: MatDialogRef<StaffDetailDialogComponent, StaffDialogResult>, // Typer le résultat
    @Inject(MAT_DIALOG_DATA) public data: StaffDialogData,
    private fb: FormBuilder
  ) {
    // Créer le formulaire avec seulement le rôle comme contrôle modifiable
    this.detailForm = this.fb.group({
      roleId: [this.data.member.roleId, Validators.required]
    });
    // Stocker le rôle initial
    this.initialRoleId = this.data.member.roleId;

    // Simuler des données si elles manquent
    this.data.member.dateAdded = this.data.member.dateAdded ?? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    this.data.member.lastActivity = this.data.member.lastActivity ?? (this.data.member.status === 'ACTIVE' ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) : undefined);
    this.data.member.phone = this.data.member.phone ?? (Math.random() > 0.5 ? `06 XX XX XX ${Math.floor(Math.random()*90)+10}`: undefined);
    this.data.member.position = this.data.member.position ?? (Math.random() > 0.3 ? this.data.availableRoles.find(r=>r.id === this.data.member.roleId)?.name : undefined);
  }

  ngOnInit(): void { }

  // Vérifie si le rôle a été modifié par rapport à l'initial
  isRoleChanged(): boolean {
    return this.detailForm.get('roleId')?.value !== this.initialRoleId;
  }

  // Sauvegarde : retourne l'action 'save' et le nouveau roleId
  onSave(): void {
    if (this.detailForm.valid && this.isRoleChanged()) {
      this.dialogRef.close({ action: 'save', payload: this.detailForm.value.roleId });
    }
  }

  // Fermeture simple : retourne l'action 'close'
  onClose(): void {
    this.dialogRef.close({ action: 'close' });
  }

  // Renvoyer l'invitation : retourne l'action 'resend'
  onResendInvite(): void {
    this.dialogRef.close({ action: 'resend' });
  }

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

  getStatusText(status: StaffMember['status']): string {
    switch(status) {
      case 'ACTIVE': return 'Actif';
      case 'PENDING': return 'En attente';
      case 'INACTIVE': return 'Inactif';
      default: return 'Inconnu';
    }
  }

  getStatusChipColor(status: StaffMember['status']): 'primary' | 'accent' | 'warn' | undefined {
    switch(status) {
      case 'ACTIVE': return 'primary'; // Vert implicite via primary? ou une autre couleur
      case 'PENDING': return 'accent'; // Orange/Jaune
      case 'INACTIVE': return undefined; // Gris (défaut)
      default: return undefined;
    }
  }
}
