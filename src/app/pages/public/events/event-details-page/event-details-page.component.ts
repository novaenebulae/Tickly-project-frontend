// src/app/pages/public/event-details-page/event-details-page.component.ts

import {Component, OnInit, OnDestroy, inject, signal, AfterViewInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subject, catchError, finalize, of, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';

// Services
import { EventService } from '../../../../core/services/domain/event/event.service';
import { StructureService } from '../../../../core/services/domain/structure/structure.service';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';
import { AuthService } from '../../../../core/services/domain/user/auth.service';

// Models
import {EventModel, EventSummaryModel} from '../../../../core/models/event/event.model';
import { StructureModel } from '../../../../core/models/structure/structure.model';

// Components
import { EventBannerComponent } from '../../../../shared/domain/events/event-banner/event-banner.component';
import { EventDescriptionSectionComponent } from '../../../../shared/domain/events/event-description-section/event-description-section.component';
import { EventInfoSectionComponent } from '../../../../shared/domain/events/event-info-section/event-info-section.component';
import { EventGallerySectionComponent } from '../../../../shared/domain/events/event-gallery-section/event-gallery-section.component';
import { EventTicketsSectionComponent } from '../../../../shared/domain/events/event-tickets-section/event-tickets-section.component';
import { EventSocialSectionComponent } from '../../../../shared/domain/events/event-social-section/event-social-section.component';
import { SimilarEventsSectionComponent } from '../../../../shared/domain/events/similar-events-section/similar-events-section.component';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {tap} from 'rxjs/operators';
import {EventsCarouselComponent} from '../../../../shared/domain/events/events-carousel/events-carousel.component';
import {EventCategoryModel} from '../../../../core/models/event/event-category.model';

@Component({
  selector: 'app-event-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
    EventBannerComponent,
    EventInfoSectionComponent,
    EventGallerySectionComponent,
    EventSocialSectionComponent,
    MatIcon,
    EventDescriptionSectionComponent,
    MatButton,
    EventsCarouselComponent,
  ],
  templateUrl: './event-details-page.component.html',
  styleUrls: ['./event-details-page.component.scss']
})
export class EventDetailsPageComponent implements OnInit, OnDestroy {
  // Services injectés
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private structureService = inject(StructureService);
  private notificationService = inject(NotificationService);
  private titleService = inject(Title);
  private authService = inject(AuthService);

  private destroy$ = new Subject<void>();

  // Signaux et propriétés
  event = signal<EventModel | undefined>(undefined);
  structure = signal<StructureModel | null>(null);
  similarEvents = signal<EventSummaryModel[]>([]);
  isUserLoggedIn = false;
  isLoading = true;
  hasError = false;
  errorMessage = '';

  ngOnInit(): void {

    // Vérifier si l'utilisateur est connecté
    this.isUserLoggedIn = this.authService.isLoggedIn();

    // Récupérer l'ID de l'événement depuis l'URL
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const eventId = params.get('id');
      if (eventId && !isNaN(Number(eventId))) {
        this.loadEventData(Number(eventId));
      } else {
        this.handleError('Identifiant d\'événement invalide');
        this.router.navigate(['/events']);
      }
    });
  }

  // ngAfterViewInit(){
  //   setTimeout(() => window.scrollTo(0, 0), 500);
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les données de l'événement et de la structure associée
   */
  private loadEventData(eventId: number): void {
    this.isLoading = true;
    this.hasError = false;

    // Récupérer les détails de l'événement
    this.eventService.getEventById(eventId)
      .pipe(
        // tap(eventData => {
        //   console.log('Données reçues dans le composant parent:', eventData);
        //   console.log('Areas dans le composant parent:', eventData?.areas);
        //
        // }),
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          window.scrollTo({top: 0, behavior: 'instant'});
        }),
        catchError(error => {
          this.handleError('Impossible de charger les détails de l\'événement');
          return of(undefined);
        })
      )
      .subscribe(eventData => {
        if (eventData) {
          this.event.set(eventData);
          this.titleService.setTitle(`${eventData.name} | Tickly`);

          // Charger les données de la structure
          this.loadStructureData(eventData.structure.id);

          // Charger les événements similaires
          this.loadSimilarEvents(eventData.id!, eventData.categories);
        } else {
          this.handleError('Événement non trouvé');
          this.router.navigate(['/events']);
        }
      });
  }

  /**
   * Charge les données de la structure organisatrice
   */
  private loadStructureData(structureId: number): void {
    this.structureService.getStructureById(structureId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erreur lors du chargement de la structure:', error);
          return of(null);
        })
      )
      .subscribe(structureData => {
        this.structure.set(structureData || null);
      });
  }

  /**
   * Charge les événements similaires (même catégorie ou même structure)
   */
  private loadSimilarEvents(excludeId: number, categories: EventCategoryModel[]): void {
    // Définir les paramètres de recherche pour trouver des événements similaires
    // Ici on recherche des événements avec les mêmes catégories, à l'exception de l'événement actuel
    const categoryIds = categories.map(category => category.id);

    const params = {
      categoryIds: categoryIds,
      pageSize: 4,
    };

    this.eventService.getEvents(params)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erreur lors du chargement des événements similaires:', error);
          return of([]);
        })
      )
      .subscribe(events => {
        this.similarEvents.set(events.filter(event => event.id !== excludeId));
      });
  }

  /**
   * Gère les erreurs lors du chargement des données
   */
  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.notificationService.displayNotification(
      message,
      'error',
      'Fermer'
    );
  }

  /**
   * Ajoute l'événement au calendrier de l'utilisateur
   */
  addToCalendar(): void {
    // Implémenter la logique pour ajouter au calendrier
    if (!this.event()) return;

    const eventData = this.event() as EventModel;
    // Logique à implémenter pour générer un fichier .ics ou utiliser l'API Calendar

    this.notificationService.displayNotification(
      'Événement ajouté à votre calendrier',
      'valid',
      'Fermer'
    );
  }

  /**
   * Commence le processus de réservation
   */
  startBooking(): void {
    if (!this.event()) return;

    const eventData = this.event() as EventModel;

    if (!this.isUserLoggedIn) {
      // Rediriger vers la page de connexion avec un paramètre de retour
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: `/events/${eventData.id}/booking`
        }
      });
      return;
    }

    // Rediriger vers la page de réservation
    this.router.navigate([`/events/${eventData.id}/booking`]);
  }
}
