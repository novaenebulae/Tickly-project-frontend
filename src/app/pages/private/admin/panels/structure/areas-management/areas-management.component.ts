/**
 * @file Component for managing structure areas and their audience zones in admin backoffice.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NotificationService} from '../../../../../../core/services/domain/utilities/notification.service';
import {
  AreaCreationDto,
  AreaUpdateDto,
  StructureAreaModel
} from '../../../../../../core/models/structure/structure-area.model';
import {SeatingType} from '../../../../../../core/models/event/event-audience-zone.model';
import {MatIcon} from '@angular/material/icon';
import {
  AudienceZoneTemplateCreationDto,
  AudienceZoneTemplateModel,
  AudienceZoneTemplateUpdateDto
} from '../../../../../../core/models/structure/AudienceZoneTemplate.model';
import {UserStructureService} from '../../../../../../core/services/domain/user-structure/user-structure.service';
import {UserRole} from '../../../../../../core/models/user/user-role.enum';
import {AuthService} from '../../../../../../core/services/domain/user/auth.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData
} from '../../../../../../shared/ui/dialogs/confirmation-dialog/confirmation-dialog.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-areas-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIcon, MatDialogModule],
  templateUrl: './areas-management.component.html',
  styleUrls: ['./areas-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreasManagementComponent implements OnInit {
  private userStructureService = inject(UserStructureService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  // Signals for component state
  private selectedAreaSig: WritableSignal<StructureAreaModel | null> = signal(null);
  private showAreaFormSig: WritableSignal<boolean> = signal(false);
  private showAudienceZoneFormSig: WritableSignal<boolean> = signal(false);
  private editingAreaSig: WritableSignal<StructureAreaModel | null> = signal(null);
  private editingAudienceZoneTemplateSig: WritableSignal<AudienceZoneTemplateModel | null> = signal(null);

  // Computed signals
  public readonly audienceZoneTemplates = computed(() => this.userStructureService.currentAreaAudienceZoneTemplates());

  // Computed signals
  public readonly currentStructure = computed(() => this.userStructureService.userStructure());
  public readonly areas = computed(() => this.userStructureService.userStructureAreas());
  public readonly selectedArea = computed(() => this.selectedAreaSig());
  public readonly showAreaForm = computed(() => this.showAreaFormSig());
  public readonly showAudienceZoneForm = computed(() => this.showAudienceZoneFormSig());
  public readonly editingArea = computed(() => this.editingAreaSig());
  public readonly editingAudienceZone = computed(() => this.editingAudienceZoneTemplateSig());

  public readonly isReadonly = computed(() => {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === UserRole.RESERVATION_SERVICE;
  });


  // Forms
  areaForm: FormGroup = new FormGroup({});
  audienceZoneForm: FormGroup = new FormGroup({});

  // Enums for template
  seatingTypeOptions = [
    {value: SeatingType.SEATED, label: 'Places assises'},
    {value: SeatingType.STANDING, label: 'Places debout'},
    {value: SeatingType.MIXED, label: 'Mixte'}
  ];

  constructor() {
    this.initializeForms();
  }

 ngOnInit() {
    this.loadStructureAreas()
 }

  private initializeForms(): void {
    this.areaForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      maxCapacity: [1, [Validators.required, Validators.min(1)]],
      isActive: [true],
      description: ['']
    });

    this.audienceZoneForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      maxCapacity: [1, [Validators.required, Validators.min(1)]],
      isActive: [true],
      seatingType: [SeatingType.STANDING, Validators.required]
    });
  }

  private loadStructureAreas(): void {
    const structure = this.currentStructure();

    if (!structure?.id) {
      return
    }

    this.userStructureService.loadUserStructureAreas(true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(areas => {
      // Les areas sont maintenant chargées dans le service et disponibles via le signal computed
      console.log('Areas chargées:', areas);
    });
  }

  // --- Area Management ---

  onShowCreateAreaForm(): void {
    this.editingAreaSig.set(null);
    this.areaForm.reset({
      name: '',
      maxCapacity: 1,
      isActive: true,
      description: ''
    });
    this.showAreaFormSig.set(true);
  }

  onEditArea(area: StructureAreaModel): void {
    this.editingAreaSig.set(area);
    this.areaForm.patchValue({
      name: area.name,
      maxCapacity: area.maxCapacity,
      isActive: area.active,
    });
    this.showAreaFormSig.set(true);
  }

  onCancelAreaForm(): void {
    this.showAreaFormSig.set(false);
    this.editingAreaSig.set(null);
    this.areaForm.reset();
  }

  onSaveArea(): void {
    if (this.areaForm.invalid) {
      this.notification.displayNotification('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }

    const formValue = this.areaForm.value;
    const editingArea = this.editingAreaSig();

    // Calculer la capacité totale des templates d'audience zones existants
    const currentTemplates = this.audienceZoneTemplates();
    let totalExistingCapacity = 0;

    // Si on édite une area existante, on compte les templates existants pour cette area
    if (editingArea) {
      totalExistingCapacity = currentTemplates
        .reduce((sum, template) => sum + template.maxCapacity, 0);
    }

    // Vérifier si la capacité de l'area n'est pas inférieure à la capacité totale des templates
    if (formValue.maxCapacity < totalExistingCapacity) {
      this.notification.displayNotification(
        `La capacité de l'espace (${formValue.maxCapacity}) ne peut pas être inférieure à la somme des capacités des zones d'audience existantes (${totalExistingCapacity}).`,
        'error'
      );
      return;
    }

    if (editingArea) {
      // Update existing area
      const updateDto: AreaUpdateDto = {
        name: formValue.name,
        maxCapacity: formValue.maxCapacity,
        isActive: formValue.isActive,
        description: formValue.description || undefined
      };

      this.userStructureService.updateArea(editingArea.id, updateDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
        if (result) {
          // Mettre à jour l'area sélectionnée si c'est celle qui a été modifiée
          if (this.selectedAreaSig()?.id === editingArea.id) {
            this.selectedAreaSig.set(result);
          }
          this.onCancelAreaForm();
        }
          this.cdRef.markForCheck();
      });

    } else {
      // Create new area
      const createDto: AreaCreationDto = {
        name: formValue.name,
        maxCapacity: formValue.maxCapacity,
        isActive: formValue.isActive,
        description: formValue.description || undefined
      };

      this.userStructureService.createArea(createDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
        if (result) {
          this.onCancelAreaForm();
        }
          this.cdRef.markForCheck();
      });
    }
  }

  onSelectArea(area: StructureAreaModel): void {
    this.selectedAreaSig.set(area);
    this.loadAudienceZoneTemplates(area.id);
  }

  onDeleteArea(area: StructureAreaModel): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Supprimer l\'espace',
      message: `Êtes-vous sûr de vouloir supprimer l'espace "${area.name}" ?`,
      confirmButtonText: 'Supprimer',
      confirmButtonColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data: dialogData });


    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result) {
          this.userStructureService.deleteArea(area.id)
            .pipe(takeUntilDestroyed(this.destroyRef)) // <-- 3. Gérer la souscription
            .subscribe(success => {
              if (success && this.selectedAreaSig()?.id === area.id) {
                this.selectedAreaSig.set(null);
              }
              this.cdRef.markForCheck(); // <-- 2. Notifier le changement
            });
        }
      });
  }

  // --- Audience Zone Management ---

  private loadAudienceZoneTemplates(areaId: number): void {
    this.userStructureService.loadAreaAudienceZoneTemplates(areaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  onShowCreateAudienceZoneTemplateForm(): void {
    if (!this.selectedAreaSig()) {
      this.notification.displayNotification('Veuillez sélectionner un espace d\'abord', 'warning');
      return;
    }

    this.editingAudienceZoneTemplateSig.set(null);
    this.audienceZoneForm.reset({
      name: '',
      maxCapacity: 1,
      isActive: true,
      seatingType: SeatingType.STANDING
    });
    this.showAudienceZoneFormSig.set(true);
  }

  onEditAudienceZoneTemplate(template: AudienceZoneTemplateModel): void {
    this.editingAudienceZoneTemplateSig.set(template);
    this.audienceZoneForm.patchValue({
      name: template.name,
      maxCapacity: template.maxCapacity,
      isActive: template.active,
      seatingType: template.seatingType
    });
    this.showAudienceZoneFormSig.set(true);
  }

  onCancelAudienceZoneTemplateForm(): void {
    this.showAudienceZoneFormSig.set(false);
    this.editingAudienceZoneTemplateSig.set(null);
    this.audienceZoneForm.reset();
  }

  onSaveAudienceZoneTemplate(): void {
    if (this.audienceZoneForm.invalid) {
      this.notification.displayNotification('Veuillez corriger les erreurs du formulaire', 'error');
      return;
    }

    const selectedArea = this.selectedAreaSig();
    if (!selectedArea) {
      this.notification.displayNotification('Aucun espace sélectionné', 'error');
      return;
    }

    const formValue = this.audienceZoneForm.value;
    const editingTemplate = this.editingAudienceZoneTemplateSig();

    // Calculer la capacité totale des templates existants
    const currentTemplates = this.audienceZoneTemplates();
    let totalExistingCapacity = 0;

    // Si on édite un template existant, on exclut sa capacité actuelle du calcul
    if (editingTemplate) {
      totalExistingCapacity = currentTemplates
        .filter(template => template.id !== editingTemplate.id)
        .reduce((sum, template) => sum + template.maxCapacity, 0);
    } else {
      // Si on crée un nouveau template, on compte tous les templates existants
      totalExistingCapacity = currentTemplates
        .reduce((sum, template) => sum + template.maxCapacity, 0);
    }

    // Vérifier si la capacité totale ne dépasse pas la capacité maximale de l'area
    const newTotalCapacity = totalExistingCapacity + formValue.maxCapacity;

    if (newTotalCapacity > selectedArea.maxCapacity) {
      const availableCapacity = selectedArea.maxCapacity - totalExistingCapacity;
      this.notification.displayNotification(
        `La capacité totale des zones d'audience (${newTotalCapacity}) ne peut pas dépasser la capacité maximale de l'espace (${selectedArea.maxCapacity}). Capacité disponible : ${availableCapacity} places.`,
        'error'
      );
      return;
    }

    if (editingTemplate) {
      // Update existing template
      const updateDto: AudienceZoneTemplateUpdateDto = {
        name: formValue.name,
        maxCapacity: formValue.maxCapacity,
        isActive: formValue.isActive,
        seatingType: formValue.seatingType
      };

      this.userStructureService.updateAudienceZoneTemplate(selectedArea.id, editingTemplate.id, updateDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
        if (result) {
          this.onCancelAudienceZoneTemplateForm();
        }
          this.cdRef.markForCheck();
      });
    } else {
      // Create new template
      const createDto: AudienceZoneTemplateCreationDto = {
        name: formValue.name,
        maxCapacity: formValue.maxCapacity,
        isActive: formValue.isActive,
        seatingType: formValue.seatingType
      };

      this.userStructureService.createAudienceZoneTemplate(selectedArea.id, createDto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
        if (result) {
          this.onCancelAudienceZoneTemplateForm();
        }
          this.cdRef.markForCheck();
      });
    }
  }

  onDeleteAudienceZoneTemplate(template: AudienceZoneTemplateModel): void {
    const selectedArea = this.selectedAreaSig();
    if (!selectedArea || !template.id) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le template "${template.name}" ?`)) {
      this.userStructureService.deleteAudienceZoneTemplate(selectedArea.id, template.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  // --- Utility Methods ---

  getSeatingTypeLabel(type: SeatingType): string {
    const option = this.seatingTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  }

  isAreaFormValid(): boolean {
    return this.areaForm.valid;
  }

  isAudienceZoneFormValid(): boolean {
    return this.audienceZoneForm.valid;
  }
}
