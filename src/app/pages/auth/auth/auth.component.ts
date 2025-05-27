import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService} from '../../../core/services/domain/user/auth.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LoginCredentials} from '../../../core/models/auth/auth.model';

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

  // Signaux pour l'état du composant
  isLoading = signal(false);
  hidePassword = signal(true);

  // Accès aux signaux exposés par AuthService
  readonly isLoggedIn = this.authService.isLoggedIn;

  formulaire = this.formBuilder.group({
    email: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['rootroot', Validators.required],
    keepLoggedIn: [false],
  });

  onLogin(): void {
    this.formulaire.markAllAsTouched();

    // Définir la préférence "Se souvenir de moi" dans le service
    this.authService.setKeepLoggedIn(Boolean(this.formulaire.value.keepLoggedIn));

    if (this.formulaire.valid) {
      this.isLoading.set(true);

      const credentials: LoginCredentials = {
        email: this.formulaire.value.email || null,
        password: this.formulaire.value.password || null,
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          console.log('AuthComponent: Login call successful (navigation handled by AuthService).');
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Login Component Error:', err);
          this.isLoading.set(false);
        },
      });
    } else {
      console.warn('Login form is invalid');
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

  // Helper pour accéder aux erreurs du formulaire dans le template
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
