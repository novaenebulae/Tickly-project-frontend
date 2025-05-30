import { Component, Inject, OnInit, inject, signal, effect, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
import {MatTab, MatTabGroup} from '@angular/material/tabs';

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
    MatTabGroup,
    MatTab
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

  // Formulaire
  profileForm!: FormGroup;

  // État du composant avec signaux
  isUpdatingProfile = signal(false);
  isRequestingPasswordReset = signal(false);

  // ✅ Accès correct au signal du UserService
  readonly currentUser = this.userService.currentUserProfileData;

  // ✅ Avatar URL calculé avec computed
  readonly profileAvatarUrl = computed(() => {
    const user = this.data.user;
    const formValue = this.profileForm?.value;

    if (formValue) {
      const firstName = formValue.firstName || user.firstName;
      const lastName = formValue.lastName || user.lastName;
      return this.userService.generateAvatarUrl(firstName, lastName);
    }

    return this.userService.generateAvatarUrl(user.firstName, user.lastName);
  });

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
        this.data = { user: profile };
        if (this.profileForm) {
          this.initProfileForm();
        }
      }
    });
  }

  ngOnInit(): void {
    this.initProfileForm();
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
   * Soumet les modifications du profil
   */
  submitProfileChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isUpdatingProfile.set(true);

    // ✅ Préparer le DTO selon la nouvelle API
    const formValue = this.profileForm.value;
    const profileUpdateDto: UserProfileUpdateDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
    };

    // ✅ Utiliser la méthode correcte du UserService
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
   * Ferme la boîte de dialogue
   */
  cancel(): void {
    this.dialogRef.close();
  }

  // ✅ Getters pour l'accès facile aux contrôles de formulaire
  get firstName() { return this.profileForm.get('firstName'); }
  get lastName() { return this.profileForm.get('lastName'); }
}
