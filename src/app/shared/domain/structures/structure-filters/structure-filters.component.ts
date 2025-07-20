import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

// Services
import {StructureService} from '../../../../core/services/domain/structure/structure.service';
import {NotificationService} from '../../../../core/services/domain/utilities/notification.service';

// Models
import {StructureTypeModel} from '../../../../core/models/structure/structure-type.model';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';

// Interfaces pour les événements émis
interface StructureFilters {
  query?: string;
  typeIds?: number[];
}

interface StructureSortOptions {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'app-structure-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './structure-filters.component.html',
  styleUrl: './structure-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureFiltersComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  // Services
  private structureService = inject(StructureService);
  private notificationService = inject(NotificationService);

  // Événements émis vers le parent
  @Output() filtersChanged = new EventEmitter<StructureFilters>();
  @Output() sortChanged = new EventEmitter<StructureSortOptions>();

  // --- État des filtres transformé en signaux ---
  searchQuery = signal('');
  selectedTypes = signal<number[]>([]);
  sortBy = signal('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // --- État local du composant ---
  structureTypes = signal<StructureTypeModel[]>([]);
  isLoadingTypes = signal(false);
  isCategoriesExpanded = signal(false);

  protected  searchQuerySubject = new Subject<string>();

  readonly MAX_VISIBLE_CATEGORIES = 8;

  // --- Signaux dérivés (computed) ---

  /** Vérifie s'il y a des filtres actifs. */
  hasActiveFilters = computed(() => this.searchQuery() || this.selectedTypes().length > 0);

  /** Calcule l'objet des filtres à émettre. */
  private currentFilters = computed<StructureFilters>(() => ({
    query: this.searchQuery() || undefined,
    typeIds: this.selectedTypes().length > 0 ? this.selectedTypes() : undefined
  }));

  /** Calcule l'objet de tri à émettre. */
  private currentSortOptions = computed<StructureSortOptions>(() => ({
    sortBy: this.sortBy(),
    sortDirection: this.sortDirection()
  }));


  constructor() {
    // --- Effets pour émettre les changements au parent ---
    // Cet effet s'exécute chaque fois que `currentFilters` change.
    effect(() => {
      this.filtersChanged.emit(this.currentFilters());
    });

    // Cet effet s'exécute chaque fois que `currentSortOptions` change.
    effect(() => {
      this.sortChanged.emit(this.currentSortOptions());
    });
  }


  ngOnInit(): void {
    this.loadStructureTypes();

    this.searchQuerySubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(debouncedQuery => {
      this.searchQuery.set(debouncedQuery);
      this.cdRef.markForCheck();
    });
  }

  /** Charge les types de structures depuis le service. */
  private loadStructureTypes(): void {
    this.isLoadingTypes.set(true);
    this.structureService.getStructureTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types) => {
          this.structureTypes.set(types);
          this.isLoadingTypes.set(false);
          this.cdRef.markForCheck();
        },
        error: (error) => {
          this.notificationService.displayNotification(
            'Erreur lors du chargement des types de structures',
            'error',
            'Fermer'
          );
          console.error('Erreur de chargement des types:', error);
          this.isLoadingTypes.set(false);
          this.cdRef.markForCheck();
        }
      });
  }

  /** Vérifie si un type est sélectionné. */
  isTypeSelected(typeId: number): boolean {
    return this.selectedTypes().includes(typeId);
  }

  /** Active/désactive un filtre de type en utilisant .update() pour la simplicité. */
  toggleTypeFilter(typeId: number): void {
    this.selectedTypes.update(types => {
      const index = types.indexOf(typeId);
      if (index > -1) {
        types.splice(index, 1);
      } else {
        types.push(typeId);
      }
      return [...types]; // Retourne une nouvelle référence pour le signal
    });
  }

  /** Inverse la direction du tri. */
  toggleSortDirection(): void {
    this.sortDirection.update(current => current === 'asc' ? 'desc' : 'asc');
  }

  /** Réinitialise tous les filtres à leur état initial. */
  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedTypes.set([]);
    this.sortBy.set('name');
    this.sortDirection.set('asc');
  }

  /** Efface le filtre de recherche. */
  clearSearch(): void {
    this.searchQuery.set('');
  }

  /** Retourne le nom d'un type par son ID. */
  getTypeName(typeId: number): string {
    const type = this.structureTypes().find(t => t.id === typeId);
    return type ? type.name : 'Type inconnu';
  }

  /** Retourne l'icône Material Design d'un type par son ID. */
  getTypeIcon(typeId: number): string {
    const iconMapping: { [key: number]: string } = {
      1: 'music_note', 2: 'theater_comedy', 3: 'business',
      4: 'dashboard', 5: 'local_bar', 99: 'help'
    };
    return iconMapping[typeId] || 'location_city';
  }

  /** Retourne le label du tri actuel. */
  getSortLabel(): string {
    const sortLabels: { [key: string]: string } = {
      'name': 'Nom', 'importance': 'Popularité', 'eventsCount': 'Nombre d\'événements'
    };
    return sortLabels[this.sortBy()] || 'Nom';
  }

  /** Bascule l'affichage des catégories. */
  toggleCategoriesExpand(): void {
    this.isCategoriesExpanded.update(v => !v);
  }
}
