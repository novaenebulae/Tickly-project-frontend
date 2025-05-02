import { MatTimepickerModule } from '@angular/material/timepicker';
import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormControl,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { map, Observable, Subscription } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatError, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {
  MatStepper,
  MatStepperModule,
  StepperOrientation,
} from '@angular/material/stepper';
import { toObservable } from '@angular/core/rxjs-interop';
import { LayoutService } from '../../../../../../core/services/layout.service';
import { MatCardMdImage, MatCardModule } from '@angular/material/card';

interface Location {
  id: number;
  name: string;
  maxCapacity: number;
}

// Validateur personnalisé : au moins un emplacement doit être actif
export function atLeastOneActiveValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control as FormArray;
    if (!formArray || !formArray.controls) return null;
    const hasActive = formArray.controls.some(
      (group) => group.get('active')?.value === true
    );
    return hasActive ? null : { atLeastOneActive: true };
  };
}

@Component({
  selector: 'app-event-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatStepperModule,
    MatTimepickerModule,
    AsyncPipe,
    MatCardModule
  ],
  templateUrl: './event-creation.component.html',
  styleUrls: ['./event-creation.component.scss'],
})
export class EventCreationComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  eventForm!: FormGroup;
  private subscriptions: Subscription[] = [];

  categories = [
    'Music',
    'Theater',
    'Sport',
    'Conference',
    'Exhibition',
    'Festival',
    'Other',
  ];

  availableLocations: Location[] = [
    { id: 1, name: 'Main Hall', maxCapacity: 500 },
    { id: 2, name: 'Balcony', maxCapacity: 120 },
    { id: 3, name: 'Floor', maxCapacity: 300 },
  ];

  mainPhotoPreview: string | ArrayBuffer | null = null;
  mainPhotoFile: File | null = null;
  selectedEventPhotos: File[] = [];
  readonly MAX_PHOTOS = 10;
  urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  stepperOrientation: Observable<StepperOrientation>;

  private layoutService = inject(LayoutService);
  isDesktop$ = this.layoutService.isDesktop;

  constructor(private fb: FormBuilder) {
    this.stepperOrientation = toObservable(this.isDesktop$).pipe(map(matches => (matches ? 'horizontal' : 'vertical')));
  }


  ngOnInit(): void {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      shortDescription: ['', [Validators.maxLength(300)]],
      genre: [''],
      tags: [''],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      isFreeEvent: [false],

      locations: this.fb.array([], [atLeastOneActiveValidator()]),

      displayOnHomepage: [false],
      isFeaturedEvent: [false],
      fullDescription: ['', [Validators.required, Validators.maxLength(1000)]],
      links: this.fb.array([this.createLinkControl()]),

      saveAsDraft: [false],
    });

    this.initializeLocationForm(this.availableLocations);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get locationControls() {
    return (this.eventForm.get('locations') as FormArray)
      .controls as FormGroup[];
  }

  get linkControls(): AbstractControl[] {
    return (this.eventForm.get('links') as FormArray).controls;
  }

  createLocationGroup(location: Location): FormGroup {
    return this.fb.group({
      locationId: [location.id],
      name: [{ value: location.name, disabled: true }],
      maxCapacity: [{ value: location.maxCapacity, disabled: true }],
      ticketCount: [
        null,
        [Validators.min(0), Validators.max(location.maxCapacity)],
      ],
      ticketPrice: [null, [Validators.min(0)]],
      active: [false],
    });
  }

  initializeLocationForm(locations: Location[]): void {
    const locationsArray = this.eventForm.get('locations') as FormArray;
    locationsArray.clear();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];

    locations.forEach((location) => {
      const locationGroup = this.createLocationGroup(location);
      locationsArray.push(locationGroup);

      const activeControl = locationGroup.get('active');
      if (activeControl) {
        const sub = activeControl.valueChanges.subscribe((isActive) => {
          this.updateLocationValidators(locationGroup, isActive);
        });
        this.subscriptions.push(sub);
      }
    });
  }

  updateLocationValidators(locationGroup: FormGroup, isActive: boolean): void {
    const ticketCountControl = locationGroup.get('ticketCount');
    const ticketPriceControl = locationGroup.get('ticketPrice');
    const maxCapacity = locationGroup.get('maxCapacity')?.value;

    if (!ticketCountControl || !ticketPriceControl) return;

    if (isActive) {
      ticketCountControl.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(maxCapacity),
      ]);
      ticketPriceControl.setValidators([
        Validators.required,
        Validators.min(0),
      ]);
    } else {
      ticketCountControl.setValidators([
        Validators.min(0),
        Validators.max(maxCapacity),
      ]);
      ticketPriceControl.setValidators([Validators.min(0)]);
      ticketCountControl.reset();
      ticketPriceControl.reset();
    }
    ticketCountControl.updateValueAndValidity({ emitEvent: false });
    ticketPriceControl.updateValueAndValidity({ emitEvent: false });
  }

  createLinkControl(): FormControl {
    return this.fb.control('http://', [Validators.pattern(this.urlPattern)]);
  }

  addLink(): void {
    const linksArray = this.eventForm.get('links') as FormArray;
    linksArray.push(this.createLinkControl());
  }

  removeLink(index: number): void {
    const linksArray = this.eventForm.get('links') as FormArray;
    if (linksArray.length > 1) {
      linksArray.removeAt(index);
    } else {
      linksArray.at(0).reset('http://');
    }
  }

  onMainPhotoSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList[0]) {
      this.mainPhotoFile = fileList[0];
      const reader = new FileReader();
      reader.onload = (e) => (this.mainPhotoPreview = reader.result);
      reader.readAsDataURL(this.mainPhotoFile);
      element.value = '';
    } else {
      this.mainPhotoFile = null;
      this.mainPhotoPreview = null;
    }
    this.eventForm.markAsTouched();
  }

  onEventPhotosSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList) {
      const currentCount = this.selectedEventPhotos.length;
      const allowedToAdd = this.MAX_PHOTOS - currentCount;
      const filesToAdd = Array.from(fileList).slice(0, allowedToAdd);

      this.selectedEventPhotos.push(...filesToAdd);

      if (filesToAdd.length < fileList.length) {
        console.warn(
          `Limite de ${this.MAX_PHOTOS} photos atteinte. Seules ${filesToAdd.length} photos ont été ajoutées.`
        );
      }
      element.value = '';
    }
  }

  removeSelectedPhoto(index: number): void {
    if (index >= 0 && index < this.selectedEventPhotos.length) {
      this.selectedEventPhotos.splice(index, 1);
    }
  }

  onSubmit(): void {
    const isDraft = this.eventForm.get('saveAsDraft')?.value === true;
    this.eventForm.markAllAsTouched();

    const isFormValid = this.eventForm.valid;
    const isPhotoPresent = !!this.mainPhotoFile;

    if (isDraft) {
      console.log('Enregistrement en brouillon...');
      console.log('Valeurs brutes:', this.eventForm.getRawValue());
      if (this.mainPhotoFile)
        console.log('Photo principale:', this.mainPhotoFile);
      if (this.selectedEventPhotos.length > 0)
        console.log('Photos événement:', this.selectedEventPhotos);
      // TODO : appel API pour sauvegarder brouillon
    } else {
      if (isFormValid && isPhotoPresent) {
        console.log('Enregistrement final...');
        console.log('Données valides:', this.eventForm.getRawValue());
        console.log('Photo principale:', this.mainPhotoFile);
        console.log('Photos événement:', this.selectedEventPhotos);
        // TODO : appel API pour enregistrement final avec upload fichiers
      } else {
        console.error('Formulaire invalide pour publication.');
        if (!isPhotoPresent) console.error('-> Photo principale manquante.');
        if (!isFormValid)
          console.error(
            '-> Erreurs dans le formulaire:',
            this.findInvalidControls()
          );
        this.navigateToFirstInvalidStep();
      }
    }
  }

  findInvalidControls(): string[] {
    const invalid: string[] = [];
    const controls = this.eventForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) invalid.push(name);
    }
    const locationsArray = this.eventForm.get('locations') as FormArray;
    if (locationsArray.invalid) {
      invalid.push('locations (FormArray)');
      locationsArray.controls.forEach((control, index) => {
        if (control instanceof FormGroup) {
          if (control.invalid) {
            invalid.push(`locations[${index}]`);
            Object.keys(control.controls).forEach((key) => {
              if (control.controls[key].invalid)
                invalid.push(`locations[${index}].${key}`);
            });
          }
        }
      });
    }
    const linksArray = this.eventForm.get('links') as FormArray;
    if (linksArray.invalid) {
      invalid.push('links (FormArray)');
      linksArray.controls.forEach((control, index) => {
        if (control.invalid) invalid.push(`links[${index}]`);
      });
    }
    return invalid;
  }

  navigateToFirstInvalidStep(): void {
    const step1Controls = ['name', 'category', 'startDate', 'startTime'];
    if (step1Controls.some((name) => this.eventForm.get(name)?.invalid)) {
      this.stepper.selectedIndex = 0;
      console.error("Erreurs détectées à l'étape 1.");
      return;
    }
    if (this.eventForm.get('locations')?.invalid) {
      this.stepper.selectedIndex = 1;
      console.error("Erreurs détectées à l'étape 2.");
      return;
    }
    const isDraft = this.eventForm.get('saveAsDraft')?.value === true;
    const step3Controls = ['fullDescription', 'links'];
    const isStep3Invalid = step3Controls.some(
      (name) => this.eventForm.get(name)?.invalid
    );
    const isPhotoMissing = !isDraft && !this.mainPhotoFile;
    if (isStep3Invalid || isPhotoMissing) {
      this.stepper.selectedIndex = 2;
      console.error(
        "Erreurs détectées à l'étape 3 ou photo principale manquante."
      );
      return;
    }
  }

  get displayOnHomepage() { return this.eventForm.get('displayOnHomepage'); }
  get isFeaturedEvent() { return this.eventForm.get('isFeaturedEvent'); }

  get isFormTouched(): boolean {
    // Retourne true si le formulaire FormGroup a été marqué comme 'touched'
    return this.eventForm.touched;
  }

  get fullDescription() { return this.eventForm.get('fullDescription'); }

  get links() { return this.eventForm.get('links') as FormArray; }
  get saveAsDraft() { return this.eventForm.get('saveAsDraft'); }

  get shortDescriptionLength(): number {
    // Utilise le getter 'shortDescription' défini ci-dessus
    return this.eventForm.get('shortDescription')?.value?.length || 0;
  }

}
