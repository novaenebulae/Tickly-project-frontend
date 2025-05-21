import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { StructureTypeModel } from '../../../../core/models/structure/structure-type.model';

export interface StructureFilters {
  query?: string;
  city?: string;
  typeIds?: number[];
}

export interface StructureSortOptions {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'app-structure-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, MatAutocompleteModule],
  templateUrl: './structure-filters.component.html',
  styleUrl: './structure-filters.component.scss'
})
export class StructureFiltersComponent implements OnInit, OnDestroy {
  @Input() structureTypes: StructureTypeModel[] = [];

  @Output() filtersChanged = new EventEmitter<StructureFilters>();
  @Output() sortChanged = new EventEmitter<StructureSortOptions>();

  // Valeurs des filtres
  searchQuery: string = '';
  cityQuery: string = '';
  selectedTypes: number[] = [];
  sortBy: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';


  // RxJS
  private destroy$ = new Subject<void>();
  private searchTerms$ = new Subject<string>();
  private cityTerms$ = new Subject<string>();

  ngOnInit(): void {
    this.setupObservables();

    // Émissions initiales
    this.emitFilters();
    this.emitSortOptions();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupObservables(): void {
    // Configuration des observables avec debounce
    this.searchTerms$.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchQuery = term;
      this.emitFilters();
    });

    this.cityTerms$.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.cityQuery = term;
      this.emitFilters();
    });
  }

  // Traitement des types
  isTypeSelected(typeId: number): boolean {
    return this.selectedTypes.includes(typeId);
  }

  toggleTypeFilter(typeId: number): void {
    if (this.isTypeSelected(typeId)) {
      this.selectedTypes = this.selectedTypes.filter(id => id !== typeId);
    } else {
      this.selectedTypes = [...this.selectedTypes, typeId];
    }
    this.emitFilters();
  }

  getTypeName(typeId: number): string {
    if (!this.structureTypes) return '';
    const type = this.structureTypes.find(t => t.id === typeId);
    return type ? type.type : '';
  }

  getTypeIcon(typeId: number): string {
    // Mapping des icônes par type
    const iconMap: {[key: number]: string} = {
      1: 'bi-music-note-beamed',  // Salle de concert
      2: 'bi-mask',              // Théâtre
      3: 'bi-building',          // Centre de conférence
      4: 'bi-palette',           // Espace polyvalent
      5: 'bi-cup-straw',         // Bar/Club
      6: 'bi-film',              // Cinéma
      7: 'bi-easel',             // Musée
      8: 'bi-book',              // Bibliothèque
      9: 'bi-stars'              // Festival
    };

    return iconMap[typeId] || 'bi-tag';
  }

  // Traitement des champs textuels
  onInputSearch(term: string): void {
    this.searchTerms$.next(term);
  }

  // Gestion du tri
  onSortChange(): void {
    this.emitSortOptions();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.emitSortOptions();
  }

  getSortLabel(): string {
    const sortLabels: {[key: string]: string} = {
      'name': 'Nom',
      'importance': 'Popularité',
      'eventCount': 'Nombre d\'événements'
    };

    return sortLabels[this.sortBy] || this.sortBy;
  }

  // Gestion des changements
  onFilterChange(): void {
    this.emitFilters();
  }

  // Méthodes d'émission d'événements
  private emitFilters(): void {
    const filters: StructureFilters = {
      query: this.searchQuery || undefined,
      city: this.cityQuery || undefined,
      typeIds: this.selectedTypes.length > 0 ? this.selectedTypes : undefined
    };

    this.filtersChanged.emit(filters);
  }

  private emitSortOptions(): void {
    this.sortChanged.emit({
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    });
  }

  // Gestion de la réinitialisation
  resetFilters(): void {
    this.searchQuery = '';
    this.cityQuery = '';
    this.selectedTypes = [];
    this.sortBy = 'name';
    this.sortDirection = 'asc';

    this.emitFilters();
    this.emitSortOptions();
  }

  // Méthodes d'aide pour l'interface
  clearSearch(): void {
    this.searchQuery = '';
    this.emitFilters();
  }

  clearCity(): void {
    this.cityQuery = '';
    this.emitFilters();
  }

  hasActiveFilters(): boolean {
    return (
      !!this.searchQuery ||
      !!this.cityQuery ||
      this.selectedTypes.length > 0 ||
      this.sortBy !== 'name' ||
      this.sortDirection !== 'asc'
    );
  }
}
