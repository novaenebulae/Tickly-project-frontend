import {Component, OnInit, inject} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {Router} from '@angular/router';
import {StructureService} from '../../../../core/services/domain/structure/structure.service';
import {NotificationService} from '../../../../core/services/domain/utilities/notification.service';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AuthService} from '../../../../core/services/domain/user/auth.service';
import {
  StructureCreationDto,
  StructureCreationResponseDto,
  StructureModel
} from '../../../../core/models/structure/structure.model';
import {MatCard, MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {StructureTypeModel} from '../../../../core/models/structure/structure-type.model';


@Component({
  selector: 'app-structure-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ],
  providers: [],
  templateUrl: './structure-creation.component.html',
  styleUrls: ['./structure-creation.component.scss'],
})
export class StructureCreationComponent implements OnInit {

  structureCreationForm!: FormGroup;
  isLoading = false;
  structureTypesOptions: StructureTypeModel[] = [];

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private structureService = inject(StructureService);
  private notification = inject(NotificationService);
  private auth = inject(AuthService);

  ngOnInit(): void {
    // L'utilisateur est déjà authentifié (géré par AuthGuard)
    // On initialise le formulaire et charge les données nécessaires
    this.initForm();
    this.loadStructureTypes();
  }

  initForm(): void {
    this.structureCreationForm = this.fb.group({
      structureName: ['', [Validators.required]],
      structureTypes: [[], [Validators.required]],
      structureCountry: ['', [Validators.required]],
      structureCity: ['', [Validators.required]],
      structureStreet: ['', [Validators.required]],
      structureAddressNumber: [''],
      structureDescription: [''],
    });
  }

  loadStructureTypes(): void {
    this.isLoading = true;
    this.structureService.getStructureTypes().subscribe({
      next: (types) => {
        this.structureTypesOptions = types;
        console.log('Structure types loaded:', this.structureTypesOptions);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading structure types:', error);
        this.notification.displayNotification(
          'Erreur lors du chargement des types de structure.',
          'error',
          'Fermer'
        );
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    this.structureCreationForm.markAllAsTouched();

    if (this.structureCreationForm.invalid) {
      console.warn('Structure creation form is invalid.');
      return;
    }

    this.isLoading = true;

    // Préparer le DTO de la structure
    const newStructureValues: StructureCreationDto = {
      name: this.structureCreationForm.get('structureName')?.value,
      // Check si typeIds est un Array, si non transforme le typeId (unique) en Array.
      typeIds: Array.isArray(
        this.structureCreationForm.get('structureTypes')?.value
      )
        ? this.structureCreationForm.get('structureTypes')?.value
        : [this.structureCreationForm.get('structureTypes')?.value].filter(
          (id) => !!id
        ),
      address: {
        city: this.structureCreationForm.get('structureCity')?.value,
        street: this.structureCreationForm.get('structureStreet')?.value,
        number:
          this.structureCreationForm.get('structureAddressNumber')?.value || '',
        country: this.structureCreationForm.get('structureCountry')?.value,
      },
      description:
        this.structureCreationForm.get('structureDescription')?.value || '',
    };

    console.log('Submitting structure creation:', newStructureValues);

    this.structureService.createStructure(newStructureValues).subscribe({
      next: (response: StructureModel | undefined) => {
        this.isLoading = false;

        this.notification.displayNotification(
          'Structure créée avec succès !',
          'valid',
          'Fermer'
        );

        // La mise à jour de l'utilisateur se fait déjà dans structure.service.ts
        // Pas besoin de le refaire ici

        // Redirection avec un délai pour s'assurer que la mise à jour est terminée
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 500);
      },
      error: (error) => {
        console.error('Error during structure creation:', error);
        this.isLoading = false;

        let errorMessage = 'Une erreur est survenue lors de la création de la structure.';

        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        this.notification.displayNotification(
          `Erreur: ${errorMessage}`,
          'error',
          'Fermer'
        );
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/home']);
  }

  get structureName() {
    return this.structureCreationForm.get('structureName');
  }

  get structureType() {
    return this.structureCreationForm.get('structureType');
  }

  get structureCountry() {
    return this.structureCreationForm.get('structureCountry');
  }

  get structureCity() {
    return this.structureCreationForm.get('structureCity');
  }

  get structureStreet() {
    return this.structureCreationForm.get('structureStreet');
  }

  protected readonly Validators = Validators;
}
