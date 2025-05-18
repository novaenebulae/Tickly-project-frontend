// src/app/core/services/domain/notification.service.ts

import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Types de notifications supportés
 */
export type NotificationType = 'valid' | 'error' | 'warning' | 'info';

/**
 * Service de gestion des notifications
 * Affiche des messages temporaires à l'utilisateur via des snackbars
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Affiche une notification sous forme de snackbar
   * @param message Message à afficher
   * @param type Type de notification (style visuel)
   * @param action Texte du bouton d'action
   * @param duration Durée d'affichage en ms (optionnel, par défaut 5000ms)
   */
  displayNotification(
    message: string,
    type: NotificationType = 'info',
    action: string = 'Fermer',
    duration: number = 5000
  ): void {
    const config: MatSnackBarConfig = {
      duration: duration,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [type],
    };

    this.snackBar.open(message, action, config);
  }
}
