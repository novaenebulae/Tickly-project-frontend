import {Component, Inject, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common'; // Nécessaire pour @if et les directives structurelles

// Interface pour les données passées à la modale (optionnel mais bonne pratique)
export interface EditProfileDialogData {
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss',
  standalone: true,
  imports: [
    CommonModule, // Pour @if
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class EditProfileDialogComponent implements OnInit {
  editProfileForm!: FormGroup; // "definite assignment assertion"
  hidePassword = true;
  hideConfirmationPassword = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditProfileDialogData | null // Rendre data optionnel
  ) {
  }

  ngOnInit(): void {
    this.editProfileForm = this.fb.group({
      firstName: [this.data?.firstName || '', Validators.required],
      lastName: [this.data?.lastName || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]], // Mot de passe optionnel, mais si fourni, min 8 caractères
      confirmPassword: ['', [this.validateSamePassword]]
    });

    this.editProfileForm.get('password')?.valueChanges.subscribe(() => {
      this.editProfileForm.get('confirmPassword')?.updateValueAndValidity();
    });

  }

  private validateSamePassword(control: AbstractControl): ValidationErrors | null {
    if (!control.parent) {
      return null;
    }

    const password = control.parent.get('password');
    const confirmPassword = control.parent.get('confirmPassword');

    if (!password || !confirmPassword || !password.value) {
      return null;
    }

    if (password.value === confirmPassword.value) {
      return null;
    }

    return { 'notSame': true };
  }

  onSave(): void {
    if (this.editProfileForm.valid) {
      // Ne pas inclure le mot de passe s'il est vide
      const formValue = {...this.editProfileForm.value};
      if (!formValue.password) {
        delete formValue.password;
      }
      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
