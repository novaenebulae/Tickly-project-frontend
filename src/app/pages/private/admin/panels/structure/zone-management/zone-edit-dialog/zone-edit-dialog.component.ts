import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ZoneDialogData} from '../../../../../../../core/models/ui/dialog-data.model';

@Component({
  selector: 'app-zone-edit-dialog', // Sélecteur CSS
  standalone: true, // Composant autonome
  imports: [
    // Modules nécessaires
    CommonModule,
    ReactiveFormsModule, // Pour FormGroup, FormControlName
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  // Template HTML intégré
  template: `
    <div class="mx-3 my-4">
      <!-- Titre dynamique : Ajouter ou Modifier -->
      <h2 mat-dialog-title>
        {{ data.zone ? 'Modifier la Zone' : 'Ajouter une Zone' }}
      </h2>
      <mat-dialog-content>
        <!-- Formulaire Reactif -->
        <form [formGroup]="zoneForm" class="d-flex flex-column gap-2 pt-2">
          <!-- Champ Nom -->
          <mat-form-field appearance="outline">
            <mat-label>Nom de la zone</mat-label>
            <input matInput formControlName="name" required cdkFocusInitial />
            <!-- Message d'erreur si le nom est requis mais vide et touché -->
            @if (zoneForm.get('name')?.hasError('required') &&
            zoneForm.get('name')?.touched) {
            <mat-error>Le nom est obligatoire</mat-error>
            }
          </mat-form-field>
          <!-- Champ Capacité Max -->
          <mat-form-field appearance="outline">
            <mat-label>Capacité maximale</mat-label>
            <input
              matInput
              type="number"
              formControlName="maxCapacity"
              required
              min="0"
            />
            <!-- Message d'erreur si la capacité est requise mais vide et touchée -->
            @if (zoneForm.get('maxCapacity')?.hasError('required') &&
            zoneForm.get('maxCapacity')?.touched) {
            <mat-error>La capacité est obligatoire</mat-error>
            }
            <!-- Message d'erreur si la capacité est négative et touchée -->
            @if (zoneForm.get('maxCapacity')?.hasError('min') &&
            zoneForm.get('maxCapacity')?.touched) {
            <mat-error>La capacité doit être positive ou nulle</mat-error>
            }
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <!-- Bouton Annuler -->
        <button mat-button (click)="onCancel()">Annuler</button>
        <!-- Bouton Enregistrer/Ajouter (désactivé si formulaire invalide) -->
        <button
          mat-raised-button
          color="primary"
          [disabled]="zoneForm.invalid"
          (click)="onSave()"
        >
          {{ data.zone ? 'Enregistrer' : 'Ajouter' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class ZoneEditDialogComponent implements OnInit {
  zoneForm: FormGroup; // Le formulaire Fréactif
  private fb = inject(FormBuilder); // Injection de FormBuilder via inject()

  constructor(
    public dialogRef: MatDialogRef<ZoneEditDialogComponent>, // Référence au dialogue
    @Inject(MAT_DIALOG_DATA) public data: ZoneDialogData // Données injectées (zone ou null)
  ) {
    // Initialisation du formulaire avec les contrôles et validateurs
    this.zoneForm = this.fb.group({
      name: ['', Validators.required], // Champ nom, obligatoire
      maxCapacity: [null, [Validators.required, Validators.min(0)]], // Champ capacité, obligatoire et >= 0
      // Le statut 'isActive' n'est pas dans ce formulaire, il sera géré séparément
    });
  }

  // Hook appelé après l'initialisation
  ngOnInit(): void {
    // Si des données de zone existent (mode édition), remplir le formulaire
    if (this.data.zone) {
      this.zoneForm.patchValue({
        name: this.data.zone.name,
        maxCapacity: this.data.zone.maxCapacity,
      });
    }
  }

  // Méthode pour annuler et fermer la dialogue
  onCancel(): void {
    this.dialogRef.close(); // Ne retourne aucune donnée
  }

  // Méthode pour sauvegarder et fermer la dialogue
  onSave(): void {
    // Vérifie si le formulaire est valide
    if (this.zoneForm.valid) {
      // Prépare les données à retourner :
      // Commence avec les données existantes (pour conserver id, isActive si en édition)
      // puis écrase avec les valeurs du formulaire (name, maxCapacity).
      const resultData: Partial<Zone> = {
        // Utilise Partial<Zone> pour flexibilité
        ...(this.data.zone ?? {}), // Copie les propriétés existantes (id, isActive...) ou un objet vide si ajout
        name: this.zoneForm.value.name,
        maxCapacity: this.zoneForm.value.maxCapacity,
      };
      this.dialogRef.close(resultData); // Retourne les données combinées
    }
  }
}

// Assurez-vous que l'interface Zone est définie quelque part, par exemple:
interface Zone {
  id: number;
  name: string;
  maxCapacity: number;
  isActive: boolean;
}
