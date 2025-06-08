import { Component, Input, OnInit, inject, signal, computed, WritableSignal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventAreasZonesSelectionComponent, AreaZoneSelection } from '../event-areas-zones-selection/event-areas-zones-selection.component';

// Angular Material
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotificationService } from '../../../../../../core/services/domain/utilities/notification.service';
import { EventService } from '../../../../../../core/services/domain/event/event.service';
import { CategoryService } from '../../../../../../core/services/domain/event/category.service';
import { UserStructureService } from '../../../../../../core/services/domain/user-structure/user-structure.service';
import { StructureService } from '../../../../../../core/services/domain/structure/structure.service';
import { EventDataDto, EventModel } from '../../../../../../core/models/event/event.model';
import { SeatingType } from '../../../../../../core/models/event/event-audience-zone.model';
import { EventStatus } from '../../../../../../core/models/event/event.model';

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
    EventAreasZonesSelectionComponent,
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  // ViewChild pour les inputs de fichier
  @ViewChild('mainPhotoInput') mainPhotoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('additionalPhotoInput') additionalPhotoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('actorPhotoInput') actorPhotoInput!: ElementRef<HTMLInputElement>;

  // Injected services
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private categoryService = inject(CategoryService);
  private userStructureService = inject(UserStructureService);
  private structureService = inject(StructureService);
  private notification = inject(NotificationService);

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

  // Signaux pour les prévisualisations d'images
  public previewMainPhoto = signal<string | null>(null);
  public additionalPhotosPreview = signal<string[]>([]);
  public actorPhotosPreview = signal<string[]>([]);

  // Variables pour la gestion des fichiers
  private mainPhotoFile: File | null = null;
  private additionalPhotoFiles: File[] = [];
  private actorPhotoFiles: File[] = [];
  private currentActorPhotoIndex = 0;

  // Public computed signals
  public readonly currentStep = computed(() => this.currentStepSig());
  public readonly canProceed = computed(() => true); // Toujours actif, la validation sera faite dans nextStep()
  public readonly isLastStep = computed(() => this.currentStep() === 3);
  public readonly formProgress = computed(() => ((this.currentStep() + 1) / 4) * 100);
  public readonly isLoading = computed(() => this.isLoadingEventSig());
  public readonly isSubmitting = computed(() => this.isSubmittingSig());
  public readonly pageTitle = computed(() =>
    this.modeSig() === 'create' ? 'Créer un événement' : 'Modifier l\'événement'
  );
  public readonly submitButtonText = computed(() =>
    this.modeSig() === 'create' ? 'Créer l\'événement' : 'Enregistrer les modifications'
  );
  public readonly parsedTags = computed(() => {
    const tagsInput = this.generalInfoForm?.get('tagsInput')?.value || '';
    if (!tagsInput) return [];
    return tagsInput.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '');
  });

  // Data signals
  public readonly categories = computed(() => this.categoryService.categories());
  public readonly userStructure = computed(() => this.userStructureService.userStructure());
  public readonly userStructureId = computed(() => this.userStructureService.userStructureId());

  // Forms
  generalInfoForm!: FormGroup;
  locationForm!: FormGroup;
  mediaForm!: FormGroup;
  configForm!: FormGroup;

  // Enums for template
  SeatingType = SeatingType;
  EventStatus = EventStatus;

  // Options
  seatingTypeOptions = [
    { value: SeatingType.SEATED, label: 'Places assises' },
    { value: SeatingType.STANDING, label: 'Places debout' },
    { value: SeatingType.MIXED, label: 'Mixte' }
  ];

  eventStatusOptions = [
    { value: EventStatus.DRAFT, label: 'Brouillon' },
    { value: EventStatus.PUBLISHED, label: 'Publié' },
    { value: EventStatus.PENDING_APPROVAL, label: 'En attente d\'approbation' }
  ];

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
  }

  ngOnInit(): void {
    // Get eventId from route if not provided as input
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.eventId = +params['id'];
        this.modeSig.set('edit');
      }
    });

    // Load categories
    this.categoryService.loadCategories().subscribe();

    // Initialize based on mode
    if (this.eventId && this.modeSig() === 'edit') {
      this.loadEventForEdit();
    } else {
      this.initializeForCreation();
    }

    // Écouter les changements du type de placement par défaut
    this.locationForm.get('defaultSeatingType')?.valueChanges.subscribe(value => {
      console.log('Type de placement par défaut mis à jour:', value);
    });
  }

  private initializeForms(): void {
    // General Info Form
    this.generalInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: [null, Validators.required],
      shortDescription: ['', [Validators.maxLength(200)]],
      fullDescription: ['', [Validators.required, Validators.minLength(10)]],
      tagsInput: [''],
      startDatePart: ['', Validators.required],
      startTimePart: ['', Validators.required],
      endDatePart: ['', Validators.required],
      endTimePart: ['', Validators.required],
      isFreeEvent: [true]
    });

    // Location Form
    this.locationForm = this.fb.group({
      address: this.fb.group({
        street: [{value: '', disabled: true}],
        city: [{value: '', disabled: true}],
        postalCode: [{value: '', disabled: true}],
        country: [{value: 'France', disabled: true}]
      }),
      defaultSeatingType: [SeatingType.MIXED, Validators.required]
    });

    // Media Form
    this.mediaForm = this.fb.group({
      mainPhotoUrl: [''],
      eventPhotoUrls: this.fb.array([]),
      eventActors: this.fb.array([]),
      links: this.fb.array([])
    });

    // Config Form
    this.configForm = this.fb.group({
      displayOnHomepage: [false],
      isFeaturedEvent: [false],
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
    this.eventService.getEventById(this.eventId, true).subscribe({
      next: (event) => {
        if (event) {
          this.eventToEditSig.set(event);
          this.populateFormsWithEventData(event);
        } else {
          this.notification.displayNotification('Événement non trouvé', 'error');
          this.router.navigate(['/admin/events']);
        }
        this.isLoadingEventSig.set(false);
      },
      error: (error) => {
        this.notification.displayNotification(
          'Erreur lors du chargement de l\'événement',
          'error'
        );
        this.isLoadingEventSig.set(false);
        this.router.navigate(['/admin/events']);
      }
    });
  }

  private populateFormsWithEventData(event: EventModel): void {
    // Préparer les dates et heures
    const startDateParts = this.splitDateToDateAndTimeParts(event.startDate);
    const endDateParts = this.splitDateToDateAndTimeParts(event.endDate);

    // General info
    this.generalInfoForm.patchValue({
      name: event.name,
      address: event.address,
      categoryId: event.category.id,
      shortDescription: event.shortDescription,
      fullDescription: event.fullDescription,
      startDatePart: startDateParts.datePart,
      startTimePart: startDateParts.timePart,
      endDatePart: endDateParts.datePart,
      endTimePart: endDateParts.timePart,
      isFreeEvent: event.isFreeEvent
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
      defaultSeatingType: event.defaultSeatingType
    });

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
      photosArray.push(this.fb.control(url, Validators.required));
    });

    // Set previews for additional photos
    if (event.eventPhotoUrls) {
      this.additionalPhotosPreview.set([...event.eventPhotoUrls]);
    }

    // Event actors
    const actorsArray = this.eventActorsFormArray;
    actorsArray.clear();
    const actorPreviews: string[] = [];
    event.eventActors?.forEach(actor => {
      actorsArray.push(this.fb.group({
        id: [actor.id],
        name: [actor.name, Validators.required],
        role: [actor.role, Validators.required],
        photoUrl: [actor.photoUrl]
      }));
      actorPreviews.push(actor.photoUrl || '');
    });
    this.actorPhotosPreview.set(actorPreviews);

    // Links
    const linksArray = this.linksFormArray;
    linksArray.clear();
    event.links?.forEach(link => {
      linksArray.push(this.fb.control(link, Validators.required));
    });

    // Config
    this.configForm.patchValue({
      displayOnHomepage: event.displayOnHomepage,
      isFeaturedEvent: event.isFeaturedEvent,
      status: event.status
    });
  }

  // Form Array getters
  get eventPhotosFormArray(): FormArray {
    return this.mediaForm.get('eventPhotoUrls') as FormArray;
  }

  get eventActorsFormArray(): FormArray {
    return this.mediaForm.get('eventActors') as FormArray;
  }

  get linksFormArray(): FormArray {
    return this.mediaForm.get('links') as FormArray;
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
      // Vérifier uniquement le type de placement et la sélection de zones
      if (this.locationForm.get('defaultSeatingType')?.valid) {
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
      } else {
        this.notification.displayNotification('Veuillez sélectionner un type de placement par défaut', 'error');
      }
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
      // Vérifier que les étapes précédentes sont valides
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
    this.mainPhotoInput.nativeElement.click();
  }

  onMainPhotoSelected(event: Event): void {
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
    this.previewMainPhoto.set(null);
    this.mainPhotoFile = null;
    this.mediaForm.patchValue({ mainPhotoUrl: '' });
    if (this.mainPhotoInput) {
      this.mainPhotoInput.nativeElement.value = '';
    }
  }

  triggerAdditionalPhotoUpload(): void {
    this.additionalPhotoInput.nativeElement.click();
  }

  onAdditionalPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);

      files.forEach(file => {
        if (this.validateImageFile(file)) {
          this.additionalPhotoFiles.push(file);
          this.eventPhotosFormArray.push(this.fb.control('', Validators.required));

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
    this.eventPhotosFormArray.removeAt(index);
    this.additionalPhotoFiles.splice(index, 1);
    const currentPreviews = this.additionalPhotosPreview();
    currentPreviews.splice(index, 1);
    this.additionalPhotosPreview.set([...currentPreviews]);
  }

  changeActorPhoto(index: number): void {
    this.currentActorPhotoIndex = index;
    this.actorPhotoInput.nativeElement.click();
  }

  onActorPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!this.validateImageFile(file)) return;

      // S'assurer que le tableau a la bonne taille
      while (this.actorPhotoFiles.length <= this.currentActorPhotoIndex) {
        this.actorPhotoFiles.push(null as any);
      }

      this.actorPhotoFiles[this.currentActorPhotoIndex] = file;

      // Créer l'aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        const currentPreviews = [...this.actorPhotosPreview()];
        while (currentPreviews.length <= this.currentActorPhotoIndex) {
          currentPreviews.push('');
        }
        currentPreviews[this.currentActorPhotoIndex] = e.target?.result as string;
        this.actorPhotosPreview.set(currentPreviews);
      };
      reader.readAsDataURL(file);
    }
  }

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

  // Event actors management
  addEventActor(): void {
    const actorForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      photoUrl: ['']
    });
    this.eventActorsFormArray.push(actorForm);

    // Ajouter un emplacement vide pour la photo
    const currentPreviews = this.actorPhotosPreview();
    this.actorPhotosPreview.set([...currentPreviews, '']);
  }

  removeEventActor(index: number): void {
    this.eventActorsFormArray.removeAt(index);

    // Supprimer la photo correspondante
    this.actorPhotoFiles.splice(index, 1);
    const currentPreviews = this.actorPhotosPreview();
    currentPreviews.splice(index, 1);
    this.actorPhotosPreview.set([...currentPreviews]);
  }

  // Links management
  addExternalLink(): void {
    this.linksFormArray.push(this.fb.control('', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]));
  }

  removeExternalLink(index: number): void {
    this.linksFormArray.removeAt(index);
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
      case EventStatus.PENDING_APPROVAL: return 'schedule';
      case EventStatus.CANCELLED: return 'cancel';
      case EventStatus.COMPLETED: return 'check_circle';
      default: return 'help';
    }
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

    this.isSubmittingSig.set(true);

    // Simuler l'upload des fichiers et construire l'objet données
    this.uploadFilesAndBuildEventData().then(eventData => {
      const operation = this.modeSig() === 'create'
        ? this.eventService.createEvent(eventData)
        : this.eventService.updateEvent(this.eventId!, eventData);

      operation.subscribe({
        next: (result) => {
          if (result) {
            const message = this.modeSig() === 'create'
              ? 'Événement créé avec succès !'
              : 'Événement modifié avec succès !';
            this.notification.displayNotification(message, 'valid');
            this.router.navigate(['/admin/events']);
          }
          this.isSubmittingSig.set(false);
        },
        error: (error) => {
          const message = this.modeSig() === 'create'
            ? 'Erreur lors de la création de l\'événement'
            : 'Erreur lors de la modification de l\'événement';
          this.notification.displayNotification(message, 'error');
          this.isSubmittingSig.set(false);
        }
      });
    }).catch(error => {
      this.notification.displayNotification('Erreur lors de l\'upload des fichiers', 'error');
      this.isSubmittingSig.set(false);
    });
  }

  private async uploadFilesAndBuildEventData(): Promise<EventDataDto> {
    // Ici, vous devriez implémenter l'upload réel des fichiers vers votre serveur
    // Pour l'instant, on simule avec des URLs temporaires

    let mainPhotoUrl = this.mediaForm.get('mainPhotoUrl')?.value || '';
    if (this.mainPhotoFile) {
      // Simuler l'upload - remplacez par votre logique d'upload
      mainPhotoUrl = await this.simulateFileUpload(this.mainPhotoFile);
    }

    const additionalPhotoUrls: string[] = [];
    for (let i = 0; i < this.additionalPhotoFiles.length; i++) {
      if (this.additionalPhotoFiles[i]) {
        const url = await this.simulateFileUpload(this.additionalPhotoFiles[i]);
        additionalPhotoUrls.push(url);
      }
    }

    // Upload des photos d'acteurs
    const eventActorsData = [];
    for (let i = 0; i < this.eventActorsFormArray.length; i++) {
      const actorFormValue = this.eventActorsFormArray.at(i).value;
      let photoUrl = actorFormValue.photoUrl || '';

      if (this.actorPhotoFiles[i]) {
        photoUrl = await this.simulateFileUpload(this.actorPhotoFiles[i]);
      }

      eventActorsData.push({
        ...actorFormValue,
        photoUrl
      });
    }

    return this.buildEventDataDto(mainPhotoUrl, additionalPhotoUrls, eventActorsData);
  }

  private simulateFileUpload(file: File): Promise<string> {
    // Simulation d'upload - remplacez par votre vraie logique d'upload
    return new Promise((resolve) => {
      setTimeout(() => {
        // Retourner une URL simulée
        resolve(`https://example.com/uploads/${file.name}-${Date.now()}`);
      }, 1000);
    });
  }

  protected validateAllSteps(): boolean {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    this.generalInfoForm.markAllAsTouched();
    this.locationForm.markAllAsTouched();
    this.mediaForm.markAllAsTouched();
    this.configForm.markAllAsTouched();

    const generalValid = this.generalInfoForm.valid || false;
    // Pour l'étape de lieu, on vérifie uniquement le type de placement et la sélection de zones
    const locationValid = (this.locationForm.get('defaultSeatingType')?.valid || false) && this.selectedAreaZonesSig() !== null;
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

  private buildEventDataDto(mainPhotoUrl: string, additionalPhotoUrls: string[], eventActorsData: any[]): EventDataDto {
    // Combiner les parties date et heure
    this.combineFormDateTimeValues();
    const generalInfo = this.generalInfoForm.value;
    const location = this.locationForm.value;
    const media = this.mediaForm.value;
    const config = this.configForm.value;
    const areaZoneSelection = this.selectedAreaZonesSig();

    const userStructureId = this.structureId || this.userStructureId();
    if (!userStructureId) {
      throw new Error('Structure ID is required');
    }

    return {
      name: generalInfo.name,
      categoryId: generalInfo.categoryId,
      shortDescription: generalInfo.shortDescription,
      fullDescription: generalInfo.fullDescription,
      tags: this.parsedTags(),
      startDate: generalInfo.startDate,
      endDate: generalInfo.endDate,
      address: location.address,
      structureId: userStructureId,
      areaIds: areaZoneSelection?.selectedAreas?.map((area: any) => area.id) || [],
      isFreeEvent: generalInfo.isFreeEvent,
      defaultSeatingType: location.defaultSeatingType,
      audienceZones: areaZoneSelection?.selectedZones?.map((zoneConfig: any) => ({
        name: zoneConfig.zone.name,
        areaId: zoneConfig.zone.areaId,
        maxCapacity: zoneConfig.allocatedCapacity,
        seatingType: zoneConfig.zone.seatingType,
        isActive: true
      })) || [],
      displayOnHomepage: config.displayOnHomepage,
      isFeaturedEvent: config.isFeaturedEvent,
      eventActors: eventActorsData.filter((actor: any) => actor.name && actor.role),
      links: media.links.filter((link: string) => link.trim() !== ''),
      mainPhotoUrl: mainPhotoUrl,
      eventPhotoUrls: additionalPhotoUrls,
      status: config.status
    };
  }

  // Cancel and navigation
  onCancel(): void {
    this.router.navigate(['/admin/events']);
  }

  // Utility methods
  getFormErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (field?.hasError('minlength')) {
      return `Minimum ${field.errors?.['minlength'].requiredLength} caractères`;
    }
    if (field?.hasError('maxlength')) {
      return `Maximum ${field.errors?.['maxlength'].requiredLength} caractères`;
    }
    if (field?.hasError('pattern')) {
      return 'Format invalide';
    }
    return '';
  }
}
