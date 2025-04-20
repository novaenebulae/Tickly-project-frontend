import { Component, OnInit, inject } from '@angular/core'; // Ajout inject
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
// import { MatSnackBar } from '@angular/material/snack-bar'; // AuthService gère les notifs
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service'; // Vérifier le chemin
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Pour le spinner

// Interface pour la clarté, même si non strictement nécessaire ici
interface UserRegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Rendre optionnel car non envoyé si confirm ne matche pas
  createStructure: boolean;
}

@Component({
  selector: 'app-register-page',
  standalone: true, // Assurez-vous que c'est bien standalone
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
    MatProgressSpinnerModule, // Importer le spinner
  ],
  templateUrl: './register-page.component.html', // Fichier HTML [4]
  styleUrls: ['./register-page.component.scss'], // Corrigé 'styleUrl' en 'styleUrls' avec '[]'
})
export class RegisterPageComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  isLoading = false; // Pour gérer l'état de chargement

  // Injection via constructeur ou inject()
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router); // Gardé pour onCancel

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
        createStructure: [false], // Valeur par défaut false
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
      // Appliquer l'erreur au champ confirmPassword pour l'affichage
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true }; // Retourner l'erreur pour le groupe aussi
    } else {
      // Si les mots de passe correspondent ou qu'un champ est vide, retirer l'erreur potentielle
      const confirmPasswordControl = control.get('confirmPassword');
      if (confirmPasswordControl?.hasError('passwordMismatch')) {
        // Retirer spécifiquement cette erreur sans affecter les autres validateurs (comme required)
        const errors = confirmPasswordControl.errors ?? {};
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPasswordControl.setErrors(null);
        } else {
          confirmPasswordControl.setErrors(errors);
        }
      }
      return null; // Pas d'erreur pour le groupe
    }
  }

  onSubmit(): void {
    this.registerForm.markAllAsTouched(); // Marquer pour afficher les erreurs si soumission invalide

    if (this.registerForm.invalid) {
      console.warn('Registration form is invalid.');
      return; // Arrêter si le formulaire n'est pas valide
    }

    this.isLoading = true; // Activer le spinner

    // Préparer le DTO (exclure confirmPassword)
    const newUserRegistration: UserRegistrationDto = {
      firstName: this.registerForm.get('firstName')?.value,
      lastName: this.registerForm.get('lastName')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value, // Inclure le mot de passe
      createStructure: this.registerForm.get('createStructure')?.value ?? false, // Assurer une valeur booléenne
    };

    console.log('Submitting registration:', newUserRegistration);

    this.authService.registerAndHandleAuth(newUserRegistration).subscribe({
      next: () => {
        // Exécuté si l'observable de register se complète SANS erreur
        console.log(
          'RegisterPageComponent: Registration call successful (navigation handled by AuthService).'
        ); // LOG 6
        // Si la navigation réussit, ce composant sera détruit.
        // Si elle échoue, on arrête le spinner.
        this.isLoading = false; // <<<=== AJOUT IMPORTANT
      },
      error: (err) => {
        console.error('Component received registration error:', err);
        this.isLoading = false; // Déjà présent
      },
    });
  }

  // Méthode pour annuler et retourner à l'accueil
  onCancel(): void {
    // Pas besoin de localStorage.removeItem ici
    this.router.navigate(['/home']); // Naviguer vers la page d'accueil
  }
}
