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
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

// Services
import { CategoryService } from '../../../../core/services/domain/event/category.service';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';

// Models
import { EventCategoryModel } from '../../../../core/models/event/event-category.model';
import { EventSearchParams } from '../../../../core/models/event/event-search-params.model';
import { EventStatus } from '../../../../core/models/event/event.model';

@Component({
  selector: 'app-event-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule
  ],
  templateUrl: './event-filters.component.html',
  styleUrl: './event-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventFiltersComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  // Services
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  // Événement émis vers le parent avec tous les filtres incluant le tri
  @Output() filtersChanged = new EventEmitter<EventSearchParams>();

  // --- État des filtres transformé en signaux ---
  searchQuery = signal('');
  selectedCategories = signal<EventCategoryModel[]>([]);
  sortBy = signal('startDate');
  sortDirection = signal<'asc' | 'desc'>('asc');
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  location = signal('');

  // --- État local du composant ---
  categoriesList: EventCategoryModel[] = [];
  isLoadingCategories = signal(false);
  isCategoriesExpanded = signal(false);
  isAdvancedFiltersOpen = signal(false);

  protected searchQuerySubject = new Subject<string>();
  protected locationSubject = new Subject<string>();

  readonly MAX_VISIBLE_CATEGORIES = 8;

  // --- Signaux dérivés (computed) ---

  /** Vérifie s'il y a des filtres actifs. */
  hasActiveFilters = computed(() =>
      this.searchQuery() ||
      this.selectedCategories().length > 0 ||
      this.startDate() ||
      this.endDate() ||
      this.location()
  );

  /** Calcule la valeur actuelle du tri pour le sélecteur. */
  currentSortValue = computed(() => `${this.sortBy()}_${this.sortDirection()}`);

  /** Calcule le nombre de filtres avancés appliqués. */
  getAdvancedFiltersCount = computed(() => {
    let count = 0;
    if (this.selectedCategories().length > 0) count++;
    if (this.startDate() || this.endDate()) count++;
    if (this.location()) count++;
    return count;
  });

  /** Calcule l'objet complet des filtres à émettre incluant le tri. */
  private currentFilters = computed<EventSearchParams>(() => ({
    query: this.searchQuery() || undefined,
    categoryIds: this.selectedCategories().length > 0 ? this.selectedCategories().map(cat => cat.id) : undefined,
    startDateAfter: this.startDate() || undefined,
    startDateBefore: this.endDate() || undefined,
    city: this.location() || undefined,
    sortBy: this.sortBy(),
    sortDirection: this.sortDirection(),
    status: EventStatus.PUBLISHED // Toujours inclure le statut publié
  }));

  constructor() {
    // --- Effet pour émettre tous les changements au parent ---
    effect(() => {
      const filters = this.currentFilters();
      console.log('All filters changed:', filters); // Debug log
      this.filtersChanged.emit(filters);
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    this.searchQuerySubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
    ).subscribe(debouncedQuery => {
      this.searchQuery.set(debouncedQuery);
      this.cdRef.markForCheck();
    });

    this.locationSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
    ).subscribe(debouncedLocation => {
      this.location.set(debouncedLocation);
      this.cdRef.markForCheck();
    });
  }

  /** Charge les catégories depuis le service. */
  private loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoryService.loadCategories()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (categories) => {
            this.categoriesList = categories;
            this.isLoadingCategories.set(false);
            this.cdRef.markForCheck();
          },
          error: (error) => {
            this.notificationService.displayNotification(
                'Erreur lors du chargement des catégories',
                'error',
                'Fermer'
            );
            console.error('Erreur de chargement des catégories:', error);
            this.isLoadingCategories.set(false);
            this.cdRef.markForCheck();
          }
        });
  }

  /** Vérifie si une catégorie est sélectionnée. */
  isCategorySelected(category: EventCategoryModel): boolean {
    return this.selectedCategories().some(cat => cat.id === category.id);
  }

  /** Active/désactive un filtre de catégorie. */
  toggleCategory(category: EventCategoryModel): void {
    this.selectedCategories.update(categories => {
      const index = categories.findIndex(cat => cat.id === category.id);
      if (index > -1) {
        categories.splice(index, 1);
      } else {
        categories.push(category);
      }
      return [...categories];
    });
  }

  /** Gère le changement de tri avec direction intégrée. */
  onSortChange(sortValue: string): void {
    console.log('Sort change triggered with value:', sortValue); // Debug log
    const [field, direction] = sortValue.split('_');
    console.log('Parsed field:', field, 'direction:', direction); // Debug log

    this.sortBy.set(field);
    this.sortDirection.set(direction as 'asc' | 'desc');

    // Force la détection de changement pour s'assurer que l'effect se déclenche
    this.cdRef.markForCheck();
  }

  /** Bascule l'état du drawer des filtres avancés. */
  toggleAdvancedFilters(): void {
    this.isAdvancedFiltersOpen.update(v => !v);
  }

  /** Gère le changement de date de début. */
  onStartDateChange(event: any): void {
    this.startDate.set(event.value);
  }

  /** Gère le changement de date de fin. */
  onEndDateChange(event: any): void {
    this.endDate.set(event.value);
  }

  /** Réinitialise tous les filtres à leur état initial. */
  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategories.set([]);
    this.sortBy.set('startDate');
    this.sortDirection.set('asc');
    this.startDate.set(null);
    this.endDate.set(null);
    this.location.set('');
  }

  /** Efface le filtre de recherche. */
  clearSearch(): void {
    this.searchQuery.set('');
  }

  /** Efface la plage de dates. */
  clearDateRange(): void {
    this.startDate.set(null);
    this.endDate.set(null);
  }

  /** Efface le filtre de localisation. */
  clearLocation(): void {
    this.location.set('');
  }

  /** Retourne le label du tri actuel. */
  getSortLabel(): string {
    const sortLabels: { [key: string]: string } = {
      'startDate_asc': 'Date (plus proche)',
      'startDate_desc': 'Date (plus lointaine)',
      'name_asc': 'Nom (A-Z)',
      'name_desc': 'Nom (Z-A)'
    };
    return sortLabels[this.currentSortValue()] || 'Date (plus proche)';
  }

  /** Retourne le label de la plage de dates. */
  getDateRangeLabel(): string {
    const start = this.startDate();
    const end = this.endDate();

    if (start && end) {
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    } else if (start) {
      return `À partir du ${start.toLocaleDateString()}`;
    } else if (end) {
      return `Jusqu'au ${end.toLocaleDateString()}`;
    }
    return '';
  }

  /** Retourne l'icône d'une catégorie. */
  getCategoryIcon(category: EventCategoryModel): string {
    // Vous pouvez adapter cette logique selon vos besoins
    return 'category';
  }

  /** Bascule l'affichage des catégories. */
  toggleCategoriesExpanded(): void {
    this.isCategoriesExpanded.update(v => !v);
  }
}
