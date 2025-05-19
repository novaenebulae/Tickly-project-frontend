import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventsDisplayComponent } from '../../../shared/ui/events-display/events-display.component';
import { EventModel } from '../../../core/models/event/event.model';
import { EventService } from '../../../core/services/domain/event.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { EventSearchParams } from '../../../core/models/event/event-search-params.model';
import { NotificationService } from '../../../core/services/domain/notification.service';

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
  ]
})
export class AllEventsPageComponent implements OnInit, OnDestroy {
  // Injection des services
  private eventService = inject(EventService);
  private titleService = inject(Title);
  private notificationService = inject(NotificationService);

  // Signaux pour les données et l'état du composant
  isLoading = signal(true);
  displayMode = signal<'grid' | 'list'>('grid');
  currentPage = signal(1);
  pageSize = signal(12);
  totalItems = signal(0);

  // Listes d'événements
  private allEvents = signal<EventModel[]>([]);
  private filteredEvents = signal<EventModel[]>([]);
  displayedEvents = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredEvents().slice(startIndex, endIndex);
  });

  // Filtres
  currentFilters = signal<EventSearchParams>({});

  // Subject pour gérer la désinscription aux observables
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Définir le titre de la page
    this.titleService.setTitle('Tous les événements | Tickly');

    // Charger les événements
    this.loadEvents();
  }

  ngOnDestroy(): void {
    // Nettoyage des observables
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge tous les événements depuis le service
   */
  loadEvents(): void {
    this.isLoading.set(true);

    this.eventService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.allEvents.set(events);
          this.applyFiltersAndSort();
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des événements:', error);
          this.notificationService.displayNotification(
            'Erreur lors du chargement des événements',
            'error',
            'Fermer'
          );
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Applique les filtres et le tri aux événements
   */
  applyFiltersAndSort(): void {
    const filters = this.currentFilters();
    let result = [...this.allEvents()];

    // Appliquer le filtre par catégorie
    if (filters.category) {
      if (typeof filters.category === 'number') {
        // Si c'est un ID de catégorie
        result = result.filter(event => event.category.id === filters.category);
      } else if (typeof filters.category === 'object' && filters.categoryId) {
        // Si c'est un objet EventCategoryModel
        result = result.filter(event => event.category.id === filters.categoryId);
      }
    }

    // Appliquer le filtre par recherche textuelle
    if (filters.query && filters.query.trim() !== '') {
      const searchTerm = filters.query.toLowerCase().trim();
      result = result.filter(event =>
        event.name.toLowerCase().includes(searchTerm) ||
        (event.shortDescription && event.shortDescription.toLowerCase().includes(searchTerm)) ||
        (event.address && `${event.address.city} ${event.address.country}`.toLowerCase().includes(searchTerm))
      );
    }

    // Appliquer les filtres de date
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter(event =>
        new Date(event.startDate) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      result = result.filter(event =>
        new Date(event.endDate) <= endDate
      );
    }

    // Filtrer par événements gratuits
    if (filters.free === true) {
      result = result.filter(event => event.isFreeEvent);
    }

    // Filtrer par événements mis en avant
    if (filters.featured === true) {
      result = result.filter(event => event.isFeaturedEvent);
    }

    // Filtrer par statut
    if (filters.status) {
      result = result.filter(event => event.status === filters.status);
    }

    // Appliquer les filtres de genre
    if (filters.genres && Object.keys(filters.genres).length > 0) {
      const selectedGenres = Object.entries(filters.genres)
        .filter(([_, selected]) => selected)
        .map(([key]) => key);

      if (selectedGenres.length > 0) {
        result = result.filter(event =>
            event.genre && event.genre.some(g =>
              selectedGenres.includes(g.toLowerCase())
            )
        );
      }
    }

    // Appliquer les filtres de tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(event =>
          event.tags && event.tags.some(tag =>
            filters.tags && filters.tags.includes(tag)
          )
      );
    }

    // Appliquer le tri
    if (filters.sortBy) {
      const direction = filters.sortDirection || 'asc';
      const multiplier = direction === 'asc' ? 1 : -1;

      switch (filters.sortBy) {
        case 'startDate':
          result.sort((a, b) =>
            multiplier * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          );
          break;
        case 'name':
          result.sort((a, b) =>
            multiplier * a.name.localeCompare(b.name)
          );
          break;
        case 'price':
          result.sort((a, b) => {
            const priceA = this.getMinPrice(a);
            const priceB = this.getMinPrice(b);
            return multiplier * (priceA - priceB);
          });
          break;
      }
    } else {
      // Tri par défaut par date de début
      result.sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
    }

    // Mettre à jour la liste des événements filtrés
    this.filteredEvents.set(result);
    this.totalItems.set(result.length);

    // Revenir à la première page si on change les filtres
    this.currentPage.set(1);
  }

  /**
   * Obtient le prix minimum d'un événement
   */
  private getMinPrice(event: EventModel): number {
    if (event.isFreeEvent) return 0;

    if (!event.seatingZones || event.seatingZones.length === 0) return 0;

    const activeZones = event.seatingZones.filter(zone => zone.isActive && zone.ticketPrice > 0);

    if (activeZones.length === 0) return 0;

    return Math.min(...activeZones.map(zone => zone.ticketPrice));
  }

  /**
   * Gère le changement des filtres
   */
  onFiltersChanged(filters: EventSearchParams): void {
    this.currentFilters.set(filters);
    this.applyFiltersAndSort();
  }

  /**
   * Gère le changement de page dans la pagination
   */
  onPageChanged(pageIndex: number, pageSize: number): void {
    this.pageSize.set(pageSize);
    this.currentPage.set(pageIndex + 1);
  }

  /**
   * Gère le changement de mode d'affichage (grille ou liste)
   */
  onDisplayModeChanged(mode: 'grid' | 'list'): void {
    this.displayMode.set(mode);
  }
}
