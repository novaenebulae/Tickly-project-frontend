import {Component, ElementRef, inject, OnInit, Renderer2, ViewEncapsulation} from '@angular/core';
import 'zone.js';
import {
  CalendarDateFormatter, CalendarDayViewBeforeRenderEvent,
  CalendarEvent,
  CalendarEventAction, CalendarEventTitleFormatter,
  CalendarModule,
  CalendarView, CalendarWeekViewBeforeRenderEvent,
  DAYS_OF_WEEK,
} from 'angular-calendar';
import {Subject} from 'rxjs';
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

@Component({
  selector: 'app-event-calendar',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CalendarModule,
    CommonModule,
    MatCard,
    MatCardContent,
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
export class EventCalendarComponent implements OnInit {

  router = inject(Router);

  actions: CalendarEventAction[] = [
    {
      label: '<img src="icons/edit.svg">',
      a11yLabel: 'Edit',
      onClick: ({event}: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<img src="icons/show.svg">',
      a11yLabel: 'View',
      onClick: ({event}: { event: CalendarEvent }): void => {
        this.handleEvent('View', event);
      },
    },
  ];

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

    // Liste d'événements fictifs pour peupler le calendrier
    this.events = [
      // --- Semaine Précédente ---
      {
        title: 'Concert Rock: Les Amplifiés',
        start: new Date("2025-05-02T20:30:00"), // Vendredi soir dernier
        end: new Date("2025-05-02T23:00:00"),
        actions: this.actions,
        color: {primary: '#dc3545', secondary: '#f8d7da'}, // Rouge pour concerts
        meta: {
          type: 'Concert',
          artists: ['Les Amplifiés', 'Première Partie: Echoes'],
          description: 'Soirée rock pour bien commencer le week-end.',
          location: 'Salle Le Transistor'
        }
      },
      {
        title: 'Expo Art Numérique',
        start: new Date("2025-05-03T10:00:00"), // Samedi dernier (journée)
        end: new Date("2025-05-04T18:00:00"),   // Samedi et Dimanche
        allDay: false, // Ou true si vous préférez l'afficher comme tel
        actions: this.actions,
        color: {primary: '#fd7e14', secondary: '#fff3cd'}, // Orange pour expos/culture
        meta: {
          type: 'Exposition',
          artists: ['Collectif Pixels', 'Artiste Invité: K. Lemet'],
          description: 'Immersion dans les nouvelles formes d\'art digital.',
          location: 'Centre d\'Art Contemporain'
        }
      },
      {
        title: 'Théâtre: "Le Songe"',
        start: new Date("2025-05-04T16:00:00"), // Dimanche dernier après-midi
        end: new Date("2025-05-04T18:30:00"),
        actions: this.actions,
        color: {primary: '#0d6efd', secondary: '#cfe2ff'}, // Bleu pour théâtre/spectacle
        meta: {
          type: 'Théâtre',
          artists: ['Compagnie Les Rêveurs'],
          description: 'Adaptation moderne d\'une pièce classique.',
          location: 'Théâtre de la Ville'
        }
      },

      // --- Semaine Actuelle (autour du 5 Mai) ---
      {
        title: 'Atelier Écriture Créative',
        start: new Date("2025-05-05T14:00:00"), // Aujourd'hui (Lundi) après-midi
        end: new Date("2025-05-05T16:30:00"),
        actions: this.actions,
        color: {primary: '#198754', secondary: '#d1e7dd'}, // Vert pour ateliers/conférences
        meta: {
          type: 'Atelier',
          artists: ['Animateur: Jean Dupont'],
          description: 'Libérez votre imagination et explorez l\'écriture.',
          location: 'Médiathèque Centrale'
        }
      },
      {
        title: 'Projection Film Indé',
        start: new Date("2025-05-06T20:00:00"), // Mardi soir
        end: new Date("2025-05-06T22:15:00"),
        actions: this.actions,
        color: {primary: '#6f42c1', secondary: '#e0cffc'}, // Violet pour cinéma/projections
        meta: {
          type: 'Cinéma',
          artists: ['Réalisateur: Sophie Martin'],
          description: 'Découverte d\'un nouveau talent du cinéma indépendant.',
          location: 'Cinéma Le Studio'
        }
      },
      {
        title: 'Concert Jazz Manouche',
        start: new Date("2025-05-07T21:00:00"), // Mercredi soir
        end: new Date("2025-05-07T23:30:00"),
        actions: this.actions,
        color: {primary: '#dc3545', secondary: '#f8d7da'}, // Rouge
        meta: {
          type: 'Concert',
          artists: ['Gypsy Swing Trio'],
          description: 'Ambiance chaleureuse au rythme du jazz manouche.',
          location: 'Le Caveau du Swing'
        }
      },
      {
        title: 'Festival "Goût du Monde" - Jour 1',
        start: new Date("2025-05-09T18:00:00"), // Vendredi soir prochain
        end: new Date("2025-05-09T23:59:00"), // Se termine à minuit
        actions: this.actions,
        color: {primary: '#ffc107', secondary: '#fff3cd'}, // Jaune pour festivals
        meta: {
          type: 'Festival',
          artists: ['Cuisine du Monde', 'Groupe Musique du Monde'],
          description: 'Ouverture du festival culinaire et musical.',
          location: 'Parc Central'
        }
      },
      {
        title: 'Match de Basket Local',
        start: new Date("2025-05-10T15:00:00"), // Samedi prochain après-midi
        end: new Date("2025-05-10T17:00:00"),
        actions: this.actions,
        color: {primary: '#0dcaf0', secondary: '#cff4fc'}, // Cyan pour sports/autres
        meta: {
          type: 'Sport',
          artists: ['Équipe A vs Équipe B'], // On peut utiliser 'artists' pour les équipes/participants
          description: 'Match important pour le championnat local.',
          location: 'Gymnase Municipal'
        }
      },
      {
        title: 'Spectacle de Danse Contemporaine',
        start: new Date("2025-05-11T20:00:00"), // Dimanche prochain soir
        end: new Date("2025-05-11T21:30:00"),
        actions: this.actions,
        color: {primary: '#0d6efd', secondary: '#cfe2ff'}, // Bleu
        meta: {
          type: 'Danse',
          artists: ['Compagnie Corpus'],
          description: 'Exploration du mouvement et de l\'expression corporelle.',
          location: 'Espace Culturel Ravel'
        }
      },

      // --- Semaine Suivante ---
      {
        title: 'Conférence: Le Futur du Web',
        start: new Date("2025-05-13T18:30:00"), // Mardi suivant
        end: new Date("2025-05-13T20:00:00"),
        actions: this.actions,
        color: {primary: '#198754', secondary: '#d1e7dd'}, // Vert
        meta: {
          type: 'Conférence',
          artists: ['Intervenant: Dr. Alice Moreau'],
          description: 'Tendances et innovations technologiques pour le web de demain.',
          location: 'Campus Numérique'
        }
      }]

  }

  ngOnInit(): void {
    this.applyGapCorrectionClass(3, 9);
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
    // Créez les données à passer
    const dialogData: EventDialogData = {event, action};

    // Ouvrez la modale MatDialog
    this.dialog.open(EventDetailDialogComponent, {
      width: 'lg', // Ou 'lg' si vous préférez la taille Bootstrap
      // ou size: 'lg' n'existe pas directement, utilisez width/height
      data: dialogData // Passez les données via la propriété 'data'
      // Autres options MatDialogConfig si nécessaire : disableClose, etc.
    });
  }

  addEvent(): void {
    this.router.navigateByUrl('admin/events/create');
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
