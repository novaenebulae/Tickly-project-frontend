import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {finalize} from 'rxjs/operators';

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
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  StructureCardSkeletonComponent
} from '../../../../shared/domain/structures/structure-card/structure-card-skeleton.component';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';

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
    StructureCardSkeletonComponent
  ],
  animations: [
    trigger('staggerInItems', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('80ms', [
            animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ])
        ], { optional: true })
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllStructuresPageComponent implements OnInit {
  // Services injectés
  private authService = inject(AuthService);
  private structureService = inject(StructureService);
  private notificationService = inject(NotificationService);
  private title = inject(Title);
  private router = inject(Router);
  protected favoritesService = inject(UserFavoritesService);
  private destroyRef = inject(DestroyRef)
  private cdRef = inject(ChangeDetectorRef);

  // --- GESTION D'ÉTAT AVEC LES SIGNALS ---

  // État de l'interface
  readonly isLoading = signal(true);
  readonly isUserLoggedIn = signal(false);

  // Données
  readonly structures = signal<StructureSummaryModel[]>([]);
  readonly structureTypes = signal<StructureTypeModel[]>([]);

  // Paramètres de recherche et pagination
  readonly totalCount = signal(0);
  readonly pageSize = signal(12);
  readonly currentPageIndex = signal(0);
  readonly currentFilters = signal<StructureFilters>({});
  readonly currentSort = signal<StructureSortOptions>({ sortBy: 'name', sortDirection: 'asc' });


  constructor() {
    this.title.setTitle('Toutes les structures | Tickly');
  }

  ngOnInit(): void {
    this.isUserLoggedIn.set(this.authService.isLoggedIn());
    this.loadStructureTypes();
    this.loadStructures();
  }

  /**
   * Charge les types de structures pour les filtres.
   */
  private loadStructureTypes(): void {
    this.structureService.getStructureTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (types: any) => {
          this.structureTypes.set(types);
          this.cdRef.markForCheck();
        },
        error: (error) => {
          this.notificationService.displayNotification(
            'Erreur lors du chargement des types de structures',
            'error'
          );
          console.error('Erreur de chargement des types:', error);
        }
      });
  }

  /**
   * Charge les structures en fonction de l'état actuel des filtres, du tri et de la pagination.
   */
  private loadStructures(): void {
    this.isLoading.set(true);

    const searchParams: StructureSearchParams = {
      page: this.currentPageIndex(),
      pageSize: this.pageSize(),
      sortBy: this.currentSort().sortBy,
      sortDirection: this.currentSort().sortDirection,
      query: this.currentFilters().query,
      typeIds: this.currentFilters().typeIds
    };

    this.structureService.getStructures(searchParams)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading.set(false);
          this.cdRef.markForCheck(); // Garantit la mise à jour de l'état de chargement
        })
      )
      .subscribe({
        next: (response: any) => {
          this.structures.set(response.content);
          this.totalCount.set(response.content.length);
        },
        error: (error) => {
          this.notificationService.displayNotification(
            'Erreur lors du chargement des structures',
            'error'
          );
          console.error('Erreur de chargement des structures:', error);
        }
      });
  }

  /**
   * Gère le changement des filtres depuis le composant enfant.
   */
  onFiltersChanged(filters: StructureFilters): void {
    this.currentFilters.set(filters);
    this.currentPageIndex.set(0); // Réinitialiser à la première page
    this.loadStructures();
  }

  /**
   * Gère le changement de tri.
   */
  onSortChanged(sortOptions: StructureSortOptions): void {
    this.currentSort.set(sortOptions);
    this.loadStructures();
  }

  /**
   * Gère le changement de page depuis le paginator.
   */
  onPageChange(event: PageEvent): void {
    this.currentPageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadStructures();
  }

  /**
   * Gère le clic sur une carte pour voir les détails.
   */
  onViewStructureDetails(structure: StructureSummaryModel): void {
    if (!structure.id) return;
    this.router.navigate(['/structures', structure.id]);
  }

  /**
   * Gère le clic sur le bouton de réservation.
   */
  onBookEvent(structure: StructureSummaryModel): void {
    if (!structure.id) return;
    this.router.navigate(['/structures', structure.id, 'events']);
  }

  /**
   * Gère l'ajout ou le retrait d'une structure des favoris.
   */
  onAddToFavorites(structure: StructureSummaryModel): void {
    if (!this.isUserLoggedIn()) {
      this.notificationService.displayNotification(
        'Veuillez vous connecter pour ajouter des structures aux favoris',
        'info'
      );
      return;
    }

    if (!structure.id) return;

    this.favoritesService.toggleFavorite(structure.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => console.error('Erreur lors du toggle favori:', error)
      });
  }
}
