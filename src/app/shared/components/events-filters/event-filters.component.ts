import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // ou MatLuxonDateModule, MatMomentDateModule
import { MatCheckboxModule } from '@angular/material/checkbox';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Interface pour les critères de filtre émis
export interface EventFilterCriteria {
  searchTerm?: string | null;
  category?: string | null; // 'all' ou une catégorie spécifique
  sortBy?: string | null;
  dateRange?: { start: Date | null; end: Date | null } | null;
  location?: string | null;
  genres?: string[] | null; // Peut être plusieurs genres
}

// Exemple de catégories (pourrait venir d'un service ou d'un @Input)
export const EVENT_CATEGORIES = ['Voir tout', 'Concerts', 'Théâtre', 'Festivals', 'Sports', 'Expositions', 'Conférences', 'Autres'];
export const EVENT_GENRES_EXAMPLE = { // Genres par catégorie (simplifié)
  'Concerts': ['Rock', 'Pop', 'Jazz', 'Electro', 'Classique'],
  'Théâtre': ['Comédie', 'Drame', 'Contemporain'],
  'Festivals': ['Musique', 'Cinéma', 'Art de rue']
};


@Component({
  selector: 'app-event-filters',
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
    MatDatepickerModule,
    MatNativeDateModule, // Assurez-vous que le provider est aussi dans app.config.ts si besoin globalement
    MatCheckboxModule
  ],
  templateUrl: './event-filters.component.html',
  styleUrls: ['./event-filters.component.scss']
})
export class EventFiltersComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Output() filtersChanged = new EventEmitter<EventFilterCriteria>();

  filterForm: FormGroup;
  categories: string[] = EVENT_CATEGORIES;
  availableGenres: string[] = []; // Sera mis à jour en fonction de la catégorie

  sortOptions = [
    { value: 'relevance', viewValue: 'Pertinence' },
    { value: 'date_asc', viewValue: 'Date (les plus proches)' },
    { value: 'date_desc', viewValue: 'Date (les plus lointains)' },
    { value: 'popularity', viewValue: 'Popularité' },
    { value: 'price_asc', viewValue: 'Prix (croissant)' },
    { value: 'price_desc', viewValue: 'Prix (décroissant)' },
  ];

  // Pour contrôler l'ouverture du panneau des filtres avancés (si non géré par un MatDrawer externe)
  showAdvancedFiltersPanel = false;

  constructor() {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      category: [this.categories[0]], // 'Voir tout' par défaut
      sortBy: [this.sortOptions[0].value], // 'Pertinence' par défaut
      // Filtres avancés
      dateRange: this.fb.group({
        start: [null],
        end: [null]
      }),
      location: [''],
      genres: this.fb.array([]) // Pour les checkboxes de genres
    });
  }

  ngOnInit(): void {
    // Émettre les filtres lorsque les valeurs des contrôles principaux changent
    this.filterForm.get('searchTerm')?.valueChanges.pipe(
      debounceTime(300), // Attendre 300ms après la dernière frappe
      distinctUntilChanged() // N'émettre que si la valeur a changé
    ).subscribe(() => this.emitFilters());

    this.filterForm.get('category')?.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(category => {
      this.updateAvailableGenres(category);
      this.emitFilters();
    });

    this.filterForm.get('sortBy')?.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(() => this.emitFilters());

    // Initialiser les genres si une catégorie est déjà sélectionnée (ex: par défaut)
    this.updateAvailableGenres(this.filterForm.get('category')?.value);
  }

  private updateAvailableGenres(category: string | null): void {
    const genresForCategory = category ? EVENT_GENRES_EXAMPLE[category as keyof typeof EVENT_GENRES_EXAMPLE] : [];
    this.availableGenres = genresForCategory || [];

    // Réinitialiser et reconstruire le FormArray pour les genres
    const genresFormArray = this.fb.array(this.availableGenres.map(() => this.fb.control(false)));
    this.filterForm.setControl('genres', genresFormArray);
  }

  onGenreChange(event: any, index: number): void {
    // Pas besoin de faire grand chose ici si on émet sur "Appliquer les filtres"
    // Le FormArray est déjà mis à jour par la liaison (ngModel ou formControl)
    // Si on voulait une réaction immédiate, il faudrait appeler emitFilters() ici.
  }

  // Méthode pour gérer la sélection des chips de catégorie
  selectCategory(category: string): void {
    this.filterForm.get('category')?.setValue(category);
    // valueChanges s'occupera d'appeler updateAvailableGenres et emitFilters
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFiltersPanel = !this.showAdvancedFiltersPanel;
    // Si on utilisait un MatDrawer, on appellerait drawer.toggle()
  }

  applyAdvancedFilters(): void {
    this.emitFilters();
    this.showAdvancedFiltersPanel = false; // Optionnel: fermer le panneau après application
  }

  resetAdvancedFilters(): void {
    this.filterForm.get('dateRange')?.reset({ start: null, end: null });
    this.filterForm.get('location')?.reset('');
    // Réinitialiser les genres cochés
    const genresFormArray = this.filterForm.get('genres') as any; // FormArray
    for (let i = 0; i < genresFormArray.length; i++) {
      genresFormArray.at(i).setValue(false);
    }
    this.emitFilters(); // Émettre après réinitialisation des filtres avancés
  }

  resetAllFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      category: this.categories[0],
      sortBy: this.sortOptions[0].value,
      dateRange: { start: null, end: null },
      location: '',
      // genres: Il faut le reconstruire car le reset simple ne marche pas bien avec FormArray de booleans
    });
    this.updateAvailableGenres(this.filterForm.get('category')?.value); // ceci va reconstruire le formArray genres
    this.emitFilters();
  }

  private emitFilters(): void {
    const formValue = this.filterForm.value;

    // Traiter les genres sélectionnés
    const selectedGenres = formValue.genres
      ? formValue.genres
        .map((checked: boolean, i: number) => checked ? this.availableGenres[i] : null)
        .filter((value: string | null) => value !== null)
      : [];

    const criteria: EventFilterCriteria = {
      searchTerm: formValue.searchTerm || null,
      category: formValue.category === 'Voir tout' ? null : formValue.category,
      sortBy: formValue.sortBy || null,
      dateRange: (formValue.dateRange.start || formValue.dateRange.end) ? formValue.dateRange : null,
      location: formValue.location || null,
      genres: selectedGenres.length > 0 ? selectedGenres : null
    };
    this.filtersChanged.emit(criteria);
  }

  // Méthodes pour les options rapides de date (si implémentées)
  selectDateQuickOption(option: 'today' | 'weekend' | 'next_week' | 'next_month'): void {
    const today = new Date();
    let startDate: Date | null = new Date(today); // Initialize with today
    let endDate: Date | null = new Date(today); // Initialize with today

    switch (option) {
      case 'today':
        // startDate et endDate sont déjà initialisés à today
        break;
      case 'weekend':
        const dayOfWeek = today.getDay(); // 0 (Dimanche) - 6 (Samedi)
        const startOfWeekOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, reculer de 6 jours, sinon aller au Lundi
        startDate = new Date(today.setDate(today.getDate() + startOfWeekOffset + 5)); // Samedi de cette semaine
        endDate = new Date(new Date(startDate).setDate(startDate.getDate() + 1)); // Dimanche de cette semaine
        break;
      case 'next_week':
        startDate = new Date(today.setDate(today.getDate() + (7 - today.getDay() + 1) % 7 +1)); // Lundi prochain
        endDate = new Date(new Date(startDate).setDate(startDate.getDate() + 6)); // Dimanche prochain
        break;
      case 'next_month':
        startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0); // Dernier jour du mois prochain
        break;
    }
    this.filterForm.get('dateRange')?.setValue({ start: startDate, end: endDate });
    // On pourrait émettre directement les filtres ou attendre "Appliquer"
  }
}
