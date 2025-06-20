/**
 * @file Authentication component for user login and logout operations.
 * Handles login form validation and user authentication flow.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/domain/user/auth.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LoginCredentials } from '../../../core/models/auth/auth.model';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  styleUrls: ['./auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  /**
   * Signal indicating whether login operation is in progress
   */
  isLoading = signal(false);

  /**
   * Signal controlling password field visibility
   */
  hidePassword = signal(true);

  /**
   * Reactive access to authentication state from AuthService
   */
  readonly isLoggedIn = this.authService.isLoggedIn;

  /**
   * Login form with email, password and keepLoggedIn fields
   */
  formulaire = this.formBuilder.group({
    email: ['grace.martin@example.com', [Validators.required, Validators.email]],
    password: ['password123', Validators.required],
    keepLoggedIn: [false],
  });

  /**
   * Handles user login form submission
   */
  onLogin(): void {
    this.formulaire.markAllAsTouched();

    if (this.formulaire.valid) {
      this.isLoading.set(true);

      const credentials: LoginCredentials = {
        email: this.formulaire.value.email || '',
        password: this.formulaire.value.password || '',
      };

      const keepLoggedIn = Boolean(this.formulaire.value.keepLoggedIn);

      this.authService.login(credentials, keepLoggedIn).subscribe({
        next: (success) => {
          if (success) {
            console.log('AuthComponent: Login successful (navigation handled by AuthService).');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('AuthComponent: Login error:', err);
          this.isLoading.set(false);
        },
      });
    } else {
      console.warn('AuthComponent: Login form is invalid');
    }
  }

  /**
   * Handles user logout
   */
  onLogout(): void {
    this.authService.logout();
  }

  /**
   * Gets validation error message for a specific form control
   * @param controlName - Name of the form control
   * @returns Error message string or empty string if no error
   */
  getErrorMessage(controlName: string): string {
    const control = this.formulaire.get(controlName);
    if (!control) return '';

    if (control.errors?.['required']) {
      return 'Ce champ est obligatoire';
    }

    if (control.errors?.['email']) {
      return 'Veuillez saisir une adresse email valide';
    }

    return '';
  }
}
