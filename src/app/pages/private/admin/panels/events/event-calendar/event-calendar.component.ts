import {Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewEncapsulation} from '@angular/core';
import 'zone.js';
import {
  CalendarDateFormatter, CalendarDayViewBeforeRenderEvent,
  CalendarEvent,
  CalendarEventAction, CalendarEventTitleFormatter,
  CalendarModule,
  CalendarView, CalendarWeekViewBeforeRenderEvent,
  DAYS_OF_WEEK,
} from 'angular-calendar';
import {Subject, Subscription} from 'rxjs';
import {CommonModule} from '@angular/common';
import {isSameDay, isSameMonth} from 'date-fns';
import {CustomDateFormatter} from '../../../../../../core/providers/date-formatter.provider';
import {Router} from '@angular/router';
import {
  EventDetailDialogComponent,
  EventDialogData
} from '../../../../../../shared/domain/admin/event-details-modal/event-detail-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {CustomEventTitleFormatter} from '../../../../../../core/providers/event-title-formatter.provider';
import {StructureService} from '../../../../../../core/services/domain/structure/structure.service';
import {EventService} from '../../../../../../core/services/domain/event/event.service';
import {UserStructureService} from '../../../../../../core/services/domain/user-structure/user-structure.service';
import {EventModel, EventSummaryModel} from '../../../../../../core/models/event/event.model';
import {AuthService} from '../../../../../../core/services/domain/user/auth.service';
import {UserRole} from '../../../../../../core/models/user/user-role.enum';

@Component({
  selector: 'app-event-calendar',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CalendarModule,
    CommonModule,
    MatIcon,
    MatButton,
  ],
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter,
    },
  ],
})
export class EventCalendarComponent implements OnInit, OnDestroy {

  router = inject(Router);
  eventService = inject(EventService);
  userStructureService = inject(UserStructureService);
  authService = inject(AuthService);

  // Check if the user has permission to edit events
  get canEditEvents(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    return currentUser.role === UserRole.STRUCTURE_ADMINISTRATOR ||
           currentUser.role === UserRole.ORGANIZATION_SERVICE;
  }

  // État de chargement
  isLoading: boolean = false;
  error: string | null = null;

  // Signal d'événements de la structure
  private readonly structureEventsSig = this.userStructureService.userStructureEvents;

  // Couleurs par type d'événement
  private eventColorMap: { [key: string]: { primary: string, secondary: string } } = {
    'concert': { primary: '#dc3545', secondary: '#f8d7da' }, // Rouge pour concerts
    'exposition': { primary: '#fd7e14', secondary: '#fff3cd' }, // Orange pour expos/culture
    'théâtre': { primary: '#0d6efd', secondary: '#cfe2ff' }, // Bleu pour théâtre/spectacle
    'atelier': { primary: '#198754', secondary: '#d1e7dd' }, // Vert pour ateliers
    'conférence': { primary: '#198754', secondary: '#d1e7dd' }, // Vert pour conférences
    'cinéma': { primary: '#6f42c1', secondary: '#e0cffc' }, // Violet pour cinéma/projections
    'festival': { primary: '#ffc107', secondary: '#fff3cd' }, // Jaune pour festivals
    'sport': { primary: '#0dcaf0', secondary: '#cff4fc' }, // Cyan pour sports
    'danse': { primary: '#0d6efd', secondary: '#cfe2ff' }, // Bleu pour danse
    'default': { primary: '#6c757d', secondary: '#e9ecef' } // Gris pour par défaut
  };

  // Subscriptions pour le nettoyage
  private subscriptions: Subscription[] = [];

  // Actions will be set in ngOnInit based on user role
  actions: CalendarEventAction[] = [];

  refresh = new Subject<void>();

  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;

  events: CalendarEvent[] = [];

  activeDayIsOpen = false;

  dayStartHour = 0;

  weekHourSegments = 2;
  dayHourSegments = 2;

  dayHourDuration = 60;
  weekHourDuration = 60;

  locale: string = 'en';

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  weekendDays: number[] = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];

  hourSegmentHeight = 30;


  constructor(private dialog: MatDialog,
              private elRef: ElementRef,
              private renderer: Renderer2) {
    // Initialiser un tableau d'événements vide
    this.events = [];

    // Effect pour observer les changements dans les événements de la structure
    effect(() => {
      const structureEvents = this.structureEventsSig();
      if (structureEvents && structureEvents.length > 0) {
        this.updateCalendarEvents(structureEvents);
      }
    });
  }

  ngOnInit(): void {
    // Set up actions based on user role
    this.setupActions();

    this.loadEvents();
    this.applyGapCorrectionClass(3, 9);
  }

  /**
   * Sets up the calendar event actions based on user role
   */
  private setupActions(): void {
    // Always add the view action
    this.actions = [
      {
        label: '<img src="icons/show.svg">',
        a11yLabel: 'View',
        onClick: ({event}: { event: CalendarEvent }): void => {
          this.handleEvent('View', event);
        },
      }
    ];

    // Only add the edit action if the user has permission
    if (this.canEditEvents) {
      this.actions.unshift({
        label: '<img src="icons/edit.svg">',
        a11yLabel: 'Edit',
        onClick: ({event}: { event: CalendarEvent }): void => {
          this.handleEvent('Edited', event);
        },
      });
    }
  }

  ngOnDestroy(): void {
    // Nettoyer les souscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Charge les événements de la structure de l'utilisateur
   * @param forceRefresh Force le rechargement depuis l'API
   */
  loadEvents(forceRefresh: boolean = false): void {
    this.isLoading = true;
    this.error = null;

    const sub = this.userStructureService.getUserStructureEvents(forceRefresh).subscribe({
      next: (events) => {
        this.updateCalendarEvents(events);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements:', error);
        this.error = "Impossible de charger les événements";
        this.isLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  /**
   * Transforme les événements du modèle de données en événements de calendrier
   * @param events Liste des événements à transformer
   */
  updateCalendarEvents(events: EventSummaryModel[]): void {
    this.events = events.map(event => {
      // Déterminer le type d'événement et sa couleur
      const eventType = event.categories[0]?.name?.toLowerCase() || 'default';
      const color = this.getColorForEventType(eventType);

      // Créer un événement de calendrier
      return {
        title: event.name,
        start: event.startDate,
        end: event.endDate,
        allDay: ((event.startDate.getDay() !== event.endDate.getDay())),
        actions: this.actions,
        color: color,
        meta: {
          id: event.id,
          type: event.categories?.map(c => c.name).join(', '),
          // artists: event. || [],
          description: event.shortDescription || '',
          location: event.address?.city || ''
        }
      } as CalendarEvent;
    });

    // Appliquer les classes CSS pour la correction de l'espacement
    this.applyGapCorrectionClass(3, 9);

    // Rafraîchir l'affichage du calendrier
    this.refresh.next();
  }

  /**
   * Détermine la couleur à utiliser pour un type d'événement
   * @param eventType Type d'événement
   * @returns Objet de couleur pour le calendrier
   */
  getColorForEventType(eventType: string): { primary: string, secondary: string } {
    // Rechercher une correspondance dans la map de couleurs
    for (const [type, color] of Object.entries(this.eventColorMap)) {
      if (eventType.includes(type)) {
        return color;
      }
    }

    // Couleur par défaut si aucune correspondance
    return this.eventColorMap['default'];
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  dayClicked({date, events}: { date: Date, events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;

    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    // Extraire l'ID de l'événement des métadonnées
    const eventId = event.meta?.id;

    if (action === 'Edited' && eventId) {
      // Check if user has permission to edit events
      if (this.canEditEvents) {
        // Rediriger vers la page d'édition de l'événement
        this.router.navigate(['/admin/events', eventId, 'edit']);
      } else {
        // Show notification that user doesn't have permission
        // For now, just open the view dialog instead
        this.handleEvent('View', event);
      }
      return;
    } else if (action === 'View' && eventId) {
      // Rediriger vers la page de détails de l'événement
      this.router.navigate(['/admin/events/details', eventId]);
      return;
    }

    // Fallback: ouvrir la modale avec les informations de l'événement
    const dialogData: EventDialogData = {event, action};

    this.dialog.open(EventDetailDialogComponent, {
      width: '600px',
      data: dialogData
    });
  }

  addEvent(): void {
    // Check if user has permission to create events
    if (this.canEditEvents) {
      this.router.navigateByUrl('admin/events/create');
    }
    // If not, do nothing or show a notification
  }

  refreshEvents(): void {
    this.loadEvents(true);
  }

  beforeViewRender(
    renderEvent: CalendarWeekViewBeforeRenderEvent | CalendarDayViewBeforeRenderEvent
  ): void {
    // --- Correction de la définition des heures d'exclusion ---
    const excludedStartHour = 3; // Heure de début de l'exclusion (incluse: 3h00)
    const excludedEndHour = 9;   // Heure de fin de l'exclusion (exclue: jusqu'à 8h59)

    // Filtrage des heures (logique correcte maintenant)
    renderEvent.hourColumns.forEach((hourColumn) => {
      hourColumn.hours = hourColumn.hours.filter(hour => {
        if (hour.segments.length > 0) {
          const hourValue = hour.segments[0].date.getHours();
          return hourValue < excludedStartHour || hourValue >= excludedEndHour;
        }
        return false;
      });
    });

    this.applyGapCorrectionClass(excludedStartHour, excludedEndHour);
    this.refresh.next();
  }

  applyGapCorrectionClass(excludedStartHour: number, excludedEndHour: number): void {
    const numberOfHiddenHours = excludedEndHour - excludedStartHour;

    const segmentsPerHour = this.view === CalendarView.Day ? this.dayHourSegments : this.weekHourSegments;

    const gapHeight = numberOfHiddenHours * segmentsPerHour * this.hourSegmentHeight;

    this.setGapHeightCssVariable(gapHeight);

    this.events.forEach(event => {
      const eventStartHour = event.start.getHours();
      event.cssClass = (event.cssClass || '').replace('event-after-gap', '').trim();
      // Ajoute si l'événement commence à ou après 9h
      if (eventStartHour >= excludedEndHour) {
        event.cssClass = (event.cssClass ? event.cssClass + ' ' : '') + 'event-after-gap';
      }
    });
  }

  setGapHeightCssVariable(height: number): void {
    const hostElement = this.elRef.nativeElement as HTMLElement;
    // Utilisez directement setProperty sur l'objet style
    hostElement.style.setProperty('--event-gap-height', `-${height}px`);
    console.log(`Set --event-gap-height to: -${height}px`);
  }
}
