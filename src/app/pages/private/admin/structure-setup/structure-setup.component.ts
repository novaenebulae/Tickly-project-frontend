import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Router} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDividerModule} from '@angular/material/divider';

// Services
import {AuthService} from '../../../../core/services/domain/user/auth.service';
import {StructureService} from '../../../../core/services/domain/structure/structure.service';
import {NotificationService} from '../../../../core/services/domain/utilities/notification.service';

// Models
import {StructureCreationDto, StructureCreationResponseDto} from '../../../../core/models/structure/structure.model';
import {StructureTypeModel} from '../../../../core/models/structure/structure-type.model';
import {StructureAddressModel} from '../../../../core/models/structure/structure-address.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {UserStructureService} from '../../../../core/services/domain/user-structure/user-structure.service';

@Component({
  selector: 'app-structure-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDividerModule,
  ],
  templateUrl: './structure-setup.component.html',
  styleUrls: ['./structure-setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureSetupComponent implements OnInit {
  structureForm!: FormGroup;
  isLoading = signal(false);
  structureTypes = signal<StructureTypeModel[]>([]);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private structureService = inject(StructureService);
  private userStructureService = inject(UserStructureService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // Check if the user needs structure setup
    if (!this.authService.currentUser()?.structureId !== null && this.authService.currentUser()?.structureId !== undefined) {
      this.notificationService.displayNotification(
        'Vous n\'avez pas besoin de configurer une structure.',
        'error'
      );
      this.router.navigate(['/']);
      return;
    }

    this.initForm();
    this.loadStructureTypes();
  }

  private initForm(): void {
    this.structureForm = this.fb.group({
      name: ['', [Validators.required]],
      typeIds: [[], [Validators.required]],
      description: [''],
      address: this.fb.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        zipCode: ['', [Validators.required]],
        country: ['France', [Validators.required]],
      }),
      phone: [''],
      email: ['', [Validators.email]],
      websiteUrl: [''],
      socialsUrl: [[]], // Array of social media URLs
    });
  }

  private loadStructureTypes(): void {
    this.structureService.getStructureTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types) => {
          this.structureTypes.set(types);
          this.cdRef.markForCheck();
        },
        error: (err) => {
          console.error('Error loading structure types:', err);
          this.notificationService.displayNotification(
            'Impossible de charger les types de structures.',
            'error'
          );
        }
      });
  }

  onSubmit(): void {
    if (this.structureForm.invalid) {
      this.structureForm.markAllAsTouched();
      this.notificationService.displayNotification(
        'Veuillez corriger les erreurs dans le formulaire.',
        'error'
      );
      return;
    }

    this.isLoading.set(true);

    const structureData: StructureCreationDto = {
      name: this.structureForm.get('name')?.value,
      typeIds: this.structureForm.get('typeIds')?.value,
      description: this.structureForm.get('description')?.value,
      address: this.structureForm.get('address')?.value as StructureAddressModel,
      phone: this.structureForm.get('phone')?.value,
      email: this.structureForm.get('email')?.value,
      websiteUrl: this.structureForm.get('websiteUrl')?.value,
      socialsUrl: this.structureForm.get('socialsUrl')?.value,
    };

    this.userStructureService.createStructure(structureData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: StructureCreationResponseDto) => {
          this.isLoading.set(false);
          this.cdRef.markForCheck();
        },
        error: (err) => {
          console.error('Error creating structure:', err);
          this.isLoading.set(false);
          this.cdRef.markForCheck();
          // The structureService.createStructure method already handles error notifications
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

}
