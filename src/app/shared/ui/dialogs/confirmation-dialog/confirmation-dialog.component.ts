import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

/**
 * Interface pour les données passées au dialogue de confirmation
 */
export interface ConfirmationDialogData {
  title?: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'primary' | 'accent' | 'warn';
}

/**
 * Composant de dialogue de confirmation réutilisable
 * Utilise les dernières pratiques Angular 19 avec l'injection moderne
 */
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  styleUrls: ['./confirmation-dialog.component.scss'],
  template: `
    <div class="mx-3 mt-4 mb-3">
      <h2 mat-dialog-title class="d-flex align-items-center gap-4">
        <!-- Icône d'avertissement -->
        <mat-icon [color]="getIconColor()" class="dialog-icon">
          {{ getDialogIcon() }}
        </mat-icon>
        <!-- Titre (ou titre par défaut) -->
        {{ data.title || 'Confirmation' }}
      </h2>

      <mat-dialog-content>
        <!-- Message de confirmation -->
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <!-- Bouton Annuler -->
        <button mat-button (click)="onDismiss()">
          {{ data.cancelButtonText || 'Annuler' }}
        </button>
        <!-- Bouton Confirmer -->
        <button
          mat-raised-button
          [color]="data.confirmButtonColor || 'warn'"
          (click)="onConfirm()">
          {{ data.confirmButtonText || 'Confirmer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class ConfirmationDialogComponent {

  private dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as ConfirmationDialogData;

  /**
   * Méthode appelée lors du clic sur "Confirmer"
   * Ferme le dialogue en retournant true
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  /**
   * Méthode appelée lors du clic sur "Annuler"
   * Ferme le dialogue en retournant false
   */
  onDismiss(): void {
    this.dialogRef.close(false);
  }

  /**
   * Détermine l'icône à afficher selon le type de confirmation
   */
  getDialogIcon(): string {
    switch (this.data.confirmButtonColor) {
      case 'primary':
        return 'info';
      case 'accent':
        return 'help';
      case 'warn':
      default:
        return 'warning_amber';
    }
  }

  /**
   * Détermine la couleur de l'icône selon le type de confirmation
   */
  getIconColor(): string {
    return this.data.confirmButtonColor || 'warn';
  }
}
