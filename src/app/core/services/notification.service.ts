import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notification = inject(MatSnackBar);

  displayNotification(message: string, type: "valid" | "error" | "warning" | "info" = "info", action: string) {
    this.notification.open(message, action, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [type],
    });
  }
}
