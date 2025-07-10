/**
 * @file Service for managing and displaying snack-bar notifications to the user.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {inject, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar} from '@angular/material/snack-bar';

/**
 * Defines the supported types of notifications, which usually correspond to CSS classes for styling.
 * @example 'valid' for success messages, 'error' for error messages.
 */
export type NotificationType = 'valid' | 'error' | 'warning' | 'info';

/**
 * Service responsible for displaying temporary messages (snackbars) to the user.
 * It centralizes the notification logic, making it easy to provide consistent user feedback.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Displays a snackbar notification to the user.
   *
   * @param message - The primary message to be displayed in the notification.
   * @param type - The type of notification, determining its visual style (e.g., 'valid', 'error'). Defaults to 'info'.
   * @param action - The text for the action button on the snackbar (e.g., 'Fermer', 'Undo'). Defaults to 'Fermer'.
   * @param duration - The duration in milliseconds for which the notification should be visible. Defaults to 5000ms.
   * @returns A reference to the opened snackbar, allowing for manual dismissal or observation of events.
   */
  displayNotification(
    message: string,
    type: NotificationType = 'info',
    action: string = 'Fermer', // Default action text in French
    duration: number = 5000
  ): MatSnackBarRef<TextOnlySnackBar> { // Type the return for better usability
    const config: MatSnackBarConfig = {
      duration: duration,
      verticalPosition: 'bottom', // Consistent positioning
      horizontalPosition: 'center', // Consistent positioning
      panelClass: [type], // Applies CSS class based on notification type for styling
    };

    return this.snackBar.open(message, action, config);
  }
}
