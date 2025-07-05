import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {Title} from '@angular/platform-browser';

// Services et modèles
import {StructureService} from '../../../../core/services/domain/structure/structure.service';
import {NotificationService} from '../../../../core/services/domain/utilities/notification.service';
import {StructureSummaryModel} from '../../../../core/models/structure/structure-summary.model';
import {StructureTypeModel} from '../../../../core/models/structure/structure-type.model';
import {StructureSearchParams} from '../../../../core/models/structure/structure-search-params.model';
import {
  StructureFiltersComponent
} from '../../../../shared/domain/structures/structure-filters/structure-filters.component';
import {StructureCardComponent} from '../../../../shared/domain/structures/structure-card/structure-card.component';
import {AuthService} from '../../../../core/services/domain/user/auth.service';
import {UserFavoritesService} from '../../../../core/services/domain/user/user-favorites.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

// Interfaces pour les types utilisés localement
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
    StructureCardComponent,
    MatProgressSpinner
  ]
})
export class AllStructuresPageComponent implements OnInit, OnDestroy {
  // Services injectés
  private authService = inject(AuthService);
  private structureService = inject(StructureService);
  private notificationService = inject(NotificationService);
  private title = inject(Title);
  private router = inject(Router);
  protected favoritesService = inject(UserFavoritesService);

  isUserLoggedIn = false;

  // Types de structures
  structureTypes: StructureTypeModel[] = [];

  // Structure list
  structures: StructureSummaryModel[] = [];

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

    this.isUserLoggedIn = this.authService.isLoggedIn();
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

    // Charger les structures
    this.structureService.getStructures(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.structures = response.content;
          this.totalCount = response.totalElements;
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
   * Navigue vers la page des détails d'une structure
   */
  onViewStructureDetails(structure: StructureSummaryModel): void {
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
  onBookEvent(structure: StructureSummaryModel): void {
    if (!structure.id) {
      this.notificationService.displayNotification(
        'Impossible d\'afficher les événements de cette structure',
        'error',
        'Fermer'
      );
      return;
    }
    this.router.navigate(['/structures', structure.id, 'events']);
  }

  /**
   * Ajoute une structure aux favoris
   */
  onAddToFavorites(structure: StructureSummaryModel): void {
    if (!this.isUserLoggedIn) {
      this.notificationService.displayNotification(
        'Veuillez vous connecter pour ajouter des structures aux favoris',
        'info',
        'Connexion',
        10000
      );
      return;
    }

    if (!structure.id) {
      this.notificationService.displayNotification(
        'Impossible d\'ajouter cette structure aux favoris',
        'error'
      );
      return;
    }

    this.favoritesService.toggleFavorite(structure.id).subscribe({
      next: (isNowFavorite) => {
        console.log(`🔄 Structure ${structure.name} ${isNowFavorite ? 'ajoutée aux' : 'retirée des'} favoris`);
      },
      error: (error) => {
        console.error('Erreur lors du toggle favori:', error);
      }
    });
  }
}
