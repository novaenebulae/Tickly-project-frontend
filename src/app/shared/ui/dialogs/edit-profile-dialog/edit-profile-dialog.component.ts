import { Component, Inject, OnInit, inject, signal, effect, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { UserService } from '../../../../core/services/domain/user/user.service';
import { AuthService } from '../../../../core/services/domain/user/auth.service';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';

// Models
import { UserModel } from '../../../../core/models/user/user.model';
import { UserProfileUpdateDto } from '../../../../core/models/user/user-profile-update.dto';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from '../confirmation-dialog/confirmation-dialog.component';

/**
 * Interface pour les données du dialogue
 */
export interface EditProfileDialogData {
  user: UserModel;
}

/**
 * Composant de dialogue pour éditer le profil utilisateur
 * Version refactorisée compatible avec la nouvelle architecture
 */
@Component({
  selector: 'app-edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ]
})
export class EditProfileDialogComponent implements OnInit {
  // ✅ Injection moderne Angular 19
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditProfileDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as EditProfileDialogData;
  private dialog = inject(MatDialog);

  // Formulaire
  profileForm!: FormGroup;

  // État du composant avec signaux
  isUpdatingProfile = signal(false);
  isRequestingPasswordReset = signal(false);
  isUploadingAvatar = signal(false);
  isRequestingAccountDeletion = signal(false);

  // ✅ Accès correct au signal du UserService
  readonly currentUser = this.userService.currentUserProfileData;

  public profileAvatarUrl = signal<string>('');


  // ✅ Vérification des changements avec computed
  readonly isProfileFormChanged = computed(() => {
    if (!this.profileForm) return false;

    const user = this.data.user;
    const form = this.profileForm.value;

    return form.firstName !== user.firstName ||
      form.lastName !== user.lastName
  });

  constructor() {
    // Effet pour surveiller les changements dans le profil utilisateur
    effect(() => {
      const profile = this.currentUser();
      if (profile && (!this.data.user || profile.id === this.data.user.id)) {
        // Mettre à jour les données locales
        this.data = { user: profile };

        // Mettre à jour l'affichage de l'avatar
        this.updateAvatarDisplay(profile);

        // Mettre à jour le formulaire si nécessaire
        if (this.profileForm) {
          this.initProfileForm();
        }
      }
    });
  }


  ngOnInit(): void {
    this.initProfileForm();
    this.updateAvatarDisplay(this.data.user);
  }

  /**
   * Initialise le formulaire d'édition de profil
   */
  private initProfileForm(): void {
    const user = this.data.user;

    this.profileForm = this.fb.group({
      firstName: [
        user.firstName,
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ],
      lastName: [
        user.lastName,
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ]
    });
  }

  /**
   * Gère la sélection de fichier pour le téléversement de l'avatar.
   * @param event L'événement de changement de l'input de type fichier.
   */
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validation du fichier
      const allowedTypes = ['image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        this.notification.displayNotification('Seuls les fichiers PNG et JPG sont autorisés.', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // Limite de 2Mo
        this.notification.displayNotification('Le fichier ne doit pas dépasser 2 Mo.', 'error');
        return;
      }

      this.isUploadingAvatar.set(true);

      // Le service utilisateur gère l'appel API et la mise à jour
      this.userService.uploadUserAvatar(file).subscribe({
        next: (updatedUser) => {
          // L'effect() dans le constructor se chargera de mettre à jour l'affichage
          // car le signal currentUser() du UserService aura été mis à jour
        },
        error: () => {
          this.isUploadingAvatar.set(false);
          input.value = '';
        },
        complete: () => {
          this.isUploadingAvatar.set(false);
          input.value = '';
        }
      });
    }
  }

  /**
   * Met à jour le signal d'affichage de l'avatar en fonction des données de l'utilisateur.
   * Utilise l'avatarUrl si disponible, sinon génère des initiales.
   */
  private updateAvatarDisplay(user: UserModel): void {
    if (user.avatarUrl && user.avatarUrl.trim()) {
      // Ajoute un paramètre de cache-busting pour forcer le rechargement de l'image
      this.profileAvatarUrl.set(`${user.avatarUrl}?t=${new Date().getTime()}`);
    } else {
      this.profileAvatarUrl.set(this.generateInitialsAvatar(user.firstName, user.lastName));
    }
  }

  /**
   * Génère une image SVG encodée en base64 avec les initiales de l'utilisateur.
   */
  private generateInitialsAvatar(firstName: string, lastName: string): string {
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
        <rect width="100%" height="100%" fill="#e9ecef"></rect>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="32px" font-weight="600" fill="#6c757d">
          ${initials}
        </text>
      </svg>
    `;
    // btoa est disponible dans les environnements navigateur.
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }


  /**
   * Soumet les modifications du profil
   */
  submitProfileChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile.set(true);

    // Préparer le DTO selon la nouvelle API (PUT /api/v1/users/me)
    const formValue = this.profileForm.value;
    const profileUpdateDto: UserProfileUpdateDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: this.data.user.email // Inclure l'email même s'il n'est pas modifiable dans l'interface
    };

    // Utiliser la méthode correcte du UserService
    this.userService.updateCurrentUserProfile(profileUpdateDto)
      .subscribe({
        next: (updatedUser) => {
          this.isUpdatingProfile.set(false);

          if (updatedUser) {
            this.dialogRef.close(updatedUser);
          } else {
            this.notification.displayNotification(
              'Erreur lors de la mise à jour du profil',
              'error',
              'Fermer'
            );
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du profil', error);
          this.notification.displayNotification(
            error.message || 'Erreur lors de la mise à jour du profil',
            'error',
            'Fermer'
          );
          this.isUpdatingProfile.set(false);
        }
      });
  }

  /**
   * ✅ Nouveau système : Demande de réinitialisation de mot de passe par email
   * Remplace l'ancien système de changement direct
   */
  requestPasswordReset(): void {
    this.isRequestingPasswordReset.set(true);

    this.authService.requestPasswordReset(this.data.user.email)
      .subscribe({
        next: () => {
          this.isRequestingPasswordReset.set(false);
          this.notification.displayNotification(
            'Un lien de réinitialisation a été envoyé à votre adresse email',
            'valid',
            'Fermer'
          );
        },
        error: (error) => {
          this.isRequestingPasswordReset.set(false);
          this.notification.displayNotification(
            error.message || 'Erreur lors de la demande de réinitialisation',
            'error',
            'Fermer'
          );
        }
      });
  }

  /**
   * Demande la suppression du compte avec confirmation
   */
  requestAccountDeletion(): void {
    // Ouvrir le dialogue de confirmation
    const dialogData: ConfirmationDialogData = {
      title: 'Supprimer mon compte',
      message: 'Êtes-vous absolument certain de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront définitivement supprimées. Un email de confirmation sera envoyé à votre adresse.',
      confirmButtonText: 'Oui, supprimer mon compte',
      cancelButtonText: 'Annuler',
      confirmButtonColor: 'warn'
    };

    const confirmDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '400px',
      disableClose: true
    });

    confirmDialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.proceedWithAccountDeletion();
      }
    });
  }

  /**
   * Procède à la demande de suppression de compte
   */
  private proceedWithAccountDeletion(): void {
    this.isRequestingAccountDeletion.set(true);

    this.userService.requestAccountDeletion().subscribe({
      next: (success: boolean) => {
        this.isRequestingAccountDeletion.set(false);
        if (success) {
          // Fermer le dialogue après succès
          this.dialogRef.close();
        }
      },
      error: () => {
        this.isRequestingAccountDeletion.set(false);
      }
    });
  }


  /**
   * Ferme la boîte de dialogue
   */
  cancel(): void {
    this.dialogRef.close();
  }

  // ✅ Getters pour l'accès facile aux contrôles de formulaire
  get firstName() { return this.profileForm.get('firstName'); }
  get lastName() { return this.profileForm.get('lastName'); }
}
