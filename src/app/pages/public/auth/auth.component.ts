import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
  formBuilder = inject(FormBuilder);
  router: Router = inject(Router);
  authService = inject(AuthService);
  isLoading = false;
  hidePassword = true;

  formulaire = this.formBuilder.group({
    email: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['rootroot', Validators.required],
    keepLoggedIn: [false],
  });

  onLogin(): void {
    this.formulaire.markAllAsTouched();
    localStorage.setItem('keepLoggedIn', this.formulaire.value.keepLoggedIn?.toString() || 'false');
    if (this.formulaire.valid) {
      this.isLoading = true;
      const credentials = {
        email: this.formulaire.value.email || null,
        password: this.formulaire.value.password || null,
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          console.log(
            'AuthComponent: Login call successful (navigation handled by AuthService).'
          );
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Login Component Error:', err);
          this.isLoading = false;
        },
      });
    } else {
      console.warn('Login form is invalid');
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
