import { Component, inject } from '@angular/core';
import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatFormFieldControl,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule, MatLabel } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { StructureService } from '../../../../core/services/structure.service';

@Component({
  selector: 'app-structure-creation',
  imports: [
    MatLabel,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  providers: [],
  templateUrl: './structure-creation.component.html',
  styleUrl: './structure-creation.component.scss',
})
export class StructureCreationComponent {
  structureCreationForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private structureService: StructureService
  ) {}

  structureDto: StructureDto | null = null;
  structureTypesOptions: StructureType[] = [];

  ngOnInit(): void {
    this.initForm();
    this.structureService.getStructureTypes().subscribe({
      next: (types) => {
        this.structureTypesOptions = types;
        console.log('Structure types loaded:', this.structureTypesOptions);
      },
      error: (error) => {
        console.error('Error loading structure types:', error);
      }
    })
  }


  initForm(): void {
    this.structureCreationForm = this.fb.group({
      structureName: new FormControl('', [Validators.required]),
      structureTypes: new FormControl(''),
      structureCountry: new FormControl('', [Validators.required]),
      structureCity: new FormControl('', [Validators.required]),
      structureStreet: new FormControl('', [Validators.required]),
      structureAddressNumber: new FormControl(''),
      structureDescription: new FormControl(''),
      // structureWebsite: new FormControl(''),
    });
    console.log(this.structureTypesOptions);

  }

  onSubmit(): void {
    if (this.structureCreationForm.invalid) {
      return;
    }

    this.isLoading = true;

    const newStructureValues: StructureDto = {
      name: this.structureCreationForm.get('structureName')?.value,
      typeIds: this.structureCreationForm.get('structureTypes')?.value,
      adress: {
        city: this.structureCreationForm.get('structureCity')?.value,
        street: this.structureCreationForm.get('structureStreet')?.value,
        number: this.structureCreationForm.get('structureAddressNumber')?.value,
        country: this.structureCreationForm.get('structureCountry')?.value,
      },
      description: this.structureCreationForm.get('structureDescription')?.value,
    };

    this.structureService
      .createStructure<StructureDto>(newStructureValues)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(
            'Structure créé avec succès! Vous pouvez maintenant accéder à votre espace.',
            'Fermer',
            {
              duration: 5000,
              panelClass: ['success-snackbar'],
            }
          );
          this.router.navigate(['staff/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(
            error.error?.message ||
              'Une erreur est survenue lors de la création.',
            'Fermer',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
            }
          );
        },
      });
  }

  onResetForm() {
    this.structureCreationForm.reset();
  }
}
