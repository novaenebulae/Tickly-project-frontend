import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { AuthService } from '../../../core/services/domain/user/auth.service';
import { StructureService } from '../../../core/services/domain/structure/structure.service';

// Models
import { UserRegistrationDto } from '../../../core/models/user/user.model';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private structureService = inject(StructureService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group(
      {
        // Initialiser avec des valeurs vides, pas de localStorage
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]], // Validation passwordMatch s'en occupe
        createStructure: [false],
      },
      { validators: this.passwordMatchValidator } // Validateur pour le groupe
    );
  }

  // Validateur personnalisé pour la confirmation du mot de passe
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    // Ne retourner une erreur que si les deux champs sont remplis ET différents
    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Si les mots de passe correspondent ou qu'un champ est vide, retirer l'erreur potentielle
      const confirmPasswordControl = control.get('confirmPassword');
      if (confirmPasswordControl?.hasError('passwordMismatch')) {
        const errors = confirmPasswordControl.errors ?? {};
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPasswordControl.setErrors(null);
        } else {
          confirmPasswordControl.setErrors(errors);
        }
      }
      return null;
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(current => !current);
  }

  onSubmit(): void {
    this.registerForm.markAllAsTouched(); // Marquer pour afficher les erreurs si soumission invalide

    if (this.registerForm.invalid) {
      console.warn('Registration form is invalid.');
      return;
    }

    this.isLoading.set(true);

    const newUserRegistration: UserRegistrationDto = {
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      createStructure: this.registerForm.get('createStructure')?.value ?? false,
    };

    console.log('Submitting registration:', newUserRegistration);

    this.authService.register(newUserRegistration, false).subscribe({
      next: () => {
        // Exécuté si l'observable de register se complète SANS erreur
        console.log(
          'RegisterPageComponent: Registration successful (navigation handled by AuthService).'
        );
        // Si la navigation réussit, ce composant sera détruit.
        // Si elle échoue, on arrête le spinner.
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Component received registration error:', err);
        this.isLoading.set(false);
      },
    });
  }

  // Méthode pour annuler et retourner à l'accueil
  onCancel(): void {
    console.log('Cancel button clicked');
    this.router.navigate(['/home']);
  }
}
