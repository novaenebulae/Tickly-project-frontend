import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';
import { AuthApiService } from '../../../core/services/api/auth/auth-api.service';
import { NotificationService } from '../../../core/services/domain/utilities/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authApiService = inject(AuthApiService);
  private notificationService = inject(NotificationService);

  // Signal pour indiquer si la requête est en cours
  isLoading = signal(false);

  // Signal pour indiquer si le mot de passe a été changé avec succès
  isSuccess = signal(false);

  // Signal pour le token récupéré de l'URL
  token = signal<string | null>(null);

  // Contrôle de l'affichage des mots de passe
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  /**
   * Formulaire de réinitialisation de mot de passe
   */
  resetPasswordForm: FormGroup = this.formBuilder.group({
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    ]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    // Récupérer le token depuis les paramètres de l'URL
    this.route.queryParamMap.subscribe(params => {
      const tokenParam = params.get('token');
      if (tokenParam) {
        this.token.set(tokenParam);
      } else {
        // Rediriger si pas de token
        this.notificationService.displayNotification('Lien de réinitialisation invalide.', 'error');
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Soumet le formulaire de réinitialisation de mot de passe
   */
  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token()) {
      this.isLoading.set(true);

      const resetData = {
        token: this.token() as string,
        newPassword: this.resetPasswordForm.value.password
      };

      this.authApiService.resetPassword(resetData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSuccess.set(true);
        },
        error: (error) => {
          console.error('Erreur lors de la réinitialisation du mot de passe:', error);
          this.isLoading.set(false);
          // Le service de notification affiche déjà un message via handleAuthError
        }
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  /**
   * Navigue vers la page de connexion
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Vérifie si le mot de passe est valide (pour l'affichage des erreurs)
   */
  isPasswordValid(): boolean {
    const passwordControl = this.resetPasswordForm.get('password');
    return !passwordControl?.hasError('required') &&
           !passwordControl?.hasError('minlength') &&
           !passwordControl?.hasError('pattern');
  }
}
