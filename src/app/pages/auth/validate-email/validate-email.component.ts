import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthApiService } from '../../../core/services/api/auth/auth-api.service';
import { AuthService } from '../../../core/services/domain/user/auth.service';

@Component({
  selector: 'app-validate-email',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './validate-email.component.html',
  styleUrl: './validate-email.component.scss'
})
export class ValidateEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authApiService = inject(AuthApiService);
  private authService = inject(AuthService);

  isLoading = signal(true);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    // Récupération du token depuis les paramètres de requête (query parameters)
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.validateEmail(token);
      } else {
        this.handleError('Token manquant dans l\'URL');
      }
    });
  }

  /**
   * Valide l'email de l'utilisateur en utilisant le service AuthApiService
   * @param token - Token de validation d'email
   */
  private validateEmail(token: string): void {
    this.authApiService.validateEmail(token).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isSuccess.set(true);

        // Si un token est retourné, mettre à jour l'état de l'utilisateur
        if (response.accessToken) {
          // Stocker le token et mettre à jour l'état de l'utilisateur
          this.authService.updateTokenAndState(response.accessToken);

          // Si l'utilisateur a besoin de configurer une structure, il sera redirigé
          // vers la page de configuration de structure par le AuthService.navigateAfterLogin
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.handleError(error.message || 'La validation de votre email a échoué.');
      }
    });
  }

  /**
   * Gère les erreurs de validation d'email
   * @param message - Message d'erreur
   */
  private handleError(message: string): void {
    this.isLoading.set(false);
    this.isSuccess.set(false);
    this.errorMessage.set(message);
    // Pas besoin d'afficher une notification, déjà géré par AuthApiService.handleAuthError
  }

  /**
   * Navigue vers la page de connexion
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navigue vers la page d'accueil
   */
  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}
