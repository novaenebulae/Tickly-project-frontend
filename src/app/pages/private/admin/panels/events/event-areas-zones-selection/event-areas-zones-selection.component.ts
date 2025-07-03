/**
 * @file Composant pour sélectionner les espaces et zones d'audience pour un événement.
 * @licence Proprietary
 */

import { Component, OnInit, Input, Output, EventEmitter, inject, signal, computed, WritableSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';

import { StructureAreaModel } from '../../../../../../core/models/structure/structure-area.model';
import { AudienceZoneTemplateModel } from '../../../../../../core/models/structure/AudienceZoneTemplate.model';
import { EventAudienceZone, SeatingType } from '../../../../../../core/models/event/event-audience-zone.model';
import { StructureService } from '../../../../../../core/services/domain/structure/structure.service';
import { UserStructureService } from '../../../../../../core/services/domain/user-structure/user-structure.service';
import { NotificationService } from '../../../../../../core/services/domain/utilities/notification.service';

/**
 * Interface pour les données sélectionnées
 */
export interface AreaZoneSelection {
  selectedAreas: StructureAreaModel[];
  selectedZones: ZoneConfiguration[];
}

/**
 * Interface pour la configuration d'une zone avec sa capacité allouée
 */
export interface ZoneConfiguration {
  template: AudienceZoneTemplateModel;
  allocatedCapacity: number;
}

@Component({
  selector: 'app-event-areas-zones-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './event-areas-zones-selection.component.html',
  styleUrls: ['./event-areas-zones-selection.component.scss']
})
export class EventAreasZonesSelectionComponent implements OnInit {
  // Services injectés
  private structureService = inject(StructureService);
  private userStructureService = inject(UserStructureService);
  private notification = inject(NotificationService);

  // Propriétés d'entrée
  @Input() structureId!: number;
  @Input() existingAreas?: StructureAreaModel[];
  @Input() existingZones?: EventAudienceZone[];
  @Input() defaultSeatingType?: SeatingType;
  @Input() disabled: boolean = false;

  // Propriétés de sortie
  @Output() selectionChange = new EventEmitter<AreaZoneSelection>();

  // Signaux internes
  private loadingSig: WritableSignal<boolean> = signal(false);
  private selectedAreasSig: WritableSignal<StructureAreaModel[]> = signal([]);
  private selectedZonesSig: WritableSignal<ZoneConfiguration[]> = signal([]);
  private allAreasSig: WritableSignal<StructureAreaModel[]> = signal([]);
  private allZonesByAreaSig: WritableSignal<Record<number, AudienceZoneTemplateModel[]>> = signal({});

  // Signaux calculés
  public readonly isLoading = computed(() => this.loadingSig());
  public readonly allAreas = computed(() => this.allAreasSig());
  public readonly selectedAreas = computed(() => this.selectedAreasSig());
  public readonly allZonesByArea = computed(() => this.allZonesByAreaSig());
  public readonly selectedZones = computed(() => this.selectedZonesSig());

  // Enums pour le template
  SeatingType = SeatingType;

  // Options pour les types de placement
  seatingTypeOptions = [
    { value: SeatingType.SEATED, label: 'Places assises' },
    { value: SeatingType.STANDING, label: 'Places debout' },
    { value: SeatingType.MIXED, label: 'Mixte' }
  ];

  constructor() {
    // Effect pour émettre les changements de sélection
    effect(() => {
      const selection: AreaZoneSelection = {
        selectedAreas: this.selectedAreas(),
        selectedZones: this.selectedZones()
      };
      this.selectionChange.emit(selection);
    });
  }

  ngOnInit(): void {
    if (!this.structureId) {
      this.notification.displayNotification('ID de structure manquant', 'error');
      return;
    }

    this.loadAreas();
  }

  /**
   * Charge les espaces de la structure
   */
  private loadAreas(): void {
    this.loadingSig.set(true);

    this.userStructureService.loadUserStructureAreas().subscribe({
      next: (areas) => {
        this.allAreasSig.set(areas || []);

        // Charger les zones pour chaque espace
        if (areas && areas.length > 0) {
          this.loadZonesForAllAreas(areas);
        } else {
          this.loadingSig.set(false);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des espaces:', error);
        this.notification.displayNotification('Erreur lors du chargement des espaces', 'error');
        this.loadingSig.set(false);
      }
    });
  }

  /**
   * Charge les zones pour tous les espaces
   */
  private loadZonesForAllAreas(areas: StructureAreaModel[]): void {
    const zonePromises = areas.map(area =>
      this.userStructureService.loadAreaAudienceZoneTemplates(area.id!).toPromise()
        .then(zones => ({ areaId: area.id!, zones: zones || [] }))
        .catch(error => {
          console.error(`Erreur lors du chargement des zones pour l'espace ${area.id}:`, error);
          return { areaId: area.id!, zones: [] };
        })
    );

    Promise.all(zonePromises).then(results => {
      const zonesByArea: Record<number, AudienceZoneTemplateModel[]> = {};

      results.forEach(result => {
        zonesByArea[result.areaId] = result.zones;
      });

      this.allZonesByAreaSig.set(zonesByArea);
      this.loadingSig.set(false);

      // Pré-sélectionner les éléments existants si en mode édition
      this.preselectExistingItems();
    });
  }

  /**
   * Pré-sélectionne les éléments existants (mode édition)
   */
  private preselectExistingItems(): void {
    if (this.existingAreas && this.existingAreas.length > 0) {
      this.selectedAreasSig.set([...this.existingAreas]);
    }

    if (this.existingZones && this.existingZones.length > 0) {
      const zoneConfigs: ZoneConfiguration[] = [];

      // Convertir les EventAudienceZone existantes en ZoneConfiguration
      // en trouvant les templates correspondants
      this.existingZones.forEach(existingZone => {
        // Chercher le template correspondant dans les zones chargées
        const allZones = Object.values(this.allZonesByArea()).flat();
        const template = allZones.find(t =>
          t.areaId === existingZone.areaId &&
          t.name === existingZone.name
        );

        if (template) {
          zoneConfigs.push({
            template: template,
            allocatedCapacity: existingZone.allocatedCapacity || 0
          });
        }
      });

      this.selectedZonesSig.set(zoneConfigs);
    }
  }

  /**
   * Vérifie si un espace est sélectionné
   */
  isAreaSelected(areaId: number): boolean {
    return this.selectedAreas().some(area => area.id === areaId);
  }

  /**
   * Vérifie si une zone est sélectionnée
   */
  isZoneSelected(zoneId: number): boolean {
    return this.selectedZones().some(zoneConfig => zoneConfig.template.id === zoneId);
  }

  /**
   * Toggle la sélection d'un espace
   */
  toggleAreaSelection(area: StructureAreaModel): void {
    // If component is disabled, don't allow selection changes
    if (this.disabled) {
      return;
    }

    const currentSelection = this.selectedAreas();
    const isCurrentlySelected = this.isAreaSelected(area.id!);

    if (isCurrentlySelected) {
      // Désélectionner l'espace et toutes ses zones
      const newSelection = currentSelection.filter(a => a.id !== area.id);
      this.selectedAreasSig.set(newSelection);
      this.deselectAllZonesFromArea(area.id!);
    } else {
      // Sélectionner l'espace
      this.selectedAreasSig.set([...currentSelection, area]);
    }
  }

  /**
   * Toggle la sélection d'une zone
   */
  toggleZoneSelection(template: AudienceZoneTemplateModel): void {
    // If component is disabled, don't allow selection changes
    if (this.disabled) {
      return;
    }

    const currentSelection = this.selectedZones();
    const isCurrentlySelected = this.isZoneSelected(template.id!);

    if (isCurrentlySelected) {
      // Désélectionner la zone
      const newSelection = currentSelection.filter(zoneConfig => zoneConfig.template.id !== template.id);
      this.selectedZonesSig.set(newSelection);
    } else {
      // Sélectionner la zone avec sa capacité par défaut
      const newZoneConfig: ZoneConfiguration = {
        template: template,
        allocatedCapacity: template.maxCapacity || 0
      };
      this.selectedZonesSig.set([...currentSelection, newZoneConfig]);
    }

    // Notifier le parent que quelque chose a changé
    const selection: AreaZoneSelection = {
      selectedAreas: this.selectedAreas(),
      selectedZones: this.selectedZones()
    };
    this.selectionChange.emit(selection);
  }

  /**
   * Désélectionne toutes les zones d'un espace donné
   */
  private deselectAllZonesFromArea(areaId: number): void {
    const currentZoneSelection = this.selectedZones();
    const newZoneSelection = currentZoneSelection.filter(
      zoneConfig => zoneConfig.template.areaId !== areaId
    );
    this.selectedZonesSig.set(newZoneSelection);
  }

  /**
   * Met à jour la capacité allouée pour une zone
   */
  updateZoneCapacity(zoneId: number, event: Event): void {
    // If component is disabled, don't allow capacity updates
    if (this.disabled) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const newCapacity = parseInt(input.value, 10);

    if (isNaN(newCapacity) || newCapacity <= 0) {
      this.notification.displayNotification('Veuillez entrer une capacité valide', 'error');
      return;
    }

    const currentSelection = this.selectedZones();
    const updatedSelection = currentSelection.map(zoneConfig => {
      if (zoneConfig.template.id === zoneId) {
        const maxCapacity = zoneConfig.template.maxCapacity || 0;
        if (newCapacity > maxCapacity) {
          this.notification.displayNotification(
            `La capacité ne peut pas dépasser ${maxCapacity}`,
            'error'
          );
          input.value = maxCapacity.toString();
          return { ...zoneConfig, allocatedCapacity: maxCapacity };
        }
        return { ...zoneConfig, allocatedCapacity: newCapacity };
      }
      return zoneConfig;
    });

    this.selectedZonesSig.set(updatedSelection);
  }

  /**
   * Obtient le nombre de zones sélectionnées pour un espace donné
   */
  getSelectedZonesCountForArea(areaId: number): number {
    return this.selectedZones().filter(zoneConfig => zoneConfig.template.areaId === areaId).length;
  }

  /**
   * Obtient la capacité totale allouée pour un espace donné
   */
  getAllocatedCapacityForArea(areaId: number): number {
    return this.selectedZones()
      .filter(zoneConfig => zoneConfig.template.areaId === areaId)
      .reduce((total, zoneConfig) => total + zoneConfig.allocatedCapacity, 0);
  }

  /**
   * Obtient la capacité maximale pour un espace donné
   */
  getMaxCapacityForArea(areaId: number): number {
    const zonesForArea = this.allZonesByArea()[areaId] || [];
    return zonesForArea.reduce((total, template) => total + (template.maxCapacity || 0), 0);
  }

  /**
   * Obtient le label pour un type de placement
   */
  getSeatingTypeLabel(seatingType: SeatingType): string {
    const option = this.seatingTypeOptions.find(opt => opt.value === seatingType);
    return option ? option.label : 'Inconnu';
  }

  /**
   * Obtient la configuration d'une zone sélectionnée
   */
  getZoneConfiguration(zoneId: number): ZoneConfiguration | undefined {
    return this.selectedZones().find(zoneConfig => zoneConfig.template.id === zoneId);
  }

  /**
   * Sélectionne toutes les zones d'un espace
   */
  selectAllZonesInArea(areaId: number): void {
    // If component is disabled, don't allow selection changes
    if (this.disabled) {
      return;
    }

    // Empêcher la propagation pour éviter de fermer la carte
    event?.stopPropagation();

    // Récupérer toutes les zones de cet espace
    const zonesInArea = this.allZonesByArea()[areaId] || [];
    if (zonesInArea.length === 0) return;

    // Récupérer les zones déjà sélectionnées
    const currentSelection = this.selectedZones();

    // Filtrer les zones qui ne sont pas encore sélectionnées
    const unselectedTemplates = zonesInArea.filter(template =>
      !currentSelection.some(zoneConfig => zoneConfig.template.id === template.id)
    );

    // Créer les nouvelles configurations pour ces zones
    const newZoneConfigs = unselectedTemplates.map(template => ({
      template: template,
      allocatedCapacity: template.maxCapacity || 0
    }));

    // Ajouter ces zones à la sélection actuelle
    if (newZoneConfigs.length > 0) {
      this.selectedZonesSig.set([...currentSelection, ...newZoneConfigs]);

      // S'assurer que l'espace est aussi sélectionné
      if (!this.isAreaSelected(areaId)) {
        const area = this.allAreas().find(a => a.id === areaId);
        if (area) {
          this.selectedAreasSig.set([...this.selectedAreas(), area]);
        }
      }

      // Notifier le parent que quelque chose a changé
      const selection: AreaZoneSelection = {
        selectedAreas: this.selectedAreas(),
        selectedZones: this.selectedZones()
      };
      this.selectionChange.emit(selection);
    }
  }
}
