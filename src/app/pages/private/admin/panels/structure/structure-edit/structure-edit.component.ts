import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {Router} from '@angular/router';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {finalize} from 'rxjs/operators';

// Importation des Modules Angular Material
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatChipsModule} from '@angular/material/chips';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatDividerModule} from '@angular/material/divider';

import {StructureService} from '../../../../../../core/services/domain/structure/structure.service';
import {UserStructureService} from '../../../../../../core/services/domain/user-structure/user-structure.service';
import {NotificationService} from '../../../../../../core/services/domain/utilities/notification.service';
import {AuthService} from '../../../../../../core/services/domain/user/auth.service';
import {StructureModel, StructureUpdateDto} from '../../../../../../core/models/structure/structure.model';
import {UserRole} from '../../../../../../core/models/user/user-role.enum';
import {MatDialog} from '@angular/material/dialog';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from '../../../../../../shared/ui/dialogs/confirmation-dialog/confirmation-dialog.component';
import {EventService} from '../../../../../../core/services/domain/event/event.service';
import {EventStatus} from '../../../../../../core/models/event/event.model';


@Component({
  selector: 'app-structure-edit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatSnackBarModule, MatChipsModule, TextFieldModule, MatDividerModule
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
  private structureService = inject(StructureService);
  private userStructureService = inject(UserStructureService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private eventService = inject(EventService);

  // --- Signals pour la gestion d'état ---
  private isLoadingSig = signal(false);
  private isSavingSig = signal(false);
  private isDeletingSig = signal(false);
  private errorLoadingSig = signal<string | null>(null);
  private hasPublishedEventsSig = signal(false);
  private isCheckingEventsSig = signal(false);

  // Signals pour les données
  public readonly isLoading = computed(() => this.isLoadingSig());
  public readonly isSaving = computed(() => this.isSavingSig());
  public readonly isDeleting = computed(() => this.isDeletingSig());
  public readonly isCheckingEvents = computed(() => this.isCheckingEventsSig());
  public readonly errorLoading = computed(() => this.errorLoadingSig());
  public readonly currentStructure = this.userStructureService.userStructure;
  public readonly structureTypes = this.structureService.structureTypes;
  public readonly hasPublishedEvents = computed(() => this.hasPublishedEventsSig());

  // Computed signal to determine if the form should be readonly
  public readonly isReadonly = computed(() => {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === UserRole.ORGANIZATION_SERVICE ||
      currentUser?.role === UserRole.RESERVATION_SERVICE;
  });

  // Computed signal to determine if the current user is a structure administrator
  public readonly isStructureAdmin = computed(() => {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === UserRole.STRUCTURE_ADMINISTRATOR;
  });


  // État du formulaire (sans les images)
  structureForm: FormGroup;

  // Gestion des fichiers et aperçus (en dehors du formulaire)
  logoPreviewUrl: string | null = null;
  coverPreviewUrl: string | null = null;

  isUploadingLogo = signal(false);
  isUploadingCover = signal(false);
  isUploadingGallery = signal(false);

  // Pour cleanup
  private subscriptions = new Subscription();

  constructor() {
    this.structureForm = this.createStructureForm();

    // 🔥 Effect pour mettre à jour l'état disabled du formulaire
    effect(() => {
      const readonly = this.isReadonly();

      if (readonly) {
        this.structureForm.disable();
      } else {
        this.structureForm.enable();
      }
    });
  }


  ngOnInit(): void {
    this.loadInitialData();
    this.checkForPublishedEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Vérifie si la structure a des événements publiés, ce qui empêcherait sa suppression
   */
  checkForPublishedEvents(): void {
    const structure = this.currentStructure();
    if (!structure?.id) return;

    this.isCheckingEventsSig.set(true);

    this.eventService.getEventsByStructure(structure.id, { status: EventStatus.PUBLISHED }).pipe(
      finalize(() => {
        this.isCheckingEventsSig.set(false);
        this.cdRef.markForCheck();
      })
    ).subscribe({
      next: (events) => {
        this.hasPublishedEventsSig.set(events.length > 0);
      },
      error: (error) => {
        console.error('Erreur lors de la vérification des événements publiés:', error);
        // En cas d'erreur, on suppose qu'il y a des événements publiés par sécurité
        this.hasPublishedEventsSig.set(true);
      }
    });
  }

  private createStructureForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      typeIds: [[], Validators.required],
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
      socialsUrl: this.fb.array([])
    });
  }

  // --- Population du formulaire ---
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

    if (this.isReadonly()) {
      this.structureForm.disable();
    }
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
    // Prevent ORGANIZATION_SERVICE users from saving changes
    if (this.isReadonly()) {
      this.notificationService.displayNotification('Vous n\'avez pas les droits nécessaires pour modifier la structure.', 'error');
      return;
    }

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
    this.userStructureService.updateStructure(currentStructure.id, updateData).pipe(
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

  /**
   * Ouvre une boîte de dialogue de confirmation pour supprimer la structure
   */
  onDeleteStructure(): void {
    const structure = this.currentStructure();
    if (!structure?.id) {
      this.notificationService.displayNotification('Aucune structure à supprimer.', 'error');
      return;
    }

    // Vérifier si l'utilisateur est un administrateur de structure
    if (!this.isStructureAdmin()) {
      this.notificationService.displayNotification('Vous n\'avez pas les droits nécessaires pour supprimer cette structure.', 'error');
      return;
    }

    // Vérifier si la structure a des événements publiés
    if (this.hasPublishedEvents()) {
      this.notificationService.displayNotification(
        'Impossible de supprimer la structure car elle contient des événements publiés. Veuillez d\'abord annuler tous les événements publiés.',
        'error'
      );
      return;
    }

    // Configurer la boîte de dialogue de confirmation
    const dialogData: ConfirmationDialogData = {
      title: 'Supprimer la structure',
      message: `Êtes-vous sûr de vouloir supprimer définitivement la structure "${structure.name}" ? Cette action est irréversible et supprimera également toutes les données associées.`,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: 'warn'
    };

    // Ouvrir la boîte de dialogue de confirmation
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: dialogData
    });

    // Gérer la réponse de la boîte de dialogue
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteStructure(structure.id!);
      }
    });
  }

  /**
   * Supprime la structure après confirmation
   */
  private deleteStructure(structureId: number): void {
    this.isDeletingSig.set(true);

    this.userStructureService.deleteStructure(structureId).pipe(
      finalize(() => {
        this.isDeletingSig.set(false);
        this.cdRef.markForCheck();
      })
    ).subscribe({
      next: (success) => {
        if (success) {
          this.notificationService.displayNotification('Structure supprimée avec succès.', 'valid');

          // Ne pas naviguer immédiatement car UserStructureService gère déjà la navigation
          // après la mise à jour des données utilisateur
        } else {
          this.notificationService.displayNotification('Échec de la suppression de la structure.', 'error');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la structure:', error);
        this.notificationService.displayNotification(
          'Une erreur est survenue lors de la suppression de la structure.',
          'error'
        );
      }
    });
  }

}
