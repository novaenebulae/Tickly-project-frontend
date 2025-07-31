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

// Interfaces pour les événements émis
interface EventFilters {
  query?: string;
  categoryIds?: number[];
  startDateAfter?: Date;
  startDateBefore?: Date;
  city?: string;
}

interface EventSortOptions {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

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

  // Événements émis vers le parent
  @Output() filtersChanged = new EventEmitter<EventFilters>();
  @Output() sortChanged = new EventEmitter<EventSortOptions>();

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

  /** Calcule l'objet des filtres à émettre. */
  private currentFilters = computed<EventFilters>(() => ({
    query: this.searchQuery() || undefined,
    categoryIds: this.selectedCategories().length > 0 ? this.selectedCategories().map(cat => cat.id) : undefined,
    startDateAfter: this.startDate() || undefined,
    startDateBefore: this.endDate() || undefined,
    city: this.location() || undefined
  }));

  /** Calcule l'objet de tri à émettre. */
  private currentSortOptions = computed<EventSortOptions>(() => ({
    sortBy: this.sortBy(),
    sortDirection: this.sortDirection()
  }));

  constructor() {
    // --- Effets pour émettre les changements au parent ---
    effect(() => {
      this.filtersChanged.emit(this.currentFilters());
    });

    effect(() => {
      this.sortChanged.emit(this.currentSortOptions());
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

  /** Gère le changement de tri. */
  onSortByChange(sortBy: string): void {
    this.sortBy.set(sortBy);
  }

  /** Inverse la direction du tri. */
  toggleSortDirection(): void {
    this.sortDirection.update(current => current === 'asc' ? 'desc' : 'asc');
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
      'startDate': 'Date',
      'name': 'Nom'
    };
    return sortLabels[this.sortBy()] || 'Date';
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
  toggleCategoriesExpand(): void {
    this.isCategoriesExpanded.update(v => !v);
  }
}
