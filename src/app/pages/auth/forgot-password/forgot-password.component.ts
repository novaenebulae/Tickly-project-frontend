import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../../../core/services/domain/user/auth.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ForgotPasswordComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  // Signal pour indiquer si la requête est en cours
  isLoading = signal(false);

  // Signal pour indiquer si l'email a été envoyé avec succès
  isSuccess = signal(false);

  // Formulaire de demande de réinitialisation
  forgotPasswordForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  /**
   * Gère la soumission du formulaire de demande de réinitialisation
   */
  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading.set(true);
      const email = this.forgotPasswordForm.value.email;

      this.authService.requestPasswordReset(email)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSuccess.set(true);
          this.cdRef.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors de la demande de réinitialisation:', error);
          this.isLoading.set(false);
          this.cdRef.markForCheck();
          // Pas besoin de message d'erreur spécifique car le service affiche déjà une notification
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  /**
   * Réinitialise le formulaire et l'état du composant
   */
  resetForm(): void {
    this.forgotPasswordForm.reset();
    this.isSuccess.set(false);
  }

  /**
   * Navigue vers la page de connexion
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
