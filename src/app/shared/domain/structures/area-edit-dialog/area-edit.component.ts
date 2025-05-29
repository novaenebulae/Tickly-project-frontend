import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import {StructureAreaModel} from '../../../../core/models/structure/structure-area.model';

// Interface pour les données injectées dans le dialogue
interface AreaDialogData {
  area: StructureAreaModel | null; // null pour la création, objet pour l'édition
  structureId: number;
}

@Component({
  selector: 'app-area-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="mx-3 my-4">
      <!-- Titre dynamique : Ajouter ou Modifier -->
      <h2 mat-dialog-title>
        {{ data.area ? 'Modifier l\'Espace' : 'Ajouter un Espace' }}
      </h2>
      <mat-dialog-content>
        <!-- Formulaire Reactif -->
        <form [formGroup]="areaForm" class="d-flex flex-column gap-2 pt-2">
          <!-- Champ Nom -->
          <mat-form-field appearance="outline">
            <mat-label>Nom de l'espace</mat-label>
            <input matInput formControlName="name" required cdkFocusInitial />
            @if (areaForm.get('name')?.hasError('required') &&
            areaForm.get('name')?.touched) {
            <mat-error>Le nom est obligatoire</mat-error>
            }
          </mat-form-field>

          <!-- Champ Description -->
          <mat-form-field appearance="outline">
            <mat-label>Description (optionnelle)</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="3"
              placeholder="Décrivez cet espace...">
            </textarea>
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
            @if (areaForm.get('maxCapacity')?.hasError('required') &&
            areaForm.get('maxCapacity')?.touched) {
            <mat-error>La capacité est obligatoire</mat-error>
            }
            @if (areaForm.get('maxCapacity')?.hasError('min') &&
            areaForm.get('maxCapacity')?.touched) {
            <mat-error>La capacité doit être positive ou nulle</mat-error>
            }
          </mat-form-field>

          <!-- Checkbox pour le statut actif -->
          <mat-checkbox formControlName="isActive" class="mt-2">
            Espace actif
          </mat-checkbox>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <!-- Bouton Annuler -->
        <button mat-button (click)="onCancel()">Annuler</button>
        <!-- Bouton Enregistrer/Ajouter (désactivé si formulaire invalide) -->
        <button
          mat-raised-button
          color="primary"
          [disabled]="areaForm.invalid"
          (click)="onSave()"
        >
          {{ data.area ? 'Enregistrer' : 'Ajouter' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class AreaEditDialogComponent implements OnInit {
  areaForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor(
    public dialogRef: MatDialogRef<AreaEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AreaDialogData
  ) {
    // Initialisation du formulaire avec les contrôles et validateurs
    this.areaForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      maxCapacity: [null, [Validators.required, Validators.min(0)]],
      isActive: [true], // Par défaut, un nouvel espace est actif
    });
  }

  ngOnInit(): void {
    // Si des données d'area existent (mode édition), remplir le formulaire
    if (this.data.area) {
      this.areaForm.patchValue({
        name: this.data.area.name,
        description: this.data.area.description || '',
        maxCapacity: this.data.area.maxCapacity,
        isActive: this.data.area.isActive,
      });
    }
  }

  /**
   * Méthode pour annuler et fermer le dialogue
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Méthode pour sauvegarder les modifications
   */
  onSave(): void {
    if (this.areaForm.valid) {
      const formValues = this.areaForm.value;

      // Créer l'objet AreaModel avec toutes les propriétés nécessaires
      const areaData: StructureAreaModel = {
        id: this.data.area?.id || 0, // 0 pour la création, l'ID sera généré par le backend
        name: formValues.name,
        description: formValues.description || undefined,
        maxCapacity: formValues.maxCapacity,
        isActive: formValues.isActive,
        structureId: this.data.structureId,
      };

      this.dialogRef.close(areaData);
    }
  }
}
