import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import 'zone.js';
import {
  CalendarDateFormatter,
  CalendarDayViewBeforeRenderEvent,
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTitleFormatter,
  CalendarModule,
  CalendarView,
  CalendarWeekViewBeforeRenderEvent,
  DAYS_OF_WEEK,
} from 'angular-calendar';
import {Subject} from 'rxjs';
import {CommonModule} from '@angular/common';
import {isSameDay, isSameMonth} from 'date-fns';
import {CustomDateFormatter} from '../../../../../../core/providers/date-formatter.provider';
import {Router} from '@angular/router';

import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {CustomEventTitleFormatter} from '../../../../../../core/providers/event-title-formatter.provider';
import {EventService} from '../../../../../../core/services/domain/event/event.service';
import {UserStructureService} from '../../../../../../core/services/domain/user-structure/user-structure.service';
import {AuthService} from '../../../../../../core/services/domain/user/auth.service';
import {UserRole} from '../../../../../../core/models/user/user-role.enum';
import {EventSummaryModel} from '../../../../../../core/models/event/event.model';
import {
  EventDetailsModalService
} from '../../../../../../shared/domain/admin/event-details-modal/event-details-modal.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  changeDetection: ChangeDetectionStrategy .OnPush,
})
export class EventCalendarComponent implements OnInit {

  private router = inject(Router);
  private eventService = inject(EventService);
  private userStructureService = inject(UserStructureService);
  private authService = inject(AuthService);
  private eventDetailsModalService = inject(EventDetailsModalService);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

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

  locale: string = 'fr-FR';

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  weekendDays: number[] = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];

  hourSegmentHeight = 30;


  constructor(private elRef: ElementRef,
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

  /**
   * Charge les événements de la structure de l'utilisateur
   * @param forceRefresh Force le rechargement depuis l'API
   */
  loadEvents(forceRefresh: boolean = false): void {
    this.isLoading = true;
    this.error = null;

    this.userStructureService.getUserStructureEvents(forceRefresh)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (events) => {
        this.updateCalendarEvents(events);
        this.isLoading = false;
        this.cdRef.markForCheck()
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements:', error);
        this.error = "Impossible de charger les événements";
        this.isLoading = false;
        this.cdRef.markForCheck()
      }
    });
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

    if (!eventId) {
      console.error('ID d\'événement manquant');
      return;
    }

    if (action === 'Edited') {
      // Check if user has permission to edit events
      if (this.canEditEvents) {
        // Rediriger vers la page d'édition de l'événement
        this.router.navigate(['/admin/event', eventId, 'edit']);
      } else {
        // Show notification that user doesn't have permission
        // For now, just open the view dialog instead
        this.openEventDetailsModal(eventId);
      }
      return;
    }

    if (action === 'View' || action === 'Clicked') {
      // Ouvrir la modale de détails
      this.openEventDetailsModal(eventId);
      return;
    }
  }

  /**
   * Ouvre la modale de détails de l'événement
   * @param eventId ID de l'événement
   */
  private openEventDetailsModal(eventId: number): void {
    const dialogRef = this.eventDetailsModalService.openEventDetailsModal(eventId);

    // Optionnel : écouter la fermeture de la modale
    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      // Rafraîchir les événements si nécessaire
      if (result?.refreshNeeded) {
        this.refreshEvents();
      }
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
