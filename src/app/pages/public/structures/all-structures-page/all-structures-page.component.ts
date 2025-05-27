// all-structures-page.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';

// Services et modèles
import { StructureService } from '../../../../core/services/domain/structure.service';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';
import { StructureModel } from '../../../../core/models/structure/structure.model';
import { StructureTypeModel } from '../../../../core/models/structure/structure-type.model';
import { StructureSearchParams } from '../../../../core/models/structure/structure-search-params.model';
import {
  StructureFiltersComponent,
  StructureFilters,
  StructureSortOptions
} from '../../../../shared/components/structures/structure-filters/structure-filters.component';
import { StructureCardComponent } from '../../../../shared/components/structures/structure-card/structure-card.component';
import {AuthService} from '../../../../core/services/domain/user/auth.service';

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
    FormsModule,
    ReactiveFormsModule,
    StructureFiltersComponent,
    StructureCardComponent
  ]
})
export class AllStructuresPageComponent implements OnInit, OnDestroy {
  // Services injectés
  private authService = inject(AuthService);
  private structureService = inject(StructureService);
  private notificationService = inject(NotificationService);
  private title = inject(Title);
  private router = inject(Router);

  isUserLoggedIn = false;

  // Types de structures
  structureTypes: StructureTypeModel[] = [];

  // Structure list
  structures: StructureModel[] = [];

  // Données pour le paginator
  pageSize = 12;
  totalCount = 0;
  loading = false;

  // Paramètres de filtrage et tri actuels
  currentFilters: StructureFilters = {};
  currentSort: StructureSortOptions = { sortBy: 'name', sortDirection: 'asc' };
  currentPage = 0;

  private destroy$ = new Subject<void>();

  constructor() {
    this.title.setTitle('Toutes les structures | Tickly');
  }

  ngOnInit(): void {
    // Initialiser les types de structures
    this.loadStructureTypes();

    // Charger les structures
    this.loadStructures();

    this.isUserLoggedIn = this.authService.isLoggedIn()
      // .get()
      // .pipe(takeUntil(this.destroy$))
      // .subscribe(isLoggedIn => {
      //   this.isUserLoggedIn = isLoggedIn;
      // });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les types de structures
   */
  private loadStructureTypes(): void {
    this.structureService.getStructureTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          this.structureTypes = types;
        },
        error: (error) => {
          this.notificationService.displayNotification(
            'Erreur lors du chargement des types de structures',
            'error',
            'Fermer'
          );
          console.error('Erreur de chargement des types:', error);
        }
      });
  }

  /**
   * Charge les structures en utilisant le service
   */
  private loadStructures(): void {
    this.loading = true;

    // Préparer les paramètres pour le service
    const searchParams: StructureSearchParams = {
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.currentSort.sortBy,
      sortDirection: this.currentSort.sortDirection
    };

    // Ajouter les filtres
    if (this.currentFilters.query) {
      searchParams.query = this.currentFilters.query;
    }

    if (this.currentFilters.typeIds && this.currentFilters.typeIds.length > 0) {
      searchParams.typeIds = this.currentFilters.typeIds;
    }

    if (this.currentFilters.city) {
      searchParams.location = this.currentFilters.city;
    }

    // Charger les structures
    this.structureService.getStructures(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (structures) => {
          this.structures = structures;
          this.totalCount = structures.length
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.displayNotification(
            'Erreur lors du chargement des structures',
            'error',
            'Fermer'
          );
          console.error('Erreur de chargement des structures:', error);
          this.loading = false;
        }
      });
  }

  /**
   * Gère le changement de filtres
   */
  onFiltersChanged(filters: StructureFilters): void {
    this.currentFilters = filters;
    this.currentPage = 0; // Réinitialiser à la première page
    this.loadStructures();
  }

  /**
   * Gère le changement de tri
   */
  onSortChanged(sortOptions: StructureSortOptions): void {
    this.currentSort = sortOptions;
    this.loadStructures();
  }

  /**
   * Gère le changement de page
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.loadStructures();
  }

  /**
   * Calcule la date d'il y a 30 jours pour identifier les nouvelles structures
   */
  getThirtyDaysAgo(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }

  /**
   * Navigue vers la page des détails d'une structure
   */
  onViewStructureDetails(structure: StructureModel): void {
    if (!structure.id) {
      this.notificationService.displayNotification(
        'Impossible d\'afficher les détails de cette structure',
        'error',
        'Fermer'
      );
      return;
    }
    this.router.navigate(['/structures', structure.id]);
  }

  /**
   * Navigue vers la page des événements d'une structure
   */
  onBookEvent(structure: StructureModel): void {
    if (!structure.id) {
      this.notificationService.displayNotification(
        'Impossible d\'afficher les événements de cette structure',
        'error',
        'Fermer'
      );
      return;
    }
    // Renommer de "book" à "events" pour correspondre au nouveau texte du bouton
    this.router.navigate(['/structures', structure.id, 'events']);
  }

  /**
   * Ajoute une structure aux favoris
   */
  onAddToFavorites(structure: StructureModel): void {
    if (!this.isUserLoggedIn) {
      // Rediriger vers la page de connexion ou afficher un message
      this.notificationService.displayNotification(
        'Veuillez vous connecter pour ajouter des structures aux favoris',
        'info',
        'Connexion',
        10000
      );
      return;
    }

    // Code pour ajouter aux favoris
    this.notificationService.displayNotification(
      `${structure.name} ajouté aux favoris`,
      'valid',
      'Fermer'
    );
  }

}
