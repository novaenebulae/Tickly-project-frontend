import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Subscription, Observable, of, forkJoin } from 'rxjs';
import { finalize, catchError, tap, switchMap } from 'rxjs/operators';
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
import {MatDialog} from '@angular/material/dialog';
import {
  StructureGalleryManagerComponent
} from '../../../../../../shared/domain/structures/structure-gallery-manager/structure-gallery-manager.component';


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
  private dialog = inject(MatDialog);

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

  // État du formulaire (sans les images)
  structureForm: FormGroup;

  // Gestion des fichiers et aperçus (en dehors du formulaire)
  logoPreviewUrl: string | null = null;
  coverPreviewUrl: string | null = null;
  selectedLogoFile: File | null = null;
  selectedCoverFile: File | null = null;
  selectedGalleryFiles: File[] = [];
  isUploadingLogo = signal(false);
  isUploadingCover = signal(false);
  isUploadingGallery = signal(false);

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

  // --- Création du formulaire (sans les champs images) ---
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
      socialsUrl: this.fb.array([]) // FormArray pour les URLs sociales
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

  // --- Population du formulaire avec les données existantes (sans les images) ---
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
      websiteUrl: structure.websiteUrl || ''
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


  // --- Méthodes du formulaire (uniquement pour les informations de base) ---

  /**
   * Sauvegarde uniquement les informations du formulaire (pas les images)
   */
  onSave(): void {
    if (this.structureForm.invalid) {
      this.markFormGroupTouched(this.structureForm);
      this.notificationService.displayNotification('Veuillez corriger les erreurs dans le formulaire.', 'error');
      return;
    }

    this.isSavingSig.set(true);

    // Préparer les données de mise à jour sans les images
    const formValue = this.structureForm.value;
    const updateData: StructureUpdateDto = {
      name: formValue.name,
      description: formValue.description || undefined,
      typeIds: formValue.typeIds,
      address: formValue.address,
      phone: formValue.phone || undefined,
      email: formValue.email || undefined,
      websiteUrl: formValue.websiteUrl || undefined,
      socialsUrl: formValue.socialsUrl?.filter((url: string) => url.trim()) || []
    };

    const currentStructure = this.currentStructure();
    if (!currentStructure?.id) {
      this.isSavingSig.set(false);
      this.notificationService.displayNotification('ID de structure manquant.', 'error');
      return;
    }

    // Sauvegarder les informations de base uniquement
    this.structureService.updateStructure(currentStructure.id, updateData).pipe(
      finalize(() => {
        this.isSavingSig.set(false);
        this.cdRef.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.notificationService.displayNotification('Structure mise à jour avec succès !', 'valid');
        // Recharger les données utilisateur
        this.userStructureService.refreshUserStructure().subscribe();
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.notificationService.displayNotification('Erreur lors de la sauvegarde.', 'error');
      }
    });
  }

  // --- Méthodes utilitaires ---

  private urlValidator(): any {
    return (control: any) => {
      if (!control.value) {
        return null;
      }
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(control.value) ? null : { invalidUrl: true };
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.getControlByPath(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return 'Ce champ est obligatoire';
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
    }
    return '';
  }

  private getControlByPath(path: string): AbstractControl | null {
    return path.split('.').reduce((control: AbstractControl | null, controlName: string) => {
      return control ? control.get(controlName) : null;
    }, this.structureForm as AbstractControl);
  }

  onCancel(): void {
    this.router.navigate(['/admin/structure']);
  }

  goBack(): void {
    this.location.back();
  }

  // Getters pour les signals d'upload
  get isUploadingLogoSig() {
    return this.isUploadingLogo();
  }

  get isUploadingCoverSig() {
    return this.isUploadingCover();
  }

  get isUploadingGallerySig() {
    return this.isUploadingGallery();
  }
}
