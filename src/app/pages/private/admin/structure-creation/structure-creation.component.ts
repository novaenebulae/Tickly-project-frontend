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
import {StructureService} from '../../../../core/services/structure.service';
import {NotificationService} from '../../../../core/services/notification.service';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AuthService} from '../../../../core/services/auth.service';
import {StructureCreationResponse} from '../../../../core/models/StructureCreationResponse.interface';
import {MatCard, MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';


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
  structureTypesOptions: StructureType[] = [];

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
    const newStructureValues: StructureDto = {
      name: this.structureCreationForm.get('structureName')?.value,
      // Check si typeIds est un Array, si non transforme le typeId (unique) en Array.
      typeIds: Array.isArray(
        this.structureCreationForm.get('structureTypes')?.value
      )
        ? this.structureCreationForm.get('structureTypes')?.value
        : [this.structureCreationForm.get('structureTypes')?.value].filter(
          (id) => !!id
        ),
      adress: {
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
      next: (response: StructureCreationResponse) => {
        console.log('Structure created successfully');
        this.notification.displayNotification(
          'Structure créée avec succès !',
          'valid',
          'Fermer'
        );
        this.auth.updateTokenAndState(response.newToken)
        this.isLoading = false;
        this.router.navigateByUrl('/admin');
      },
      error: (error) => {
        console.error('Error during structure creation:', error);
        const errorMessage =
          error.error?.message ||
          error.message ||
          'Une erreur est survenue lors de la création de la structure.';
        this.notification.displayNotification(
          `Erreur: ${errorMessage}`,
          'error',
          'Fermer'
        );
        this.isLoading = false;
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
