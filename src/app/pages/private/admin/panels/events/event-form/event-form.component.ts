import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  computed, DestroyRef,
  effect,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {EventAreasZonesSelectionComponent} from '../event-areas-zones-selection/event-areas-zones-selection.component';

// Angular Material
import {MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

// Shared Components
import {
  ConfirmationDialogComponent
} from '../../../../../../shared/ui/dialogs/confirmation-dialog/confirmation-dialog.component';

import {NotificationService} from '../../../../../../core/services/domain/utilities/notification.service';
import {EventService} from '../../../../../../core/services/domain/event/event.service';
import {CategoryService} from '../../../../../../core/services/domain/event/category.service';
import {UserStructureService} from '../../../../../../core/services/domain/user-structure/user-structure.service';
import {EventDataDto, EventModel, EventStatus} from '../../../../../../core/models/event/event.model';
import {EventAudienceZone} from '../../../../../../core/models/event/event-audience-zone.model';
import {StructureAreaModel} from '../../../../../../core/models/structure/structure-area.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

interface FieldModificationMatrix {
  name: boolean;
  categoryIds: boolean;
  shortDescription: boolean;
  fullDescription: boolean;
  tags: boolean;
  startDate: boolean;
  endDate: boolean;
  address: boolean;
  audienceZones: boolean;
  displayOnHomepage: boolean;
  isFeaturedEvent: boolean;
  images: boolean;
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    EventAreasZonesSelectionComponent,
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventFormComponent implements OnInit {
  // ViewChild pour les inputs de fichier
  @ViewChild('mainPhotoInput') mainPhotoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('additionalPhotoInput') additionalPhotoInput!: ElementRef<HTMLInputElement>;
  // Injected services
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private categoryService = inject(CategoryService);
  private userStructureService = inject(UserStructureService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private cdRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  // Inputs
  @Input() eventId?: number;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() structureId?: number;

  // Private signals
  private modeSig: WritableSignal<'create' | 'edit'> = signal('create');
  private eventToEditSig: WritableSignal<EventModel | null> = signal(null);
  private isLoadingEventSig: WritableSignal<boolean> = signal(false);
  private currentStepSig: WritableSignal<number> = signal(0);
  public formValiditySig: WritableSignal<boolean[]> = signal<boolean[]>([false, false, false, false]);
  private isSubmittingSig: WritableSignal<boolean> = signal(false);
  private selectedAreaZonesSig: WritableSignal<any> = signal(null);
  private currentEventStatusSig: WritableSignal<EventStatus> = signal(EventStatus.DRAFT);

  // Signals for existing areas and zones (for edit mode)
  private existingAreasSig: WritableSignal<StructureAreaModel[]> = signal([]);
  private existingZonesSig: WritableSignal<EventAudienceZone[]> = signal([]);

  // Signaux pour les prévisualisations d'images
  public previewMainPhoto = signal<string | null>(null);
  public additionalPhotosPreview = signal<string[]>([]);

  // Variables pour la gestion des fichiers
  private mainPhotoFile: File | null = null;
  private additionalPhotoFiles: File[] = [];
  private removedGalleryImages: string[] = [];

  // Public computed signals
  public readonly currentStep = computed(() => this.currentStepSig());
  public readonly canProceed = computed(() => true); // Toujours actif, la validation sera faite dans nextStep()
  public readonly isLastStep = computed(() => this.currentStep() === 3);
  public readonly formProgress = computed(() => ((this.currentStep() + 1) / 4) * 100);
  public readonly isLoading = computed(() => this.isLoadingEventSig());
  public readonly isSubmitting = computed(() => this.isSubmittingSig());
  public readonly pageTitle = computed(() => {
    if (this.modeSig() === 'create') {
      return 'Créer un événement';
    } else {
      const eventName = this.generalInfoForm?.get('name')?.value || '';
      const status = this.currentEventStatusSig();
      const statusLabel = status ? this.getStatusLabel(status) : '';
      return `Modifier l'événement: ${eventName} (${statusLabel})`;
    }
  });
  public readonly submitButtonText = computed(() =>
    this.modeSig() === 'create' ? 'Créer l\'événement' : 'Enregistrer les modifications'
  );
  public readonly parsedTags = computed(() => {
    const tagsInput = this.generalInfoForm?.get('tagsInput')?.value || '';
    if (!tagsInput) return [];
    return tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '');
  });
  public readonly currentEventStatus = computed(() => this.currentEventStatusSig());

  // Computed signals for existing areas and zones
  public readonly existingAreas = computed(() => this.existingAreasSig());
  public readonly existingZones = computed(() => this.existingZonesSig());

  // Data signals
  public readonly categories = computed(() => this.categoryService.categories());
  public readonly userStructure = computed(() => this.userStructureService.userStructure());
  public readonly userStructureId = computed(() => this.userStructureService.userStructureId());

  // Forms
  generalInfoForm!: FormGroup;
  locationForm!: FormGroup;
  mediaForm!: FormGroup;
  configForm!: FormGroup;

  eventStatusOptions = [
    { value: EventStatus.DRAFT, label: 'Brouillon' },
    { value: EventStatus.PUBLISHED, label: 'Publié' },
    { value: EventStatus.CANCELLED, label: 'Annulé' },
    { value: EventStatus.COMPLETED, label: 'Terminé' },
    { value: EventStatus.ARCHIVED, label: 'Archivé' }
  ];

  // Field modification matrix based on event status
  private fieldModificationMatrix: Record<EventStatus, FieldModificationMatrix> = {
    [EventStatus.DRAFT]: {
      name: true,
      categoryIds: true,
      shortDescription: true,
      fullDescription: true,
      tags: true,
      startDate: true,
      endDate: true,
      address: true,
      audienceZones: true,
      displayOnHomepage: true,
      isFeaturedEvent: true,
      images: true
    },
    [EventStatus.PUBLISHED]: {
      name: false,
      categoryIds: true,
      shortDescription: true,
      fullDescription: true,
      tags: true,
      startDate: false,
      endDate: false,
      address: false,
      audienceZones: false,
      displayOnHomepage: true,
      isFeaturedEvent: true,
      images: true
    },
    [EventStatus.CANCELLED]: {
      name: false,
      categoryIds: false,
      shortDescription: false,
      fullDescription: false,
      tags: false,
      startDate: false,
      endDate: false,
      address: false,
      audienceZones: false,
      displayOnHomepage: false,
      isFeaturedEvent: false,
      images: false
    },
    [EventStatus.COMPLETED]: {
      name: false,
      categoryIds: false,
      shortDescription: false,
      fullDescription: false,
      tags: false,
      startDate: false,
      endDate: false,
      address: false,
      audienceZones: false,
      displayOnHomepage: false,
      isFeaturedEvent: false,
      images: false
    },
    [EventStatus.ARCHIVED]: {
      name: false,
      categoryIds: false,
      shortDescription: false,
      fullDescription: false,
      tags: false,
      startDate: false,
      endDate: false,
      address: false,
      audienceZones: false,
      displayOnHomepage: false,
      isFeaturedEvent: false,
      images: false
    }
  };

  constructor() {
    this.initializeForms();

    // Effect to watch form changes and update validity
    effect(() => {
      if (this.generalInfoForm && this.locationForm && this.mediaForm && this.configForm) {
        const generalValid = this.generalInfoForm.valid || false;
        const locationValid = (this.locationForm.valid || false) && this.selectedAreaZonesSig() !== null;
        const mediaValid = this.mediaForm.valid || false;
        const configValid = this.configForm.valid || false;

        this.formValiditySig.set([generalValid, locationValid, mediaValid, configValid]);
      }
    });

    // Effect to watch event status changes and update form controls
    effect(() => {
      const status = this.currentEventStatus();
      this.updateFormControlsDisabledState();
    });
  }

  ngOnInit(): void {
    // Get eventId from route if not provided as input
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
      if (params['id']) {
        this.eventId = +params['id'];
        this.modeSig.set('edit');
        this.cdRef.markForCheck()
      }
    });

    // Load categories
    this.categoryService.loadCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    // Initialize based on mode
    if (this.eventId && this.modeSig() === 'edit') {
      this.loadEventForEdit();
    } else {
      this.initializeForCreation();
    }

    // Listen for status changes in the config form
    this.configForm.get('status')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(status => {
      this.currentEventStatusSig.set(status);
      this.cdRef.markForCheck()
    });
  }

  private initializeForms(): void {
    // General Info Form
    this.generalInfoForm = this.fb.group({
      name: [{value: '', disabled: this.isNameDisabled()}, [Validators.required, Validators.minLength(3)]],
      categoryId: [{value: null, disabled: this.isCategoryDisabled()}, Validators.required],
      shortDescription: [{value: '', disabled: this.isDescriptionDisabled()}, [Validators.maxLength(200)]],
      fullDescription: [{value: '', disabled: this.isDescriptionDisabled()}, [Validators.required, Validators.minLength(10)]],
      tagsInput: [{value: '', disabled: this.isTagsDisabled()}],
      startDatePart: [{value: '', disabled: this.isDateDisabled()}, Validators.required],
      startTimePart: [{value: '', disabled: this.isDateDisabled()}, Validators.required],
      endDatePart: [{value: '', disabled: this.isDateDisabled()}, Validators.required],
      endTimePart: [{value: '', disabled: this.isDateDisabled()}, Validators.required]
    });

    // Location Form
    this.locationForm = this.fb.group({
      address: this.fb.group({
        street: [{value: '', disabled: this.isAddressDisabled() || true}], // Always disabled as it comes from structure
        city: [{value: '', disabled: this.isAddressDisabled() || true}],
        postalCode: [{value: '', disabled: this.isAddressDisabled() || true}],
        country: [{value: 'France', disabled: this.isAddressDisabled() || true}]
      })
    });

    // Media Form
    this.mediaForm = this.fb.group({
      mainPhotoUrl: [{value: '', disabled: this.isImagesDisabled()}],
      eventPhotoUrls: this.fb.array([])
    });

    // Config Form
    this.configForm = this.fb.group({
      displayOnHomepage: [{value: false, disabled: this.isVisibilityDisabled()}],
      isFeaturedEvent: [{value: false, disabled: this.isVisibilityDisabled()}],
      status: [EventStatus.DRAFT, Validators.required]
    });

    // Add custom validators
    this.generalInfoForm.addValidators(this.dateRangeValidator());
  }

  private dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control as FormGroup;
      const startDatePart = form.get('startDatePart')?.value;
      const startTimePart = form.get('startTimePart')?.value;
      const endDatePart = form.get('endDatePart')?.value;
      const endTimePart = form.get('endTimePart')?.value;

      if (startDatePart && startTimePart && endDatePart && endTimePart) {
        const startDate = this.combineDateAndTime(startDatePart, startTimePart);
        const endDate = this.combineDateAndTime(endDatePart, endTimePart);
        const now = new Date();

        if (startDate >= endDate) {
          return { dateRange: true };
        }

        if (startDate < now) {
          return { pastEvent: true };
        }
      }
      return null;
    };
  }

  private combineDateAndTime(datePart: string, timePart: string): Date {
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  private splitDateToDateAndTimeParts(date: Date | null): { datePart: string, timePart: string } {
    if (!date) return { datePart: '', timePart: '' };

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return {
      datePart: `${year}-${month}-${day}`,
      timePart: `${hours}:${minutes}`
    };
  }

  private initializeForCreation(): void {
    const userStructureId = this.userStructureId();
    if (userStructureId && this.userStructure()) {
      // Pre-fill address with structure address
      const structure = this.userStructure()!;
      this.locationForm.patchValue({
        address: structure.address
      });
    }

    // Initialiser les dates avec des valeurs par défaut
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayParts = this.splitDateToDateAndTimeParts(today);
    const tomorrowParts = this.splitDateToDateAndTimeParts(tomorrow);

    this.generalInfoForm.patchValue({
      startDatePart: todayParts.datePart,
      startTimePart: '18:00',
      endDatePart: tomorrowParts.datePart,
      endTimePart: '20:00'
    });
  }

  private loadEventForEdit(): void {
    if (!this.eventId) return;

    this.isLoadingEventSig.set(true);
    this.eventService.getEventById(this.eventId, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (event) => {
        if (event) {
          this.eventToEditSig.set(event);
          this.populateFormsWithEventData(event);
        } else {
          this.notification.displayNotification('Événement non trouvé', 'error');
          this.router.navigate(['/admin/events']);
        }
        this.isLoadingEventSig.set(false);
        this.cdRef.markForCheck()
      },
      error: (error) => {
        this.notification.displayNotification(
          'Erreur lors du chargement de l\'événement',
          'error'
        );
        this.isLoadingEventSig.set(false);
        this.cdRef.markForCheck()
        this.router.navigate(['/admin/events']);
      }
    });
  }

  private populateFormsWithEventData(event: EventModel): void {
    // Update the current event status
    this.currentEventStatusSig.set(event.status);

    // Préparer les dates et heures
    const startDateParts = this.splitDateToDateAndTimeParts(event.startDate);
    const endDateParts = this.splitDateToDateAndTimeParts(event.endDate);

    // Extract category IDs from the categories array
    const categoryIds = event.categories.map(category => category.id);

    // General info
    this.generalInfoForm.patchValue({
      name: event.name,
      address: event.address,
      categoryId: categoryIds.length === 1 ? categoryIds[0] : categoryIds, // Handle both single and multiple categories
      shortDescription: event.shortDescription,
      fullDescription: event.fullDescription,
      startDatePart: startDateParts.datePart,
      startTimePart: startDateParts.timePart,
      endDatePart: endDateParts.datePart,
      endTimePart: endDateParts.timePart
    });

    // Tags
    if (event.tags && event.tags.length > 0) {
      this.generalInfoForm.patchValue({
        tagsInput: event.tags.join(', ')
      });
    }

    // Location
    this.locationForm.patchValue({
      address: event.address,
    });

    // Set existing areas and zones for the area selection component
    if (event.areas && event.areas.length > 0) {
      this.existingAreasSig.set(event.areas);
    }

    if (event.audienceZones && event.audienceZones.length > 0) {
      this.existingZonesSig.set(event.audienceZones);
    }

    // Media
    this.mediaForm.patchValue({
      mainPhotoUrl: event.mainPhotoUrl
    });

    // Set preview for main photo
    if (event.mainPhotoUrl) {
      this.previewMainPhoto.set(event.mainPhotoUrl);
    }

    // Event photos
    const photosArray = this.eventPhotosFormArray;
    photosArray.clear();
    event.eventPhotoUrls?.forEach(url => {
      // Remove the required validator to allow empty fields initially
      photosArray.push(this.fb.control(url));
    });

    // Set previews for additional photos
    if (event.eventPhotoUrls) {
      this.additionalPhotosPreview.set([...event.eventPhotoUrls]);
    }

    // Links are no longer used in the API

    // Config
    this.configForm.patchValue({
      displayOnHomepage: event.displayOnHomepage,
      isFeaturedEvent: event.isFeaturedEvent,
      status: event.status
    });

    // Update form validity after populating the forms
    // This ensures that steps can be accessed manually when updating an existing event
    setTimeout(() => {
      const generalValid = this.generalInfoForm.valid || false;
      const locationValid = true; // Assume location is valid for existing events
      const mediaValid = this.mediaForm.valid || false;
      const configValid = this.configForm.valid || false;

      this.formValiditySig.set([generalValid, locationValid, mediaValid, configValid]);

      // Set selected area zones to ensure location step is valid
      if (event.areas && event.areas.length > 0 && event.audienceZones && event.audienceZones.length > 0) {
        this.selectedAreaZonesSig.set({
          selectedAreas: event.areas,
          selectedZones: event.audienceZones
        });
      }
    }, 0);
  }

  // Form Array getters
  get eventPhotosFormArray(): FormArray {
    return this.mediaForm.get('eventPhotoUrls') as FormArray;
  }


  // Navigation methods
  nextStep(): void {
    if (this.isLastStep()) return;

    // Vérifier la validité des dates pour l'étape 1
    if (this.currentStep() === 0) {
      this.generalInfoForm.markAllAsTouched();

      // Vérifier spécifiquement la validité des dates
      const startDatePart = this.generalInfoForm.get('startDatePart')?.value;
      const startTimePart = this.generalInfoForm.get('startTimePart')?.value;
      const endDatePart = this.generalInfoForm.get('endDatePart')?.value;
      const endTimePart = this.generalInfoForm.get('endTimePart')?.value;

      if (startDatePart && startTimePart && endDatePart && endTimePart) {
        const startDate = this.combineDateAndTime(startDatePart, startTimePart);
        const endDate = this.combineDateAndTime(endDatePart, endTimePart);
        const now = new Date();

        if (startDate >= endDate) {
          this.notification.displayNotification('La date de fin doit être postérieure à la date de début', 'error');
          return;
        }

        if (startDate < now) {
          this.notification.displayNotification('La date de début doit être dans le futur', 'error');
          return;
        }
      }

      if (this.generalInfoForm.valid) {
        this.currentStepSig.update(step => step + 1);
        // Mettre à jour le signal de validité
        const validity = this.formValiditySig();
        validity[0] = true;
        this.formValiditySig.set([...validity]);
      } else {
        this.notification.displayNotification('Veuillez remplir tous les champs obligatoires', 'error');
      }
    } else if (this.currentStep() === 1) {
      this.locationForm.markAllAsTouched();
      // Vérifier uniquement la sélection de zones
      if (this.selectedAreaZonesSig() === null ||
          this.selectedAreaZonesSig().selectedAreas.length === 0 ||
          this.selectedAreaZonesSig().selectedZones.length === 0) {
        this.notification.displayNotification('Veuillez sélectionner au moins un espace et une zone', 'error');
        return;
      }
      this.currentStepSig.update(step => step + 1);
      // Mettre à jour le signal de validité
      const validity = [...this.formValiditySig()];
      validity[1] = true;
      this.formValiditySig.set(validity);
    } else if (this.currentStep() === 2) {
      this.mediaForm.markAllAsTouched();
      if (this.mediaForm.valid) {
        this.currentStepSig.update(step => step + 1);
        // Mettre à jour le signal de validité
        const validity = this.formValiditySig();
        validity[2] = true;
        this.formValiditySig.set([...validity]);
      } else {
        this.notification.displayNotification('Veuillez remplir tous les champs obligatoires', 'error');
      }
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStepSig.update(step => step - 1);
    }
  }

  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex <= 3) {
      // If in edit mode, allow navigation to any step without validation
      if (this.modeSig() === 'edit') {
        this.currentStepSig.set(stepIndex);
        return;
      }

      // In create mode, verify that previous steps are valid
      let canNavigate = true;
      for (let i = 0; i < stepIndex; i++) {
        if (!this.formValiditySig()[i]) {
          canNavigate = false;
          break;
        }
      }

      if (canNavigate || stepIndex <= this.currentStep()) {
        this.currentStepSig.set(stepIndex);
      } else {
        this.notification.displayNotification(
          'Veuillez compléter les étapes précédentes avant de continuer',
          'error'
        );
      }
    }
  }

  // Gestion des fichiers photos
  triggerMainPhotoUpload(): void {
    // Don't allow photo upload if images are disabled
    if (this.isImagesDisabled()) {
      return;
    }
    this.mainPhotoInput.nativeElement.click();
  }

  onMainPhotoSelected(event: Event): void {
    // Don't allow photo upload if images are disabled
    if (this.isImagesDisabled()) {
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validation du fichier
      if (!this.validateImageFile(file)) return;

      this.mainPhotoFile = file;

      // Créer l'aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewMainPhoto.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeMainPhoto(): void {
    // Don't allow photo removal if images are disabled
    if (this.isImagesDisabled()) {
      return;
    }

    this.previewMainPhoto.set(null);
    this.mainPhotoFile = null;
    this.mediaForm.patchValue({ mainPhotoUrl: '' });
    if (this.mainPhotoInput) {
      this.mainPhotoInput.nativeElement.value = '';
    }
  }

  triggerAdditionalPhotoUpload(): void {
    // Don't allow photo upload if images are disabled
    if (this.isImagesDisabled()) {
      return;
    }

    this.additionalPhotoInput.nativeElement.click();
  }

  onAdditionalPhotosSelected(event: Event): void {
    // Don't allow photo upload if images are disabled
    if (this.isImagesDisabled()) {
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);

      files.forEach(file => {
        if (this.validateImageFile(file)) {
          this.additionalPhotoFiles.push(file);
          // Remove the required validator to allow empty fields initially
          this.eventPhotosFormArray.push(this.fb.control(''));

          // Créer l'aperçu
          const reader = new FileReader();
          reader.onload = (e) => {
            const currentPreviews = this.additionalPhotosPreview();
            this.additionalPhotosPreview.set([...currentPreviews, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removePhoto(index: number): void {
    // Don't allow photo removal if images are disabled
    if (this.isImagesDisabled()) {
      return;
    }

    // Get the URL of the photo being removed
    const photoUrl = this.eventPhotosFormArray.at(index).value;

    // If this is an existing photo (has a URL), add it to removedGalleryImages
    if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('http')) {
      this.removedGalleryImages.push(photoUrl);
    }

    this.eventPhotosFormArray.removeAt(index);
    this.additionalPhotoFiles.splice(index, 1);
    const currentPreviews = this.additionalPhotosPreview();
    currentPreviews.splice(index, 1);
    this.additionalPhotosPreview.set([...currentPreviews]);
  }

  // Event actors are no longer used in the API

  private validateImageFile(file: File): boolean {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      this.notification.displayNotification('Veuillez sélectionner un fichier image', 'error');
      return false;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.notification.displayNotification('La taille du fichier ne doit pas dépasser 5MB', 'error');
      return false;
    }

    return true;
  }

  // Area/Zone selection handling
  onAreaZoneSelectionChange(selection: any): void {
    console.log('Zones sélectionnées:', selection);
    if (selection && (selection.selectedAreas?.length > 0 || selection.selectedZones?.length > 0)) {
      this.selectedAreaZonesSig.set(selection);

      // Forcer la mise à jour de la validité du formulaire
      const validity = this.formValiditySig();
      validity[1] = this.locationForm.valid && true;
      this.formValiditySig.set([...validity]);
    } else {
      this.selectedAreaZonesSig.set(null);
    }
  }

  // Méthodes utilitaires pour le template
  formatDateRange(): string {
    const startDatePart = this.generalInfoForm.get('startDatePart')?.value;
    const startTimePart = this.generalInfoForm.get('startTimePart')?.value;
    const endDatePart = this.generalInfoForm.get('endDatePart')?.value;
    const endTimePart = this.generalInfoForm.get('endTimePart')?.value;

    if (startDatePart && startTimePart && endDatePart && endTimePart) {
      const startDate = this.combineDateAndTime(startDatePart, startTimePart);
      const endDate = this.combineDateAndTime(endDatePart, endTimePart);
      const datePipe = new DatePipe('fr');
      return `${datePipe.transform(startDate, 'dd/MM/yyyy HH:mm')} - ${datePipe.transform(endDate, 'dd/MM/yyyy HH:mm')}`;
    }

    return 'Non défini';
  }

  formatAddress(): string {
    const address = this.locationForm.get('address')?.value;
    if (address) {
      return `${address.street}, ${address.postalCode} ${address.city}`;
    }
    return 'Non définie';
  }

  getSelectedAreasCount(): number {
    return this.selectedAreaZonesSig()?.selectedAreas?.length || 0;
  }

  getSelectedZonesCount(): number {
    return this.selectedAreaZonesSig()?.selectedZones?.length || 0;
  }

  getStatusIcon(status: EventStatus): string {
    switch (status) {
      case EventStatus.DRAFT: return 'edit';
      case EventStatus.PUBLISHED: return 'public';
      case EventStatus.CANCELLED: return 'cancel';
      case EventStatus.COMPLETED: return 'check_circle';
      case EventStatus.ARCHIVED: return 'archive';
      default: return 'help';
    }
  }

  /**
   * Gets a human-readable label for an event status
   * @param status The event status
   * @returns A human-readable label
   */
  getStatusLabel(status: EventStatus): string {
    switch (status) {
      case EventStatus.DRAFT: return 'Brouillon';
      case EventStatus.PUBLISHED: return 'Publié';
      case EventStatus.CANCELLED: return 'Annulé';
      case EventStatus.COMPLETED: return 'Terminé';
      case EventStatus.ARCHIVED: return 'Archivé';
      default: return 'Inconnu';
    }
  }

  /**
   * Updates the event status using the dedicated endpoint
   * @param eventId The ID of the event
   * @param newStatus The new status to set
   * @returns A promise that resolves when the status is updated
   */
  private updateEventStatus(eventId: number, newStatus: EventStatus): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.eventService.updateEventStatus(eventId, newStatus)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: (result) => {
          if (result) {
            this.notification.displayNotification(`Statut de l'événement mis à jour en : ${newStatus}`, 'valid');
            resolve();
          } else {
            reject(new Error('Failed to update event status'));
          }
          this.cdRef.markForCheck()
        },
        error: (error) => {
          this.notification.displayNotification('Erreur lors de la mise à jour du statut de l\'événement', 'error');
          reject(error);
        }
      });
    });
  }

  /**
   * Shows a confirmation dialog for event creation or update
   * @returns A promise that resolves to true if confirmed, false otherwise
   */
  private showConfirmationDialog(): Promise<boolean> {
    const isCreating = this.modeSig() === 'create';
    const eventName = this.generalInfoForm.get('name')?.value || 'cet événement';

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: isCreating ? 'Créer l\'événement' : 'Modifier l\'événement',
        message: isCreating
          ? `Êtes-vous sûr de vouloir créer l'événement "${eventName}" ?`
          : `Êtes-vous sûr de vouloir enregistrer les modifications de l'événement "${eventName}" ?`,
        confirmButtonText: isCreating ? 'Créer' : 'Enregistrer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: 'primary'
      }
    });

    return dialogRef.afterClosed().toPromise();
  }

  // Form submission
  onSubmitEvent(): void {
    // Forcer la vérification de la date actuelle avant soumission
    const startDatePart = this.generalInfoForm.get('startDatePart')?.value;
    const startTimePart = this.generalInfoForm.get('startTimePart')?.value;

    if (startDatePart && startTimePart) {
      const startDate = this.combineDateAndTime(startDatePart, startTimePart);
      const now = new Date();

      if (startDate < now) {
        this.notification.displayNotification('La date de début doit être dans le futur', 'error');
        this.currentStepSig.set(0);
        return;
      }
    }

    if (!this.validateAllSteps()) {
      this.notification.displayNotification('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }

    // Show confirmation dialog before proceeding
    this.showConfirmationDialog().then(confirmed => {
      if (!confirmed) {
        return; // User cancelled the action
      }

      this.isSubmittingSig.set(true);

      // Get the selected status from the form
      const selectedStatus = this.configForm.get('status')?.value;

      // Construire l'objet données sans upload de fichiers
      const eventData = this.buildEventDataDto('', []);

      // Différentes logiques pour création et mise à jour
      if (this.modeSig() === 'create') {
        // Pour la création, on crée d'abord l'événement, puis on upload les fichiers
        this.eventService.createEvent(eventData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
          next: (createdEvent) => {
            if (createdEvent?.id) {
              // Stocker l'ID de l'événement créé
              this.eventId = createdEvent.id;

              // Maintenant qu'on a un ID d'événement, on peut uploader les fichiers
              this.uploadEventFiles(this.eventId).then(() => {
                // Check if we need to update the status (if it's not DRAFT)
                if (selectedStatus && selectedStatus !== EventStatus.DRAFT) {
                  // Update the status using the dedicated endpoint
                  this.updateEventStatus(this.eventId!, selectedStatus)
                    .then(() => {
                      this.notification.displayNotification(`Événement créé et statut défini à : ${this.getStatusLabel(selectedStatus)}`, 'valid');
                      this.isSubmittingSig.set(false);
                      this.router.navigate(['/admin/events']);
                    })
                    .catch(() => {
                      this.notification.displayNotification('Événement créé, mais erreur lors de la définition du statut', 'warning');
                      this.isSubmittingSig.set(false);
                      this.router.navigate(['/admin/events']);
                    });
                } else {
                  this.notification.displayNotification('Événement créé avec succès !', 'valid');
                  this.isSubmittingSig.set(false);
                  this.router.navigate(['/admin/events']);
                }
              }).catch(error => {
                console.error('Error uploading files after event creation:', error);
                this.isSubmittingSig.set(false);
                this.router.navigate(['/admin/events']);
              });
            } else {
              this.notification.displayNotification('Erreur lors de la création de l\'événement', 'error');
              this.isSubmittingSig.set(false);
            }
            this.cdRef.markForCheck()
          },
          error: (error) => {
            this.notification.displayNotification('Erreur lors de la création de l\'événement', 'error');
            this.isSubmittingSig.set(false);
            this.cdRef.markForCheck()
          }
        });
      } else {
        // Pour la mise à jour, on peut uploader les fichiers en même temps
        this.uploadFilesAndBuildEventData().then(eventDataWithFiles => {
          // First update the event data
          this.eventService.updateEvent(this.eventId!, eventDataWithFiles)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
              if (result) {
                // Check if the status has changed
                const originalStatus = this.eventToEditSig()?.status;
                if (selectedStatus && originalStatus && selectedStatus !== originalStatus) {
                  // Update the status using the dedicated endpoint
                  this.updateEventStatus(this.eventId!, selectedStatus)
                    .then(() => {
                      this.notification.displayNotification('Événement et statut modifiés avec succès !', 'valid');
                      this.isSubmittingSig.set(false);
                      this.router.navigate(['/admin/events']);
                    })
                    .catch(() => {
                      this.notification.displayNotification('Événement modifié, mais erreur lors de la mise à jour du statut', 'warning');
                      this.isSubmittingSig.set(false);
                      this.router.navigate(['/admin/events']);
                    });
                } else {
                  this.notification.displayNotification('Événement modifié avec succès !', 'valid');
                  this.isSubmittingSig.set(false);
                  this.router.navigate(['/admin/events']);
                }
              } else {
                this.isSubmittingSig.set(false);
              }
              this.cdRef.markForCheck()
            },
            error: (error) => {
              this.notification.displayNotification('Erreur lors de la modification de l\'événement', 'error');
              this.isSubmittingSig.set(false);
              this.cdRef.markForCheck()
            }
          });
        }).catch(error => {
          this.notification.displayNotification('Erreur lors de l\'upload des fichiers', 'error');
          this.isSubmittingSig.set(false);
          this.cdRef.markForCheck()
        });
      }
    });
  }

  private async uploadFilesAndBuildEventData(): Promise<EventDataDto> {
    // Upload files if we have an event ID
    if (this.eventId) {
      // 1. Delete removed gallery images
      await this.deleteRemovedGalleryImages();

      // 2. Upload main photo if changed
      let mainPhotoUrl = this.mediaForm.get('mainPhotoUrl')?.value || '';
      if (this.mainPhotoFile) {
        // Upload main photo
        mainPhotoUrl = await this.simulateFileUpload(this.mainPhotoFile);
      }

      // 3. Upload new gallery images in batch
      let newGalleryUrls: string[] = [];
      if (this.additionalPhotoFiles.length > 0) {
        newGalleryUrls = await this.uploadGalleryImagesInBatch();
      }

      // 4. Combine existing gallery URLs (that weren't removed) with new ones
      const existingGalleryUrls = this.getExistingGalleryUrls();
      const allGalleryUrls = [...existingGalleryUrls, ...newGalleryUrls];

      return this.buildEventDataDto(mainPhotoUrl, allGalleryUrls);
    } else {
      // For new events, we'll upload files after creation
      return this.buildEventDataDto('', []);
    }
  }

  /**
   * Deletes gallery images that were removed during editing
   * Uses a sequential approach to ensure each deletion completes before starting the next one
   */
  private async deleteRemovedGalleryImages(): Promise<void> {
    if (!this.eventId || this.removedGalleryImages.length === 0) return;

    // Show notification about deletion process
    if (this.removedGalleryImages.length > 1) {
      this.notification.displayNotification(
        `Suppression de ${this.removedGalleryImages.length} images en cours...`,
        'info'
      );
    }

    // Process deletions sequentially instead of in parallel
    for (const imageUrl of this.removedGalleryImages) {
      try {
        // Extract the image path from the URL
        const imagePath = this.extractImagePathFromUrl(imageUrl);
        if (!imagePath) {
          console.warn('Could not extract image path from URL:', imageUrl);
          continue; // Skip this image
        }

        // Wait for each deletion to complete before moving to the next
        await new Promise<void>((resolve, reject) => {
          this.eventService.deleteGalleryImage(this.eventId!, imagePath)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
              console.log(`Successfully deleted image: ${imagePath}`);
              resolve();
            },
            error: (err) => {
              console.error('Error deleting gallery image:', err);
              resolve(); // Continue even if there's an error
            }
          });
        });
      } catch (error) {
        console.error('Error in deletion process:', error);
        // Continue with next image even if there's an error
      }
    }

    // Show success notification after all deletions
    if (this.removedGalleryImages.length > 1) {
      this.notification.displayNotification(
        `${this.removedGalleryImages.length} images supprimées avec succès`,
        'valid'
      );
    }

    // Clear the removed images array after processing
    this.removedGalleryImages = [];
  }

  /**
   * Uploads all new gallery images in a single batch
   */
  private async uploadGalleryImagesInBatch(): Promise<string[]> {
    if (!this.eventId || this.additionalPhotoFiles.length === 0) return [];

    return new Promise<string[]>((resolve, reject) => {
      this.eventService.uploadGalleryImages(this.eventId!, this.additionalPhotoFiles)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
        next: (responses) => {
          const urls = responses.map(response => response.fileUrl);
          resolve(urls);
        },
        error: (err) => {
          console.error('Error uploading gallery images:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * Gets the URLs of existing gallery images that weren't removed
   */
  private getExistingGalleryUrls(): string[] {
    const allUrls: string[] = [];

    // Get all URLs from the form array
    for (let i = 0; i < this.eventPhotosFormArray.length; i++) {
      const url = this.eventPhotosFormArray.at(i).value;
      if (url && typeof url === 'string' && url.startsWith('http')) {
        allUrls.push(url);
      }
    }

    return allUrls;
  }

  /**
   * Extracts the image path from a full URL
   * This is needed for the deleteGalleryImage API which expects just the filename
   */
  private extractImagePathFromUrl(url: string): string | null {
    try {
      // Extract the filename from the URL
      // Example: https://storage.example.com/events/gallery/15_performance_1_1688384500000.jpg
      // Should return: 15_performance_1_1688384500000.jpg
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch (e) {
      console.error('Error extracting image path from URL:', e);
      return null;
    }
  }

  /**
   * Uploads files for a newly created event
   * @param eventId The ID of the created event
   * @returns A promise that resolves when all files are uploaded
   */
  private async uploadEventFiles(eventId: number): Promise<void> {
    if (!eventId) return;

    try {
      // Upload main photo if exists
      if (this.mainPhotoFile) {
        await new Promise<void>((resolve, reject) => {
          this.eventService.uploadMainPhoto(eventId, this.mainPhotoFile!)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => resolve(),
            error: (err) => reject(err)
          });
        });
      }

      // Upload all additional photos at once if any
      if (this.additionalPhotoFiles.length > 0) {
        await new Promise<void>((resolve, reject) => {
          this.eventService.uploadGalleryImages(eventId, this.additionalPhotoFiles)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => resolve(),
            error: (err) => reject(err)
          });
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      this.notification.displayNotification('Certaines images n\'ont pas pu être téléchargées', 'warning');
    }
  }

  private simulateFileUpload(file: File): Promise<string> {
    // For new events, we need to create the event first before uploading files
    // So we'll just return an empty string for now
    if (!this.eventId && this.modeSig() === 'create') {
      return Promise.resolve('');
    }

    // For existing events, we can upload the file
    const eventId = this.eventId!;

    // Determine if this is a main photo or a gallery image
    const isMainPhoto = file === this.mainPhotoFile;

    if (isMainPhoto) {
      // Upload main photo
      return new Promise((resolve, reject) => {
        this.eventService.uploadMainPhoto(eventId, file)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
          next: (response) => {
            resolve(response.fileUrl);
          },
          error: (error) => {
            console.error('Error uploading main photo:', error);
            reject(error);
          }
        });
      });
    } else {
      // For gallery images, we'll handle them in batch in uploadFilesAndBuildEventData
      // Just return a placeholder for now
      return Promise.resolve('pending_upload');
    }
  }

  protected validateAllSteps(): boolean {
    // If in edit mode, bypass validation
    if (this.modeSig() === 'edit') {
      // Still update form validity for UI indicators
      const generalValid = this.generalInfoForm.valid || false;
      const locationValid = this.selectedAreaZonesSig() !== null;
      const mediaValid = this.mediaForm.valid || false;
      const configValid = this.configForm.valid || false;
      this.formValiditySig.set([generalValid, locationValid, mediaValid, configValid]);

      // Always return true in edit mode to allow submission
      return true;
    }

    // In create mode, perform normal validation
    // Marquer tous les champs comme touchés pour afficher les erreurs
    this.generalInfoForm.markAllAsTouched();
    this.locationForm.markAllAsTouched();
    this.mediaForm.markAllAsTouched();
    this.configForm.markAllAsTouched();

    const generalValid = this.generalInfoForm.valid || false;
    // Pour l'étape de lieu, on vérifie uniquement la sélection de zones
    const locationValid = this.selectedAreaZonesSig() !== null;
    const mediaValid = this.mediaForm.valid || false;
    const configValid = this.configForm.valid || false;

    // Mettre à jour le signal de validité
    this.formValiditySig.set([generalValid, locationValid, mediaValid, configValid]);

    // Si le formulaire général n'est pas valide et qu'on n'est pas sur cette étape, aller à cette étape
    if (!generalValid && this.currentStep() !== 0) {
      this.currentStepSig.set(0);
      this.notification.displayNotification('Veuillez corriger les erreurs dans les informations générales', 'error');
      return false;
    }

    // Si le formulaire de lieu n'est pas valide et qu'on n'est pas sur cette étape, aller à cette étape
    if (!locationValid && this.currentStep() !== 1) {
      this.currentStepSig.set(1);
      this.notification.displayNotification('Veuillez corriger les erreurs dans le lieu et les espaces', 'error');
      return false;
    }

    // Si le formulaire de médias n'est pas valide et qu'on n'est pas sur cette étape, aller à cette étape
    if (!mediaValid && this.currentStep() !== 2) {
      this.currentStepSig.set(2);
      this.notification.displayNotification('Veuillez corriger les erreurs dans les médias', 'error');
      return false;
    }

    return generalValid && locationValid && mediaValid && configValid;
  }

  private combineFormDateTimeValues(): void {
    const startDatePart = this.generalInfoForm.get('startDatePart')?.value;
    const startTimePart = this.generalInfoForm.get('startTimePart')?.value;
    const endDatePart = this.generalInfoForm.get('endDatePart')?.value;
    const endTimePart = this.generalInfoForm.get('endTimePart')?.value;

    if (startDatePart && startTimePart) {
      const startDate = this.combineDateAndTime(startDatePart, startTimePart);
      this.generalInfoForm.addControl('startDate', this.fb.control(startDate));
    }

    if (endDatePart && endTimePart) {
      const endDate = this.combineDateAndTime(endDatePart, endTimePart);
      this.generalInfoForm.addControl('endDate', this.fb.control(endDate));
    }
  }

  private buildEventDataDto(mainPhotoUrl: string, additionalPhotoUrls: string[]): EventDataDto {
    // Combiner les parties date et heure
    this.combineFormDateTimeValues();
    // Get the raw form values (including disabled fields)
    const generalInfo = this.generalInfoForm.getRawValue();
    const location = this.locationForm.getRawValue();
    const config = this.configForm.getRawValue();
    const areaZoneSelection = this.selectedAreaZonesSig();

    const userStructureId = this.structureId || this.userStructureId();
    if (!userStructureId) {
      throw new Error('Structure ID is required');
    }

    // Convert categoryId to categoryIds array
    const categoryIds = Array.isArray(generalInfo.categoryId)
      ? generalInfo.categoryId
      : (generalInfo.categoryId ? [generalInfo.categoryId] : []);

    // Create base DTO with required fields that should always be included
    // Note: status is not included in the DTO as it should be set separately using the dedicated endpoint
    const eventData: Partial<EventDataDto> = {
      structureId: userStructureId,
    };

    // In edit mode, only include fields that are allowed to be modified based on event status
    if (this.modeSig() === 'edit') {
      const status = this.currentEventStatusSig();
      const matrix = this.fieldModificationMatrix[status];

      // Only include fields that are allowed to be modified
      if (matrix.name) eventData.name = generalInfo.name;
      if (matrix.categoryIds) eventData.categoryIds = categoryIds;
      if (matrix.shortDescription) eventData.shortDescription = generalInfo.shortDescription;
      if (matrix.fullDescription) eventData.fullDescription = generalInfo.fullDescription;
      if (matrix.tags) eventData.tags = this.parsedTags();
      if (matrix.startDate) eventData.startDate = generalInfo.startDate;
      if (matrix.endDate) eventData.endDate = generalInfo.endDate;
      if (matrix.address) eventData.address = location.address;
      if (matrix.audienceZones) {
        eventData.areaIds = areaZoneSelection?.selectedAreas?.map((area: any) => area.id) || [];
        eventData.audienceZones = areaZoneSelection?.selectedZones?.map((zoneConfig: any) => ({
          templateId: zoneConfig.template?.id || zoneConfig.zone?.id,
          allocatedCapacity: zoneConfig.allocatedCapacity
        })) || [];
      }
      if (matrix.displayOnHomepage) eventData.displayOnHomepage = config.displayOnHomepage;
      if (matrix.isFeaturedEvent) eventData.isFeaturedEvent = config.isFeaturedEvent;
      // if (matrix.images) {
      //   eventData.mainPhotoUrl = mainPhotoUrl;
      //   eventData.eventPhotoUrls = additionalPhotoUrls;
      // }
    } else {
      // In create mode, include all fields
      eventData.categoryIds = categoryIds;
      eventData.shortDescription = generalInfo.shortDescription;
      eventData.fullDescription = generalInfo.fullDescription;
      eventData.tags = this.parsedTags();
      eventData.startDate = generalInfo.startDate;
      eventData.endDate = generalInfo.endDate;
      eventData.address = location.address;
      eventData.areaIds = areaZoneSelection?.selectedAreas?.map((area: any) => area.id) || [];
      eventData.audienceZones = areaZoneSelection?.selectedZones?.map((zoneConfig: any) => ({
        templateId: zoneConfig.template?.id || zoneConfig.zone?.id,
        allocatedCapacity: zoneConfig.allocatedCapacity
      })) || [];
      eventData.displayOnHomepage = config.displayOnHomepage;
      eventData.isFeaturedEvent = config.isFeaturedEvent;
    //   eventData.mainPhotoUrl = mainPhotoUrl;
    //   eventData.eventPhotoUrls = additionalPhotoUrls;
    }

    // Log the event data to help with debugging
    console.log('Event data being sent to API:', eventData);

    return eventData as EventDataDto;
  }

  // Cancel and navigation
  onCancel(): void {
    this.router.navigate(['/admin/events']);
  }

  // Utility methods
  private canModifyField(fieldName: keyof FieldModificationMatrix): boolean {
    const currentStatus = this.currentEventStatus();
    const statusMatrix = this.fieldModificationMatrix[currentStatus];
    return statusMatrix ? statusMatrix[fieldName] : true;
  }

  /**
   * Updates the disabled state of form controls based on the current event status
   */
  private updateFormControlsDisabledState(): void {
    // Only update if forms are initialized
    if (!this.generalInfoForm || !this.locationForm || !this.mediaForm || !this.configForm) {
      return;
    }

    // General Info Form
    this.setControlDisabled(this.generalInfoForm, 'name', this.isNameDisabled());
    this.setControlDisabled(this.generalInfoForm, 'categoryId', this.isCategoryDisabled());
    this.setControlDisabled(this.generalInfoForm, 'shortDescription', this.isDescriptionDisabled());
    this.setControlDisabled(this.generalInfoForm, 'fullDescription', this.isDescriptionDisabled());
    this.setControlDisabled(this.generalInfoForm, 'tagsInput', this.isTagsDisabled());
    this.setControlDisabled(this.generalInfoForm, 'startDatePart', this.isDateDisabled());
    this.setControlDisabled(this.generalInfoForm, 'startTimePart', this.isDateDisabled());
    this.setControlDisabled(this.generalInfoForm, 'endDatePart', this.isDateDisabled());
    this.setControlDisabled(this.generalInfoForm, 'endTimePart', this.isDateDisabled());

    // Location Form - Address is always disabled as it comes from structure
    const addressGroup = this.locationForm.get('address') as FormGroup;
    if (addressGroup) {
      this.setControlDisabled(addressGroup, 'street', true);
      this.setControlDisabled(addressGroup, 'city', true);
      this.setControlDisabled(addressGroup, 'postalCode', true);
      this.setControlDisabled(addressGroup, 'country', true);
    }

    // Config Form
    this.setControlDisabled(this.configForm, 'displayOnHomepage', this.isVisibilityDisabled());
    this.setControlDisabled(this.configForm, 'isFeaturedEvent', this.isVisibilityDisabled());
  }

  /**
   * Helper method to set the disabled state of a form control
   */
  private setControlDisabled(form: FormGroup, controlName: string, disabled: boolean): void {
    const control = form.get(controlName);
    if (control) {
      if (disabled) {
        control.disable();
      } else {
        control.enable();
      }
    }
  }

  /**
   * Vérifie si le nom peut être modifié
   */
  isNameDisabled(): boolean {
    return !this.canModifyField('name');
  }

  /**
   * Vérifie si la catégorie peut être modifiée
   */
  isCategoryDisabled(): boolean {
    return !this.canModifyField('categoryIds');
  }

  /**
   * Vérifie si la description peut être modifiée
   */
  isDescriptionDisabled(): boolean {
    return !this.canModifyField('shortDescription') || !this.canModifyField('fullDescription');
  }

  /**
   * Vérifie si les tags peuvent être modifiés
   */
  isTagsDisabled(): boolean {
    return !this.canModifyField('tags');
  }

  /**
   * Vérifie si les dates peuvent être modifiées
   */
  isDateDisabled(): boolean {
    return !this.canModifyField('startDate') || !this.canModifyField('endDate');
  }

  /**
   * Vérifie si l'adresse peut être modifiée
   */
  isAddressDisabled(): boolean {
    return !this.canModifyField('address');
  }

  /**
   * Vérifie si les zones d'audience peuvent être modifiées
   */
  isAudienceZonesDisabled(): boolean {
    return !this.canModifyField('audienceZones');
  }

  /**
   * Vérifie si les images peuvent être modifiées
   */
  isImagesDisabled(): boolean {
    return !this.canModifyField('images');
  }

  /**
   * Vérifie si la visibilité peut être modifiée
   */
  isVisibilityDisabled(): boolean {
    return !this.canModifyField('displayOnHomepage') || !this.canModifyField('isFeaturedEvent');
  }

  /**
   * Obtient le message d'erreur pour un champ de formulaire
   */
  getFormErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `Maximum ${maxLength} caractères autorisés`;
    }
    if (field.hasError('email')) {
      return 'Format d\'email invalide';
    }

    return 'Champ invalide';
  }

}
