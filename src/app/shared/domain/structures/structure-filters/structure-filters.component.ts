import { Component, OnInit, OnDestroy, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { StructureService } from '../../../../core/services/domain/structure/structure.service';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';

// Models
import { StructureTypeModel } from '../../../../core/models/structure/structure-type.model';

// Interfaces pour les événements émis
interface StructureFilters {
  query?: string;
  city?: string;
  typeIds?: number[];
}

interface StructureSortOptions {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'app-structure-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './structure-filters.component.html',
  styleUrl: './structure-filters.component.scss'
})
export class StructureFiltersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Services
  private structureService = inject(StructureService);
  private notificationService = inject(NotificationService);

  // Événements émis vers le parent
  @Output() filtersChanged = new EventEmitter<StructureFilters>();
  @Output() sortChanged = new EventEmitter<StructureSortOptions>();

  // État des filtres
  searchQuery: string = '';
  cityQuery: string = '';
  selectedTypes: number[] = [];
  sortBy: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Types de structures
  structureTypes: StructureTypeModel[] = [];
  isLoadingTypes = false;

  ngOnInit(): void {
    this.loadStructureTypes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les types de structures depuis le service
   */
  private loadStructureTypes(): void {
    this.isLoadingTypes = true;
    this.structureService.getStructureTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          this.structureTypes = types;
          this.isLoadingTypes = false;
        },
        error: (error) => {
          this.notificationService.displayNotification(
            'Erreur lors du chargement des types de structures',
            'error',
            'Fermer'
          );
          console.error('Erreur de chargement des types:', error);
          this.isLoadingTypes = false;
        }
      });
  }

  /**
   * Vérifie si un type est sélectionné
   */
  isTypeSelected(typeId: number): boolean {
    return this.selectedTypes.includes(typeId);
  }

  /**
   * Active/désactive un filtre de type
   */
  toggleTypeFilter(typeId: number): void {
    const index = this.selectedTypes.indexOf(typeId);
    if (index > -1) {
      this.selectedTypes.splice(index, 1);
    } else {
      this.selectedTypes.push(typeId);
    }
    this.onFilterChange();
  }

  /**
   * Gère les changements de filtres
   */
  onFilterChange(): void {
    const filters = this.getCurrentFilters();
    this.filtersChanged.emit(filters);
  }

  /**
   * Gère les changements de tri
   */
  onSortChange(): void {
    const sortOptions: StructureSortOptions = {
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.sortChanged.emit(sortOptions);
  }

  /**
   * Inverse la direction du tri
   */
  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.onSortChange();
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.cityQuery = '';
    this.selectedTypes = [];
    this.sortBy = 'name';
    this.sortDirection = 'asc';
    this.onFilterChange();
    this.onSortChange();
  }

  /**
   * Vérifie s'il y a des filtres actifs
   */
  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.cityQuery || this.selectedTypes.length > 0);
  }

  /**
   * Efface le filtre de recherche
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.onFilterChange();
  }

  /**
   * Efface le filtre de ville
   */
  clearCity(): void {
    this.cityQuery = '';
    this.onFilterChange();
  }

  /**
   * Retourne le nom d'un type par son ID
   */
  getTypeName(typeId: number): string {
    const type = this.structureTypes.find(t => t.id === typeId);
    return type ? type.name : 'Type inconnu';
  }

  /**
   * Retourne l'icône d'un type par son ID
   */
  getTypeIcon(typeId: number): string {
    // Mapping basique d'icônes par ID de type
    const iconMapping: { [key: number]: string } = {
      1: 'bi-music-note-beamed', // Salle de concert
      2: 'bi-mask',              // Théâtre
      3: 'bi-building',          // Centre de conférence
      4: 'bi-grid-3x3',          // Espace polyvalent
      5: 'bi-cup-straw',         // Bar / Club
      99: 'bi-question-circle'   // Autre
    };
    return iconMapping[typeId] || 'bi-building';
  }

  /**
   * Retourne le label du tri actuel
   */
  getSortLabel(): string {
    const sortLabels: { [key: string]: string } = {
      'name': 'Nom',
      'importance': 'Popularité',
      'eventsCount': 'Nombre d\'événements'
    };
    return sortLabels[this.sortBy] || 'Nom';
  }

  /**
   * Retourne les filtres actuels
   */
  private getCurrentFilters(): StructureFilters {
    return {
      query: this.searchQuery || undefined,
      city: this.cityQuery || undefined,
      typeIds: this.selectedTypes.length > 0 ? this.selectedTypes : undefined
    };
  }
}
