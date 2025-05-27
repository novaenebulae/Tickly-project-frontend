// src/app/shared/components/dialogs/edit-profile-dialog/edit-profile-dialog.component.ts
import { Component, Inject, OnInit, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';

// Services
import { UserService } from '../../../../core/services/domain/user.service';

// Models
import { UserModel } from '../../../../core/models/user/user.model';

// Interface pour les données du dialogue
export interface EditProfileDialogData {
  user: UserModel;
}

/**
 * Composant de dialogue pour éditer le profil utilisateur
 * Permet la modification des informations personnelles et du mot de passe
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
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class EditProfileDialogComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);

  // Formulaires
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // État du composant
  isUpdatingProfile = signal(false);
  isChangingPassword = signal(false);
  profileAvatarUrl = signal('');
  showPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  // Accès aux signaux exposés par UserService si disponibles
  readonly currentUser = this.userService.currentUserProfile;

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditProfileDialogData
  ) {
    // Effet pour surveiller les changements dans le profil utilisateur
    effect(() => {
      const profile = this.currentUser();
      if (profile && (!this.data.user || profile.id === this.data.user.id)) {
        this.data = { user: profile };
        if (this.profileForm) {
          this.initProfileForm();
          this.updateAvatarPreview();
        }
      }
    });
  }

  ngOnInit(): void {
    this.initProfileForm();
    this.initPasswordForm();
    this.updateAvatarPreview();
  }

  /**
   * Initialise le formulaire d'édition de profil
   */
  private initProfileForm(): void {
    const user = this.data.user;

    this.profileForm = this.fb.group({
      firstName: [user.firstName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: [user.lastName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: [user.email, [Validators.required, Validators.email, Validators.maxLength(100)]]
    });
  }

  /**
   * Initialise le formulaire de changement de mot de passe
   */
  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validateur personnalisé pour vérifier que les mots de passe correspondent
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Met à jour l'aperçu de l'avatar avec les données du formulaire
   */
  updateAvatarPreview(): void {
    if (this.profileForm) {
      const formValue = this.profileForm.value;
      const userPreview: UserModel = {
        ...this.data.user,
        firstName: formValue.firstName || this.data.user.firstName,
        lastName: formValue.lastName || this.data.user.lastName
      };

      this.profileAvatarUrl.set(this.userService.generateAvatarUrl(userPreview));
    } else {
      this.profileAvatarUrl.set(this.userService.generateAvatarUrl(this.data.user));
    }
  }

  /**
   * Soumet les modifications du profil
   */
  submitProfileChanges(): void {
    if (this.profileForm.invalid) {
      return;
    }

    // Marquer le formulaire comme touché pour afficher les erreurs
    this.profileForm.markAllAsTouched();

    if (this.profileForm.valid) {
      this.isUpdatingProfile.set(true);

      // Préparer les données à envoyer (uniquement les champs modifiés)
      const formValue = this.profileForm.value;
      const userId = this.data.user.id;

      if (userId) {
        this.userService.updateUserProfile(userId, formValue).subscribe({
          next: (updatedUser) => {
            this.isUpdatingProfile.set(false);
            this.notification.displayNotification(
              'Profil mis à jour avec succès',
              'valid',
              'Fermer'
            );
            this.dialogRef.close(updatedUser);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du profil', error);
            this.notification.displayNotification(
              'Erreur lors de la mise à jour du profil',
              'error',
              'Fermer'
            );
            this.isUpdatingProfile.set(false);
          }
        });
      }
    }
  }

  /**
   * Change le mot de passe de l'utilisateur
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);

    const { currentPassword, newPassword } = this.passwordForm.value;
    const userId = this.data.user.id;

    if (userId) {
      this.userService.changePassword(userId, currentPassword, newPassword).subscribe({
        next: (success) => {
          this.isChangingPassword.set(false);
          if (success) {
            this.notification.displayNotification(
              'Mot de passe modifié avec succès',
              'valid',
              'Fermer'
            );
            // Réinitialiser le formulaire après succès
            this.passwordForm.reset();
            // Fermer la fenêtre de dialogue
            this.dialogRef.close();
          }
        },
        error: (error) => {
          console.error('Erreur lors du changement de mot de passe', error);
          this.notification.displayNotification(
            'Erreur lors du changement de mot de passe. Vérifiez votre mot de passe actuel.',
            'error',
            'Fermer'
          );
          this.isChangingPassword.set(false);
        }
      });
    }
  }

  /**
   * Bascule la visibilité d'un champ de mot de passe
   */
  togglePasswordVisibility(field: 'password' | 'newPassword' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword.set(!this.showPassword());
    } else if (field === 'newPassword') {
      this.showNewPassword.set(!this.showNewPassword());
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword.set(!this.showConfirmPassword());
    }
  }

  /**
   * Ferme la boîte de dialogue
   */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Vérifie si le formulaire de profil a été modifié
   */
  get isProfileFormChanged(): boolean {
    const user = this.data.user;
    const form = this.profileForm.value;

    return form.firstName !== user.firstName ||
      form.lastName !== user.lastName ||
      form.email !== user.email;
  }
}
