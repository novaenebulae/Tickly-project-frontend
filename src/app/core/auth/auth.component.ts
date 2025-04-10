import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  styleUrl: './auth.component.scss',
})

export class AuthComponent {
  formBuilder = inject(FormBuilder);
  http = inject(HttpClient);
  notification = inject(NotificationService)

  formulaire = this.formBuilder.group({
    mail: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['root', Validators.required],
  });

  onLogin() {
    if (this.formulaire.valid) {
      this.http
        .post('http://localhost:8080/login', this.formulaire.value, {
          responseType: 'text',
        })
        .subscribe({
          next: (jwt) => console.log(jwt),
          error: error => {
            if(error.status === 401) {
            }
          this.notification.displayNotification("Erreur d'authentification", "error", "Fermer");
          },
        });
    }
  }
}
