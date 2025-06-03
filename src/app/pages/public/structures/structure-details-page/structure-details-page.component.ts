import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil, switchMap, combineLatest } from 'rxjs';
import {EventBannerComponent} from '../../../../shared/domain/events/event-banner/event-banner.component';
import {EventsCarouselComponent} from '../../../../shared/domain/events/events-carousel/events-carousel.component';
import {EventsDisplayComponent} from '../../../../shared/domain/events/events-display/events-display.component';
import {StructureService} from '../../../../core/services/domain/structure/structure.service';
import {EventService} from '../../../../core/services/domain/event/event.service';
import {StructureModel} from '../../../../core/models/structure/structure.model';
import {EventModel} from '../../../../core/models/event/event.model';
import {EventSearchParams} from '../../../../core/models/event/event-search-params.model';

@Component({
  selector: 'app-structure-details-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatTabsModule,
    EventBannerComponent,
    EventsCarouselComponent,
    EventsDisplayComponent,
    RouterLink
  ],
  templateUrl: './structure-details-page.component.html',
  styleUrls: ['./structure-details-page.component.scss']
})
export class StructureDetailsPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private structureService = inject(StructureService);
  private eventService = inject(EventService);
  private destroy$ = new Subject<void>();

  // Signals pour l'état
  structure = signal<StructureModel | null>(null);
  isLoadingStructure = signal(true);
  structureError = signal<string | null>(null);

  // Événements
  featuredEvent = signal<EventModel | null>(null);
  featuredEvents = signal<EventModel[]>([]);
  allEvents = signal<EventModel[]>([]);
  isLoadingEvents = signal(true);
  eventsError = signal<string | null>(null);

  // Pagination et filtres
  currentPage = signal(1);
  pageSize = signal(9);
  totalEvents = signal(0);
  displayMode = signal<'grid' | 'list'>('grid');
  eventFilters = signal<EventSearchParams>({});
  showFilters = signal(false); // Nouveau signal pour gérer l'affichage des filtres

  // Computed
  structureId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  });

  ngOnInit(): void {
    const id = this.structureId();
    if (id) {
      this.loadStructureDetails(id);
      this.loadStructureEvents(id);
    } else {
      this.router.navigate(['/structures']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les détails de la structure
   */
  private loadStructureDetails(structureId: number): void {
    this.isLoadingStructure.set(true);
    this.structureError.set(null);

    this.structureService.getStructureById(structureId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (structure) => {
          if (structure) {
            // if (this.route.snapshot.url[2].path === 'events') {
            // }
            window.scrollTo({top: 0, behavior: 'instant'});
            this.structure.set(structure);
          } else {
            this.structureError.set('Structure non trouvée');
          }
          this.isLoadingStructure.set(false);
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la structure:', error);
          this.structureError.set('Erreur lors du chargement de la structure');
          this.isLoadingStructure.set(false);
        }
      });
  }

  /**
   * Charge les événements de la structure
   */
  private loadStructureEvents(structureId: number): void {
    this.isLoadingEvents.set(true);
    this.eventsError.set(null);

    combineLatest([
      this.eventService.getEventsByStructure(structureId),
      this.eventService.getStructureFeaturedEvents(structureId)
    ]).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([eventsResult, featuredEvents]) => {
          this.allEvents.set(eventsResult || []);
          this.totalEvents.set(eventsResult.length || 0);
          this.featuredEvents.set(featuredEvents || []);
          this.featuredEvent.set(featuredEvents[0]);
          this.isLoadingEvents.set(false);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des événements:', error);
          this.eventsError.set('Erreur lors du chargement des événements');
          this.isLoadingEvents.set(false);
        }
      });
  }

  /**
   * Toggle l'affichage des filtres
   */
  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  /**
   * Gestion du changement de page
   */
  onPageChanged(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    const structureId = this.structureId();
    if (structureId) {
      this.loadStructureEvents(structureId);
    }
  }

  /**
   * Gestion du changement de filtres
   */
  onFiltersChanged(filters: any): void {
    this.eventFilters.set(filters);
    this.currentPage.set(1);
    const structureId = this.structureId();
    if (structureId) {
      this.loadStructureEvents(structureId);
    }
  }

  /**
   * Gestion du changement de mode d'affichage
   */
  onDisplayModeChanged(mode: 'grid' | 'list'): void {
    this.displayMode.set(mode);
  }

  /**
   * Gestion de la réservation depuis le banner
   */
  onBookFeaturedEvent(): void {
    const event = this.featuredEvent();
    if (event) {
      this.router.navigate(['/events', event.id, 'booking']);
    }
  }

  /**
   * Navigation vers la page de contact de la structure
   */
  contactStructure(): void {
    const structure = this.structure();
    if (structure?.email) {
      window.location.href = `mailto:${structure.email}`;
    }
  }

  /**
   * Ouvre le site web de la structure
   */
  openWebsite(): void {
    const structure = this.structure();
    if (structure?.websiteUrl) {
      window.open(structure.websiteUrl, '_blank');
    }
  }
}
