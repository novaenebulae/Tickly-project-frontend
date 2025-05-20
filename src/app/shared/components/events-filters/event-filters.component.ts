import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';

/**
 * Interface pour les options de tri
 */
interface SortOption {
  value: string;
  viewValue: string;
}

/**
 * Interface pour l'état des filtres
 */
interface FilterState {
  sortBy: string;
  searchQuery: string;
  selectedCategories: string[];
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  location: string;
}

/**
 * Interface pour les filtres actifs affichés
 */
interface ActiveFilter {
  key: string;
  name: string;
  value: string;
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
export class EventFiltersComponent implements OnInit, OnDestroy {
  @Output() filtersChanged = new EventEmitter<FilterState>();
  @Input() initialFilters: Partial<FilterState> = {};

  filtersForm!: FormGroup;
  isAdvancedFilterOpen = false;
  selectedCategories: string[] = [];

  private destroy$ = new Subject<void>();

  // Options pour le tri
  sortOptions: SortOption[] = [
    { value: 'date_asc', viewValue: 'Date (plus proche)' },
    { value: 'date_desc', viewValue: 'Date (plus lointaine)' },
    { value: 'name_asc', viewValue: 'Nom (A-Z)' },
    { value: 'name_desc', viewValue: 'Nom (Z-A)' },
    { value: 'price_asc', viewValue: 'Prix (croissant)' },
    { value: 'price_desc', viewValue: 'Prix (décroissant)' }
  ];

  // Catégories disponibles
  categoriesList: string[] = [
    'Concert', 'Festival', 'Théâtre', 'Danse', 'Exposition',
    'Cinéma', 'Sport', 'Conférence', 'Atelier'
  ];

  constructor(private fb: FormBuilder) {}

  /**
   * Initialise le composant et le formulaire
   */
  ngOnInit(): void {
    this.initForm();
    this.listenToFormChanges();
    this.applyInitialFilters();
  }

  /**
   * Nettoie les souscriptions lors de la destruction du composant
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        takeUntil(this.destroy$)
      )
      .subscribe(formValue => {
        // Formater les filtres avant de les émettre
        const formattedFilters = this.formatFiltersForApi(formValue);
        // Émettre les filtres mis à jour
        this.filtersChanged.emit(formattedFilters);
      });
  }

  /**
   * Formate les filtres pour qu'ils soient compatibles avec l'API
   */
  private formatFiltersForApi(formValue: any): FilterState {
    const formattedFilters: any = { ...formValue };

    console.log('Formatage des filtres:', formValue);

    // Gérer le tri
    if (formValue.sortBy) {
      const [field, direction] = formValue.sortBy.split('_');
      formattedFilters.sortBy = field;
      formattedFilters.sortDirection = direction;
    }

    // Gérer les catégories (transformer en IDs si nécessaire)
    if (formValue.selectedCategories && formValue.selectedCategories.length > 0) {
      formattedFilters.category = formValue.selectedCategories;
    }

    // Gérer les dates
    if (formValue.dateRange) {
      if (formValue.dateRange.startDate) {
        formattedFilters.startDate = new Date(formValue.dateRange.startDate);
      }
      if (formValue.dateRange.endDate) {
        formattedFilters.endDate = new Date(formValue.dateRange.endDate);
      }
      // Supprimer l'objet dateRange pour ne pas le passer en double
      delete formattedFilters.dateRange;
    }

    // Gérer la localisation
    if (formValue.location) {
      formattedFilters.location = formValue.location;
    }

    console.log('Filtres formatés à envoyer:', formattedFilters);
    return formattedFilters;
  }


  /**
   * Applique les filtres initiaux si fournis
   */
  private applyInitialFilters(): void {
    if (this.initialFilters) {
      // Appliquer les valeurs initiales aux contrôles existants
      Object.keys(this.initialFilters).forEach(key => {
        const control = this.filtersForm.get(key);
        if (control) {
          control.setValue(this.initialFilters[key as keyof FilterState]);
        }
      });

      // Pour les catégories sélectionnées
      if (this.initialFilters.selectedCategories) {
        this.selectedCategories = [...this.initialFilters.selectedCategories];
      }
    }
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
  toggleCategory(category: string): void {
    // Récupérer la valeur actuelle du contrôle
    const selectedCategoriesControl = this.filtersForm.get('selectedCategories');
    const currentValues = selectedCategoriesControl?.value || [];

    if (this.isCategorySelected(category)) {
      // Désélectionner la catégorie
      const filteredValues = currentValues.filter((cat: string) => cat !== category);
      selectedCategoriesControl?.setValue(filteredValues);
      this.selectedCategories = [...filteredValues];
    } else {
      // Sélectionner la catégorie sans créer de duplications
      if (!currentValues.includes(category)) {
        const newValues = [...currentValues, category];
        selectedCategoriesControl?.setValue(newValues);
        this.selectedCategories = [...newValues];
      }
    }
  }

  /**
   * Vérifie si une catégorie est actuellement sélectionnée
   */
  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  /**
   * Réinitialise les filtres avancés
   */
  resetAdvancedFilters(): void {
    // Réinitialiser les dates
    const dateRangeGroup = this.filtersForm.get('dateRange') as FormGroup;
    dateRangeGroup.patchValue({
      startDate: null,
      endDate: null
    });

    // Réinitialiser la localisation
    this.filtersForm.get('location')?.setValue('');

    // Ne pas réinitialiser les catégories ici car elles sont dans la section principale
    this.selectedCategories = [];
    this.filtersForm.get('selectedCategories')?.setValue([]);
  }

  /**
   * Applique les filtres avancés et ferme le panneau
   */
  applyAdvancedFilters(): void {
    // Ferme le panneau après application
    this.toggleAdvancedFilters();
    // L'émission des filtres se fait automatiquement via l'observable sur valueChanges
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
    if (formValues.selectedCategories?.length > 0) {
      activeFilters.push({
        key: 'selectedCategories',
        name: 'Catégories',
        value: formValues.selectedCategories
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
    console.log(activeFilters)
    return activeFilters;
  }

  /**
   * Supprime un filtre actif spécifique
   */
  removeFilter(key: string): void {
    if (key === 'searchQuery') {
      this.filtersForm.get('searchQuery')?.setValue('');
    } else if (key === 'selectedCategories') {
      this.filtersForm.get('selectedCategories')?.setValue([]);
      this.selectedCategories = [];
    } else if (key === 'dateRange') {
      const dateRangeGroup = this.filtersForm.get('dateRange') as FormGroup;
      dateRangeGroup.patchValue({
        startDate: null,
        endDate: null
      });
    } else if (key === 'location') {
      this.filtersForm.get('location')?.setValue('');
    }
  }

  /**
   * Efface tous les filtres actifs
   */
  clearAllFilters(): void {
    // Réinitialiser la recherche
    this.filtersForm.get('searchQuery')?.setValue('');

    // Réinitialiser les catégories
    this.filtersForm.get('selectedCategories')?.setValue([]);
    this.selectedCategories = [];

    // Réinitialiser les dates
    const dateRangeGroup = this.filtersForm.get('dateRange') as FormGroup;
    dateRangeGroup.patchValue({
      startDate: null,
      endDate: null
    });

    // Réinitialiser la localisation
    this.filtersForm.get('location')?.setValue('');

    // Conserver le tri par défaut
    // this.filtersForm.get('sortBy')?.setValue('date_asc');
  }
}
