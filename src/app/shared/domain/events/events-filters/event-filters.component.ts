import {Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {debounceTime} from 'rxjs/operators';
import {EventCategoryModel} from '../../../../core/models/event/event-category.model';
import {CategoryService} from '../../../../core/services/domain/event/category.service';
import {EventSearchParams} from '../../../../core/models/event/event-search-params.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


// Interface pour les options de tri
interface SortOption {
  value: string;
  viewValue: string;
}

// Interface pour les filtres actifs à afficher
interface ActiveFilter {
  key: string;
  name: string;
  value: string | string[];
}

// État des filtres pour l'API
interface FilterState {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  query?: string;
  category?: EventCategoryModel[];
  startDate?: Date;
  endDate?: Date;
  location?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-event-filters',
  templateUrl: './event-filters.component.html',
  styleUrls: ['./event-filters.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class EventFiltersComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<FilterState>();
  @Input() initialFilters: Partial<FilterState> = {};

  filtersForm!: FormGroup;
  isAdvancedFilterOpen = false;
  selectedCategories: EventCategoryModel[] = [];

  categoryService = inject(CategoryService);

  private destroyRef = inject(DestroyRef);

  categoriesList:EventCategoryModel[] = [];

  // Options pour le tri
  sortOptions: SortOption[] = [
    { value: 'startDate_asc', viewValue: 'Date (plus proche)' },
    { value: 'startDate_desc', viewValue: 'Date (plus lointaine)' },
    { value: 'name_asc', viewValue: 'Nom (A-Z)' },
    { value: 'name_desc', viewValue: 'Nom (Z-A)' }
  ];

  constructor(private fb: FormBuilder) {}

  /**
   * Initialise le composant et le formulaire
   */
  ngOnInit(): void {
    this.categoryService.loadCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(categories => {
      this.categoriesList = categories;
    })
    this.initForm();
    this.listenToFormChanges();
    // this.applyInitialFilters();
  }

  /**
   * Initialise le formulaire réactif avec tous les contrôles nécessaires
   */
  private initForm(): void {
    // Initialiser le formulaire principal
    this.filtersForm = this.fb.group({
      sortBy: ['date_asc'],
      searchQuery: [''],
      selectedCategories: [[]],
      dateRange: this.fb.group({
        startDate: [null],
        endDate: [null]
      }),
      location: [''],
    });
  }

  /**
   * Écoute les changements de valeur du formulaire et émet les modifications
   */
  private listenToFormChanges(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(300), // Attendre 300ms après le dernier changement
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(formValue => {
        // Formater les filtres avant de les émettre
        const formattedFilters = this.formatFiltersForApi(formValue);
        // Émettre les filtres mis à jour
        this.filtersChanged.emit(formattedFilters);
      });
  }

  /**
   * Bascule l'état d'ouverture/fermeture du panneau de filtres avancés
   */
  toggleAdvancedFilters(): void {
    this.isAdvancedFilterOpen = !this.isAdvancedFilterOpen;
  }

  /**
   * Gère la sélection/désélection d'une catégorie
   */
  toggleCategory(category: EventCategoryModel): void {
    // Vérifier si la catégorie est déjà sélectionnée
    const index = this.selectedCategories.indexOf(category);

    if (index === -1) {
      // Si non sélectionnée, l'ajouter
      this.selectedCategories = [...this.selectedCategories, category];
    } else {
      // Si déjà sélectionnée, la retirer
      const newSelected = [...this.selectedCategories];
      newSelected.splice(index, 1);
      this.selectedCategories = newSelected;
    }

    // Mettre à jour le contrôle du formulaire
    this.filtersForm.get('selectedCategories')?.setValue(this.selectedCategories);
  }

  /**
   * Vérifie si une catégorie est actuellement sélectionnée
   */
  isCategorySelected(category: EventCategoryModel): boolean {
    return this.selectedCategories.includes(category);
  }

  /**
   * Retourne le nombre de filtres avancés appliqués
   */
  getAppliedFiltersCount(): number {
    let count = 0;

    // Vérifier si des dates sont sélectionnées
    const dateRange = this.filtersForm.get('dateRange')?.value;
    if (dateRange?.startDate || dateRange?.endDate) count++;

    // Vérifier si un lieu est sélectionné
    if (this.filtersForm.get('location')?.value) count++;

    return count;
  }

  /**
   * Vérifie s'il y a des filtres actifs à afficher
   */
  hasActiveFilters(): boolean {
    return this.getActiveFilters().length > 0;
  }

  /**
   * Retourne la liste des filtres actifs pour affichage
   */
  getActiveFilters(): ActiveFilter[] {
    const activeFilters: ActiveFilter[] = [];
    const formValues = this.filtersForm.value;

    // Ajouter le filtre de recherche s'il est présent
    if (formValues.searchQuery) {
      activeFilters.push({
        key: 'searchQuery',
        name: 'Recherche',
        value: formValues.searchQuery
      });
    }

    // Ajouter les catégories sélectionnées
    if (this.selectedCategories.length > 0) {
      activeFilters.push({
        key: 'selectedCategories',
        name: 'Catégories',
        value: this.selectedCategories.map(category => category.name).join(', ')
      });
    }

    // Ajouter la date si définie
    const dateRange = formValues.dateRange;
    if (dateRange?.startDate || dateRange?.endDate) {
      let dateValue = '';

      if (dateRange.startDate && dateRange.endDate) {
        const formatDate = (date: Date) => new Date(date).toLocaleDateString();
        dateValue = `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
      } else if (dateRange.startDate) {
        dateValue = `À partir du ${new Date(dateRange.startDate).toLocaleDateString()}`;
      } else if (dateRange.endDate) {
        dateValue = `Jusqu'au ${new Date(dateRange.endDate).toLocaleDateString()}`;
      }

      activeFilters.push({
        key: 'dateRange',
        name: 'Période',
        value: dateValue
      });
    }

    // Ajouter le lieu si défini
    if (formValues.location) {
      activeFilters.push({
        key: 'location',
        name: 'Lieu',
        value: formValues.location
      });
    }

    return activeFilters;
  }

  /**
   * Supprime un filtre actif spécifique
   */
  removeFilter(key: string): void {
    switch (key) {
      case 'searchQuery':
        this.filtersForm.get('searchQuery')?.setValue('');
        break;
      case 'selectedCategories':
        this.selectedCategories = [];
        this.filtersForm.get('selectedCategories')?.setValue([]);
        break;
      case 'dateRange':
        const dateRangeGroup = this.filtersForm.get('dateRange') as FormGroup;
        dateRangeGroup.patchValue({
          startDate: null,
          endDate: null
        });
        break;
      case 'location':
        this.filtersForm.get('location')?.setValue('');
        break;
    }
  }

  /**
   * Efface tous les filtres actifs
   */
  clearAllFilters(): void {
    // Réinitialiser la recherche
    this.filtersForm.get('searchQuery')?.setValue('');

    // Réinitialiser les catégories
    this.selectedCategories = [];
    this.filtersForm.get('selectedCategories')?.setValue([]);

    // Réinitialiser les dates
    const dateRangeGroup = this.filtersForm.get('dateRange') as FormGroup;
    dateRangeGroup.patchValue({
      startDate: null,
      endDate: null
    });

    // Réinitialiser la localisation
    this.filtersForm.get('location')?.setValue('');
  }

  /**
   * Formate les filtres pour qu'ils soient compatibles avec l'API
   */
  private formatFiltersForApi(formValue: any): EventSearchParams {
    const formattedFilters: EventSearchParams = {};

    // Gérer le tri (pour le service, pas directement pour l'API de filtre)
    if (formValue.sortBy) {
      const [field, direction] = formValue.sortBy.split('_');
      formattedFilters.sortBy = field;
      formattedFilters.sortDirection = direction as 'asc' | 'desc';
    }

    // Gérer la recherche textuelle
    if (formValue.searchQuery && formValue.searchQuery.trim() !== '') {
      formattedFilters.query = formValue.searchQuery.trim();
    }

    if (this.selectedCategories && this.selectedCategories.length > 0) {
      formattedFilters.categoryIds = this.selectedCategories.map(cat => cat.id);
    }

    if (formValue.dateRange) {
      if (formValue.dateRange.startDate) {
        formattedFilters.startDateAfter = new Date(formValue.dateRange.startDate);
      }
      if (formValue.dateRange.endDate) {
        formattedFilters.startDateBefore = new Date(formValue.dateRange.endDate);
      }
    }

    if (formValue.location && formValue.location.trim() !== '') {
      formattedFilters.city = formValue.location.trim();
    }

    return formattedFilters;
  }
}
