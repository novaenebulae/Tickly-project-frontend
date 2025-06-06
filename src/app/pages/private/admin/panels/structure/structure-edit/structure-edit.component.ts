import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, Observable, of } from 'rxjs';
import { finalize, catchError, tap } from 'rxjs/operators';
import { Location } from '@angular/common';

// Importation des Modules Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TextFieldModule } from '@angular/cdk/text-field';

import { StructureService } from '../../../../../../core/services/domain/structure/structure.service';
import { UserStructureService } from '../../../../../../core/services/domain/user-structure/user-structure.service';
import { NotificationService } from '../../../../../../core/services/domain/utilities/notification.service';
import { StructureModel, StructureUpdateDto } from '../../../../../../core/models/structure/structure.model';
import { StructureTypeModel } from '../../../../../../core/models/structure/structure-type.model';
import { StructureAddressModel } from '../../../../../../core/models/structure/structure-address.model';

@Component({
  selector: 'app-structure-edit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatSnackBarModule, MatChipsModule, TextFieldModule
  ],
  templateUrl: './structure-edit.component.html',
  styleUrls: ['./structure-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureEditComponent implements OnInit, OnDestroy {

  // --- Injections ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);
  private cdRef = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);
  private structureService = inject(StructureService);
  private userStructureService = inject(UserStructureService);
  private notificationService = inject(NotificationService);

  // --- Signals pour la gestion d'état ---
  private isLoadingSig = signal(false);
  private isSavingSig = signal(false);
  private errorLoadingSig = signal<string | null>(null);

  // Signals pour les données
  public readonly isLoading = computed(() => this.isLoadingSig());
  public readonly isSaving = computed(() => this.isSavingSig());
  public readonly errorLoading = computed(() => this.errorLoadingSig());
  public readonly currentStructure = this.userStructureService.userStructure;
  public readonly structureTypes = this.structureService.structureTypes;

  // État du formulaire
  structureForm: FormGroup;

  // Gestion des fichiers et aperçus
  logoPreviewUrl: string | null = null;
  coverPreviewUrl: string | null = null;
  selectedLogoFile: File | null = null;
  selectedCoverFile: File | null = null;
  defaultImage: string = 'icons/no-image.svg';

  // Pour cleanup
  private subscriptions = new Subscription();

  constructor() {
    this.structureForm = this.createStructureForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // --- Création du formulaire ---
  private createStructureForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      typeIds: [[], Validators.required], // Array d'IDs pour les types
      description: [''],
      address: this.fb.group({
        country: ['', Validators.required],
        city: ['', Validators.required],
        street: ['', Validators.required],
        number: [''],
        zipCode: ['']
      }),
      phone: [''],
      email: ['', Validators.email],
      websiteUrl: ['', this.urlValidator()],
      socialsUrl: this.fb.array([]), // FormArray pour les URLs sociales
      logoUrl: [''],
      coverUrl: ['']
    });
  }

  // --- Getters pour accéder aux contrôles du formulaire ---
  get socialsUrlArray(): FormArray {
    return this.structureForm.get('socialsUrl') as FormArray;
  }

  get addressGroup(): FormGroup {
    return this.structureForm.get('address') as FormGroup;
  }

  // --- Chargement des données initiales ---
  protected loadInitialData(): void {
    this.isLoadingSig.set(true);
    this.errorLoadingSig.set(null);

    // Récupérer la structure utilisateur depuis le signal
    const userStructure = this.currentStructure();

    if (userStructure) {
      this.populateForm(userStructure);
      this.setupImagePreviews(userStructure);
      this.isLoadingSig.set(false);
      this.cdRef.markForCheck();
    } else if (userStructure === null) {
      this.errorLoadingSig.set('Aucune structure associée à votre compte.');
      this.isLoadingSig.set(false);
      this.cdRef.markForCheck();
    } else {
      // userStructure === undefined, donc en cours de chargement
      // Attendre un peu et vérifier à nouveau
      setTimeout(() => {
        const structure = this.currentStructure();
        if (structure) {
          this.populateForm(structure);
          this.setupImagePreviews(structure);
        } else if (structure === null) {
          this.errorLoadingSig.set('Aucune structure associée à votre compte.');
        }
        this.isLoadingSig.set(false);
        this.cdRef.markForCheck();
      }, 1000);
    }
  }

  // --- Population du formulaire avec les données existantes ---
  private populateForm(structure: StructureModel): void {
    // Types - extraire les IDs
    const typeIds = structure.types?.map(type => type.id) || [];

    // URLs sociales
    this.populateSocialsArray(structure.socialsUrl || []);

    this.structureForm.patchValue({
      name: structure.name,
      typeIds: typeIds,
      description: structure.description || '',
      address: {
        country: structure.address.country,
        city: structure.address.city,
        street: structure.address.street,
        number: structure.address.number || '',
        zipCode: structure.address.zipCode || ''
      },
      phone: structure.phone || '',
      email: structure.email || '',
      websiteUrl: structure.websiteUrl || '',
      logoUrl: structure.logoUrl || '',
      coverUrl: structure.coverUrl || ''
    });
  }

  // --- Gestion des URLs sociales ---
  private populateSocialsArray(socialsUrl: string[]): void {
    this.socialsUrlArray.clear();
    socialsUrl.forEach(url => {
      this.socialsUrlArray.push(this.fb.control(url, this.urlValidator()));
    });
  }

  addSocialUrl(): void {
    this.socialsUrlArray.push(this.fb.control('', this.urlValidator()));
  }

  removeSocialUrl(index: number): void {
    this.socialsUrlArray.removeAt(index);
  }

  // --- Configuration des aperçus d'images ---
  private setupImagePreviews(structure: StructureModel): void {
    this.logoPreviewUrl = structure.logoUrl || null;
    this.coverPreviewUrl = structure.coverUrl || null;
  }

  // --- Gestion des fichiers ---
  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedLogoFile = input.files[0];
      this.previewFile(input.files[0], 'logo');
    }
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedCoverFile = input.files[0];
      this.previewFile(input.files[0], 'cover');
    }
  }

  private previewFile(file: File, type: 'logo' | 'cover'): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'logo') {
        this.logoPreviewUrl = e.target?.result as string;
      } else {
        this.coverPreviewUrl = e.target?.result as string;
      }
      this.cdRef.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  removeImage(type: 'logo' | 'cover'): void {
    if (type === 'logo') {
      this.logoPreviewUrl = null;
      this.selectedLogoFile = null;
      this.structureForm.patchValue({ logoUrl: '' });
    } else {
      this.coverPreviewUrl = null;
      this.selectedCoverFile = null;
      this.structureForm.patchValue({ coverUrl: '' });
    }
  }

  // --- Sauvegarde ---
  onSubmit(): void {
    const currentStructure = this.currentStructure();

    if (this.structureForm.invalid || !currentStructure) {
      this.markFormGroupTouched(this.structureForm);
      return;
    }

    this.isSavingSig.set(true);
    const formValue = this.structureForm.value;

    // Construire l'objet de mise à jour
    const updateData: StructureUpdateDto = {
      name: formValue.name,
      typeIds: formValue.typeIds,
      description: formValue.description,
      address: formValue.address as StructureAddressModel,
      phone: formValue.phone,
      email: formValue.email,
      websiteUrl: formValue.websiteUrl,
      socialsUrl: this.socialsUrlArray.value.filter((url: string) => url.trim()),
      logoUrl: formValue.logoUrl,
      coverUrl: formValue.coverUrl
    };

    this.subscriptions.add(
      this.structureService.updateStructure(currentStructure.id!, updateData).pipe(
        finalize(() => {
          this.isSavingSig.set(false);
          this.cdRef.markForCheck();
        })
      ).subscribe({
        next: (updatedStructure) => {
          if (updatedStructure) {
            this.notificationService.displayNotification(
              'Structure mise à jour avec succès !',
              'valid'
            );
            // Rafraîchir la structure utilisateur
            this.userStructureService.refreshUserStructure().subscribe();
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
        }
      })
    );
  }

  // --- Méthodes pour les erreurs de validation ---
  getFieldErrorMessage(fieldName: string): string {
    const control = this.structureForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Ce champ est requis';
    }
    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
    }
    if (control.errors['email']) {
      return 'Format d\'email invalide';
    }
    if (control.errors['invalidUrl']) {
      return 'URL invalide';
    }

    return 'Champ invalide';
  }

  // --- Utilitaires ---
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private urlValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      return urlPattern.test(control.value) ? null : { invalidUrl: true };
    };
  }

  // --- Actions de navigation ---
  onCancel(): void {
    this.location.back();
  }

  goBack(): void {
    this.location.back();
  }

  goToStructurePanel(): void {
    this.router.navigate(['/admin/structure']);
  }

  // --- Getters pour le template ---
  get isFormValid(): boolean {
    return this.structureForm.valid;
  }

  get hasStructureData(): boolean {
    return !!this.currentStructure();
  }

  // Méthodes helper pour le template
  isStructureLoading(): boolean {
    return this.userStructureService.isLoading();
  }

  onSave(): void {
    this.onSubmit();
  }
}
