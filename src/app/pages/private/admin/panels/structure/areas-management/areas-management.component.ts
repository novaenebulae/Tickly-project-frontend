/**
 * @file Component for managing structure areas and their audience zones in admin backoffice.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Component, OnInit, inject, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {NotificationService} from '../../../../../../core/services/domain/utilities/notification.service';
import {StructureService} from '../../../../../../core/services/domain/structure/structure.service';
import {
  AreaCreationDto,
  AreaUpdateDto,
  StructureAreaModel
} from '../../../../../../core/models/structure/structure-area.model';
import {AudienceZoneCreationDto, AudienceZoneUpdateDto, EventAudienceZone} from '../../../../../../core/models/event/event-audience-zone.model';
import {SeatingType} from '../../../../../../core/models/event/event-audience-zone.model';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-areas-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIcon],
  templateUrl: './areas-management.component.html',
  styleUrls: ['./areas-management.component.scss']
})
export class AreasManagementComponent implements OnInit {
  private structureService = inject(StructureService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Signals for component state
  private structureIdSig: WritableSignal<number | null> = signal(null);
  private selectedAreaSig: WritableSignal<StructureAreaModel | null> = signal(null);
  private showAreaFormSig: WritableSignal<boolean> = signal(false);
  private showAudienceZoneFormSig: WritableSignal<boolean> = signal(false);
  private editingAreaSig: WritableSignal<StructureAreaModel | null> = signal(null);
  private editingAudienceZoneSig: WritableSignal<EventAudienceZone | null> = signal(null);

  // Computed signals
  public readonly currentStructure = computed(() => this.structureService.currentStructureDetails());
  public readonly areas = computed(() => this.structureService.currentStructureAreas());
  public readonly audienceZones = computed(() => this.structureService.currentAreaAudienceZones());
  public readonly selectedArea = computed(() => this.selectedAreaSig());
  public readonly showAreaForm = computed(() => this.showAreaFormSig());
  public readonly showAudienceZoneForm = computed(() => this.showAudienceZoneFormSig());
  public readonly editingArea = computed(() => this.editingAreaSig());
  public readonly editingAudienceZone = computed(() => this.editingAudienceZoneSig());

  // Forms
  areaForm: FormGroup = new FormGroup({});
  audienceZoneForm: FormGroup = new FormGroup({});

  // Enums for template
  SeatingType = SeatingType;
  seatingTypeOptions = [
    { value: SeatingType.SEATED, label: 'Places assises' },
    { value: SeatingType.STANDING, label: 'Places debout' },
    { value: SeatingType.MIXED, label: 'Mixte' }
  ];

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const structureId = +params['structureId'];
      if (structureId) {
        this.structureIdSig.set(structureId);
        this.loadStructureData(structureId);
      }
    });
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

  private loadStructureData(structureId: number): void {
    this.structureService.getStructureById(structureId).subscribe(structure => {
      if (!structure) {
        this.notification.displayNotification('Structure non trouvée', 'error');
        this.router.navigate(['/admin/structures']);
      }
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
      isActive: area.isActive,
      description: area.description || ''
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

    // Calculer la capacité totale des zones d'audience existantes
    const currentZones = this.audienceZones();
    let totalExistingCapacity = 0;

    // Si on édite une zone existante, on exclut sa capacité actuelle du calcul
    if (editingArea) {
      totalExistingCapacity = currentZones
        .filter(zone => zone.id !== editingArea.id)
        .reduce((sum, zone) => sum + zone.maxCapacity, 0);
    } else {
      // Si on crée une nouvelle zone, on compte toutes les zones existantes
      totalExistingCapacity = currentZones
        .reduce((sum, zone) => sum + zone.maxCapacity, 0);
    }

    // Vérifier si la capacité de l'area n'est pas inférieure à la capacité totale des zones
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

      this.structureService.updateArea(editingArea.id, updateDto).subscribe(result => {
        if (result) {
          // Mettre à jour l'area sélectionnée si c'est celle qui a été modifiée
          if (this.selectedAreaSig()?.id === editingArea.id) {
            this.selectedAreaSig.set(result);
          }
          this.onCancelAreaForm();
        }
      });

    } else {
      // Create new area
      const createDto: AreaCreationDto = {
        name: formValue.name,
        maxCapacity: formValue.maxCapacity,
        isActive: formValue.isActive,
        description: formValue.description || undefined
      };

      this.structureService.createArea(createDto).subscribe(result => {
        if (result) {
          this.onCancelAreaForm();
        }
      });
    }
  }

  onDeleteArea(area: StructureAreaModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${area.name}" ?`)) {
      this.structureService.deleteArea(area.id).subscribe(success => {
        if (success && this.selectedAreaSig()?.id === area.id) {
          this.selectedAreaSig.set(null);
        }
      });
    }
  }

  onSelectArea(area: StructureAreaModel): void {
    this.selectedAreaSig.set(area);
    this.loadAudienceZones(area.id);
  }

  // --- Audience Zone Management ---

  private loadAudienceZones(areaId: number): void {
    this.structureService.loadAreaAudienceZones(areaId).subscribe();
  }

  onShowCreateAudienceZoneForm(): void {
    if (!this.selectedAreaSig()) {
      this.notification.displayNotification('Veuillez sélectionner un espace d\'abord', 'warning');
      return;
    }

    this.editingAudienceZoneSig.set(null);
    this.audienceZoneForm.reset({
      name: '',
      maxCapacity: 1,
      isActive: true,
      seatingType: SeatingType.STANDING
    });
    this.showAudienceZoneFormSig.set(true);
  }

  onEditAudienceZone(zone: EventAudienceZone): void {
    this.editingAudienceZoneSig.set(zone);
    this.audienceZoneForm.patchValue({
      name: zone.name,
      maxCapacity: zone.maxCapacity,
      isActive: zone.isActive,
      seatingType: zone.seatingType
    });
    this.showAudienceZoneFormSig.set(true);
  }

  onCancelAudienceZoneForm(): void {
    this.showAudienceZoneFormSig.set(false);
    this.editingAudienceZoneSig.set(null);
    this.audienceZoneForm.reset();
  }

  onSaveAudienceZone(): void {
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
    const editingZone = this.editingAudienceZoneSig();

    // Calculer la capacité totale des zones d'audience existantes
    const currentZones = this.audienceZones();
    let totalExistingCapacity = 0;

    // Si on édite une zone existante, on exclut sa capacité actuelle du calcul
    if (editingZone) {
      totalExistingCapacity = currentZones
        .filter(zone => zone.id !== editingZone.id)
        .reduce((sum, zone) => sum + zone.maxCapacity, 0);
    } else {
      // Si on crée une nouvelle zone, on compte toutes les zones existantes
      totalExistingCapacity = currentZones
        .reduce((sum, zone) => sum + zone.maxCapacity, 0);
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

    if (editingZone) {
      // Update existing audience zone
      const updateDto: AudienceZoneUpdateDto = {
        name: formValue.name,
        maxCapacity: formValue.maxCapacity,
        isActive: formValue.isActive,
        seatingType: formValue.seatingType
      };

      this.structureService.updateAudienceZone(selectedArea.id, editingZone.id!, updateDto).subscribe(result => {
        if (result) {
          this.onCancelAudienceZoneForm();
        }
      });
    } else {
      // Create new audience zone
      const createDto: AudienceZoneCreationDto = {
        name: formValue.name,
        areaId: selectedArea.id,
        maxCapacity: formValue.maxCapacity,
        isActive: formValue.isActive,
        seatingType: formValue.seatingType
      };

      this.structureService.createAudienceZone(selectedArea.id, createDto).subscribe(result => {
        if (result) {
          this.onCancelAudienceZoneForm();
        }
      });
    }
  }

  onDeleteAudienceZone(zone: EventAudienceZone): void {
    const selectedArea = this.selectedAreaSig();
    if (!selectedArea || !zone.id) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer la zone "${zone.name}" ?`)) {
      this.structureService.deleteAudienceZone(selectedArea.id, zone.id).subscribe();
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
