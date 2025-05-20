import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Services et modèles
import { StructureService } from '../../../core/services/domain/structure.service';
import { NotificationService } from '../../../core/services/domain/notification.service';
import { StructureModel } from '../../../core/models/structure/structure.model';
import { StructureTypeModel } from '../../../core/models/structure/structure-type.model';

import { StructureSearchParams } from '../../../core/models/structure/structure-search-params.model';

@Component({
  selector: 'app-all-structures-page',
  templateUrl: './all-structures-page.component.html',
  styleUrls: ['./all-structures-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ]
})
export class AllStructuresPageComponent implements OnInit, OnDestroy {
  // Injection des services
  private structureService = inject(StructureService);
  private titleService = inject(Title);
  private notificationService = inject(NotificationService);

  // Signaux pour les données et l'état du composant
  isLoading = signal(true);
  displayMode = signal<'grid' | 'list'>('grid');
  currentPage = signal(0);
  pageSize = signal(12);
  totalItems = signal(0);

  // Structures et types de structures
  allStructures = signal<StructureModel[]>([]);
  structureTypes = signal<StructureTypeModel[]>([]);

  // Structures affichées (avec pagination)
  displayedStructures = computed(() => {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.allStructures().slice(startIndex, endIndex);
  });

  // Formulaire de filtrage
  filterForm = new FormGroup({
    query: new FormControl(''),
    typeIds: new FormControl<number[]>([]),
    location: new FormControl(''),
    sortBy: new FormControl('name'),
    sortDirection: new FormControl<'asc' | 'desc'>('asc')
  });

  // Subject pour gérer la désinscription aux observables
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Définir le titre de la page
    this.titleService.setTitle('Toutes les structures | Tickly');

    // Charger les types de structures
    this.loadStructureTypes();

    // Charger les structures
    this.loadStructures();

    // S'abonner aux changements de filtres
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage.set(0); // Revenir à la première page
        this.loadStructures();
      });
  }

  ngOnDestroy(): void {
    // Nettoyage des observables
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les types de structures
   */
  loadStructureTypes(): void {
    this.structureService.getStructureTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          this.structureTypes.set(types);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des types de structures:', error);
          this.notificationService.displayNotification(
            'Erreur lors du chargement des types de structures',
            'error',
            'Fermer'
          );
        }
      });
  }

  /**
   * Charge les structures en fonction des filtres actuels
   */
  loadStructures(): void {
    this.isLoading.set(true);

    // Récupérer les valeurs du formulaire
    const formValues = this.filterForm.value;

    // Préparer les paramètres de recherche en filtrant les valeurs null
    const searchParams: StructureSearchParams = {
      query: formValues.query || undefined,
      typeIds: formValues.typeIds || undefined,
      location: formValues.location || undefined,
      sortBy: formValues.sortBy || undefined,
      sortDirection: formValues.sortDirection || undefined,
    };

    this.structureService.getStructures(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (structures) => {
          this.allStructures.set(structures);
          this.totalItems.set(structures.length);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des structures:', error);
          this.notificationService.displayNotification(
            'Erreur lors du chargement des structures',
            'error',
            'Fermer'
          );
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.filterForm.reset({
      query: '',
      typeIds: [],
      location: '',
      sortBy: 'name',
      sortDirection: 'asc'
    });
    // Le changement de valeur déclenchera loadStructures via l'observable
  }

  /**
   * Gère le changement de page dans la pagination
   */
  onPageChanged(pageEvent: PageEvent): void {
    this.pageSize.set(pageEvent.pageSize);
    this.currentPage.set(pageEvent.pageIndex);
  }

  /**
   * Gère le changement de mode d'affichage (grille ou liste)
   */
  onDisplayModeChanged(mode: 'grid' | 'list'): void {
    this.displayMode.set(mode);
  }

  /**
   * Vérifie si un type de structure est sélectionné
   */
  isTypeSelected(typeId: number): boolean {
    const selectedIds = this.filterForm.get('typeIds')?.value || [];
    return selectedIds.includes(typeId);
  }

  /**
   * Bascule la sélection d'un type de structure
   */
  toggleTypeSelection(typeId: number): void {
    const control = this.filterForm.get('typeIds');
    const currentSelection = control?.value || [];

    if (this.isTypeSelected(typeId)) {
      // Retirer de la sélection
      control?.setValue(currentSelection.filter(id => id !== typeId));
    } else {
      // Ajouter à la sélection
      control?.setValue([...currentSelection, typeId]);
    }
  }
}
