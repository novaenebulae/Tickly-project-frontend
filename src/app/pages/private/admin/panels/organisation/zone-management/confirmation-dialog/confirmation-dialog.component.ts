import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Interface pour les données attendues par ce dialogue
export interface ConfirmationDialogData {
  title: string; // Titre de la fenêtre modale
  message: string; // Message/question à afficher
  confirmButtonText?: string; // Texte optionnel pour le bouton de confirmation
  cancelButtonText?: string; // Texte optionnel pour le bouton d'annulation
}

@Component({
  selector: 'app-confirmation-dialog', // Sélecteur CSS
  standalone: true, // Composant autonome
  imports: [
    // Modules nécessaires pour le template
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  // Template HTML directement dans le fichier TS
  template: `
    <div class="mx-3 my-4">
      <h2 mat-dialog-title class="d-flex align-items-center gap-2">
        <!-- Icône d'avertissement -->
        <mat-icon color="warn">warning_amber</mat-icon>
        <!-- Titre (ou titre par défaut) -->
        {{ data.title || 'Confirmation' }}
      </h2>
      <mat-dialog-content>
        <!-- Message de confirmation -->
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <!-- Bouton Annuler (texte par défaut si non fourni) -->
        <button mat-button (click)="onDismiss()">
          {{ data.cancelButtonText || 'Annuler' }}
        </button>
        <!-- Bouton Confirmer (texte par défaut si non fourni) -->
        <button mat-raised-button color="warn" (click)="onConfirm()">
          {{ data.confirmButtonText || 'Confirmer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class ConfirmationDialogComponent {
  // Injection de la référence au dialogue actuel et des données passées
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>, // Référence pour contrôler la dialogue
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData // Données injectées (title, message...)
  ) {}

  // Méthode appelée lors du clic sur "Confirmer"
  onConfirm(): void {
    this.dialogRef.close(true); // Ferme la dialogue en retournant 'true'
  }

  // Méthode appelée lors du clic sur "Annuler"
  onDismiss(): void {
    this.dialogRef.close(false); // Ferme la dialogue en retournant 'false'
  }
}
