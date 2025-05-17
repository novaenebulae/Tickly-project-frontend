import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventsDisplayComponent } from '../../../shared/ui/events-display/events-display.component';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../../../core/services/event.service';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';

interface EventFilters {
  category?: string;
  searchTerm?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  location?: string;
  sort?: 'dateAsc' | 'dateDesc' | 'relevance';
}

@Component({
  selector: 'app-all-events-page',
  templateUrl: './all-events-page.component.html',
  styleUrls: ['./all-events-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EventsDisplayComponent,
  ]
})
export class AllEventsPageComponent implements OnInit, OnDestroy {
  // État de la page
  isLoading = true;

  // Données des événements
  fullEventsList: Event[] = [];
  processedEvents: Event[] = [];
  displayedEvents: Event[] = [];

  // État des filtres et de l'affichage
  currentFilters: any = {};
  displayMode: 'grid' | 'list' = 'grid';

  // Paramètres de pagination
  totalItems = 0;
  pageSize = 12;
  currentPage = 1;

  // Subject pour gérer la désinscription aux observables
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private titleService: Title
  ) {}

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
    this.isLoading = true;

    this.eventService.getAllEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.fullEventsList = events;
          console.log(this.fullEventsList)
          this.applyFiltersAndSort();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des événements:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Applique les filtres et le tri aux événements
   */
  applyFiltersAndSort(): void {
    // Copie la liste complète pour appliquer les filtres
    let filteredEvents = [...this.fullEventsList];

    // Appliquer le filtre par catégorie
    if (this.currentFilters.category && this.currentFilters.category !== 'Voir tout') {
      filteredEvents = filteredEvents.filter(event =>
        event.category === this.currentFilters.category
      );
    }

    // Appliquer le filtre par recherche textuelle
    if (this.currentFilters.searchTerm && this.currentFilters.searchTerm.trim() !== '') {
      const searchTerm = this.currentFilters.searchTerm.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(event =>
        event.name.toLowerCase().includes(searchTerm) ||
        (event.shortDescription && event.shortDescription.toLowerCase().includes(searchTerm)) ||
        (event.locations && event.locations.some(location =>
          location.name && location.name.toLowerCase().includes(searchTerm)
        ))
      );
    }

    // Appliquer les filtres avancés si présents
    if (this.currentFilters.dateRange) {
      if (this.currentFilters.dateRange.start) {
        const startDate = new Date(this.currentFilters.dateRange.start);
        filteredEvents = filteredEvents.filter(event =>
          new Date(event.startDate) >= startDate
        );
      }

      if (this.currentFilters.dateRange.end) {
        const endDate = new Date(this.currentFilters.dateRange.end);
        filteredEvents = filteredEvents.filter(event =>
          new Date(event.startDate) <= endDate
        );
      }
    }

    if (this.currentFilters.location) {
      const location = this.currentFilters.location.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(event =>
        event.locations && event.locations.some(loc =>
          loc.name && loc.name.toLowerCase().includes(location)
        )
      );
    }

    // Appliquer le tri
    if (this.currentFilters.sort) {
      switch (this.currentFilters.sort) {
        case 'dateAsc':
          filteredEvents.sort((a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
          break;
        case 'dateDesc':
          filteredEvents.sort((a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          break;
        // Pour 'relevance', on garde l'ordre par défaut
      }
    }

    // Mettre à jour la liste des événements traités
    this.processedEvents = filteredEvents;
    this.totalItems = this.processedEvents.length;

    // Mettre à jour les événements affichés sur la page actuelle
    this.updateDisplayedEvents();
  }

  /**
   * Met à jour la liste des événements affichés en fonction de la pagination
   */
  updateDisplayedEvents(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.displayedEvents = this.processedEvents.slice(startIndex, endIndex);
  }

  /**
   * Gère le changement des filtres
   */
  onFiltersChanged(filters: EventFilters): void {
    this.currentFilters = filters;
    this.currentPage = 1; // Réinitialiser à la première page
    this.applyFiltersAndSort();
  }

  /**
   * Gère le changement de page dans la pagination
   */
  onPageChanged(pageIndex: number, pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = pageIndex + 1;
    this.updateDisplayedEvents();
  }

  /**
   * Gère le changement de mode d'affichage (grille ou liste)
   */
  onDisplayModeChanged(mode: 'grid' | 'list'): void {
    this.displayMode = mode;
  }
}
