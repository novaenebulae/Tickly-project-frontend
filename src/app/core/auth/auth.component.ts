import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from '../services/notification.service'; // Vérifier le chemin
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Vérifier le chemin
import { CommonModule } from '@angular/common'; // Ajouter pour *ngIf etc.
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Ajouter spinner

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html', // Fichier HTML [2]
  standalone: true, // Ajouter si c'est un composant standalone
  imports: [
    CommonModule, // Ajouter
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatProgressSpinnerModule, // Ajouter
  ],
  styleUrls: ['./auth.component.scss'], // 'styleUrls' avec '[]'
})
export class AuthComponent implements OnInit {
  // Implémenter OnInit

  formBuilder = inject(FormBuilder);
  // http = inject(HttpClient); // Probablement pas besoin ici, AuthService l'utilise
  router: Router = inject(Router);
  authService = inject(AuthService);
  // notification = inject(NotificationService); // Probablement pas besoin ici, AuthService l'utilise
  isLoading = false; // Pour le spinner
  hidePassword = true; // Pour le bouton show/hide password

  formulaire = this.formBuilder.group({
    email: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['rootroot', Validators.required],
  });

  // ngOnInit doit être une méthode de la classe
  ngOnInit(): void {
    // Le formulaire est déjà initialisé ci-dessus lors de la déclaration
    // Vous pouvez ajouter d'autres logiques d'initialisation ici si nécessaire
  } // <<<=== Fin de ngOnInit

  // onLogin doit être une méthode de la classe
  onLogin(): void {
    this.formulaire.markAllAsTouched();
    if (this.formulaire.valid) {
      this.isLoading = true; // Démarrer le spinner
      const credentials = {
        email: this.formulaire.value.email || null,
        password: this.formulaire.value.password || null,
      };

      // Appeler login ET S'ABONNER (subscribe)
      this.authService.login(credentials).subscribe({
        next: () => {
          // Exécuté si l'observable de login se complète SANS erreur
          // La redirection est gérée par AuthService. On arrête le spinner ici par sécurité.
          console.log(
            'AuthComponent: Login call successful (navigation handled by AuthService).'
          ); // LOG 5
          // Si la navigation réussit, ce composant sera détruit.
          // Si elle échoue (et qu'on reste ici), on arrête le spinner.
          this.isLoading = false; // <<<=== AJOUT IMPORTANT
        },
        error: (err) => {
          console.error('Login Component Error:', err);
          this.isLoading = false; // Déjà présent, mais on garde
        },
      });
    } else {
      console.warn('Login form is invalid');
    }
  } // <<<=== Fin de onLogin

  // onLogout doit être une méthode de la classe
  onLogout(): void {
    this.authService.logout();
  } // <<<=== Fin de onLogout
} // <<<=== Fin de la classe AuthComponent
