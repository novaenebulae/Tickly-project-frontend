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
import {RouterModule} from '@angular/router';
import {EventsDisplayComponent} from '../../../../shared/domain/events/events-display/events-display.component';
import {EventStatus, EventSummaryModel} from '../../../../core/models/event/event.model';
import {EventService} from '../../../../core/services/domain/event/event.service';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {Title} from '@angular/platform-browser';
import {EventSearchParams} from '../../../../core/models/event/event-search-params.model';
import {NotificationService} from '../../../../core/services/domain/utilities/notification.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-all-events-page',
  templateUrl: './all-events-page.component.html',
  styleUrls: ['./all-events-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EventsDisplayComponent,
    MatPaginatorModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllEventsPageComponent implements OnInit {
  // Injection des services
  private eventService = inject(EventService);
  private titleService = inject(Title);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  // Signaux pour les données et l'état du composant
  isLoading = signal(true);
  displayMode = signal<'grid' | 'list'>('grid');
  currentPage = signal(1);
  pageSize = signal(8);
  totalItems = signal(0);

  // Listes d'événements
  events = signal<EventSummaryModel[]>([]);

  displayedEvents = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.events().slice(startIndex, endIndex);
  });

  // Filtres
  currentFilters = signal<EventSearchParams>({sortBy: 'startDate', sortDirection: 'asc', status: EventStatus.PUBLISHED});

  ngOnInit(): void {
    // Définir le titre de la page
    this.titleService.setTitle('Tous les événements | Tickly');

    // Charger les événements
    this.loadEvents();
  }

  /**
   * Charge les événements en fonction des filtres actuels
   */
  loadEvents(): void {
    this.isLoading.set(true);

    // Utiliser la méthode getEvents du service qui gère déjà le filtrage
    this.eventService.getEvents(this.currentFilters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          // window.scrollTo({ top: 0, behavior: 'instant' });
          this.events.set(events);
          this.totalItems.set(events.length);
          this.isLoading.set(false);
          this.cdRef.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des événements:', error);
          this.notificationService.displayNotification(
            'Erreur lors du chargement des événements',
            'error',
            'Fermer'
          );
          this.isLoading.set(false);
          this.cdRef.markForCheck();
        }
      });
  }

  /**
   * Gère le changement des filtres
   */
  onFiltersChanged(filters: EventSearchParams): void {
    this.currentFilters.set(filters);
    this.currentPage.set(1); // Revenir à la première page quand on change les filtres
    this.loadEvents(); // Recharger les événements avec les nouveaux filtres
  }

  /**
   * Gère le changement de page dans la pagination
   */
  onPageChanged(pageEvent: PageEvent): void {
    this.pageSize.set(pageEvent.pageSize);
    this.currentPage.set(pageEvent.pageIndex + 1);
  }

  /**
   * Gère le changement de mode d'affichage (grille ou liste)
   */
  onDisplayModeChanged(mode: 'grid' | 'list'): void {
    this.displayMode.set(mode);
  }
}
