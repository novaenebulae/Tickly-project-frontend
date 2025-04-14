import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  notification = inject(NotificationService);
  router: Router = inject(Router);
  authService = inject(AuthService);

  formulaire = this.formBuilder.group({
    email: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['root', Validators.required],
  });

  onLogin() {
    
    if (this.formulaire.valid) {

      const credentials = {
        email: this.formulaire.value.email || null,
        password: this.formulaire.value.password || null,
      };

      this.authService.login(credentials).subscribe({
        next: (jwt) => {
          localStorage.setItem('jwt', jwt);
          this.router.navigateByUrl('/admin/dashboard');
        },
        error: (error) => {
          if (error.status === 401) {
            this.notification.displayNotification(
              "Erreur d'authentification",
              'error',
              'Fermer'
            );
          }
        },
      });
    }
  }

  onLogout() {
    localStorage.removeItem('jwt');
    this.router.navigateByUrl('/login');
  }
}
