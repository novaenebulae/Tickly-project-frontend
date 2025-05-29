import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, CurrencyPipe, DatePipe, SlicePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatRippleModule} from '@angular/material/core';

import {EventModel} from '../../../../core/models/event/event.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  providers: [DatePipe],
  imports: [
    CommonModule, // Ajout du CommonModule pour NgClass
    CurrencyPipe,
    SlicePipe,
    MatRippleModule,
    MatIconModule,
    MatButtonModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCardComponent implements OnInit {
  @Input() event!: EventModel;

  constructor(private router: Router, private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    if (!this.event) {
      console.error('EventCardComponent: Event input is missing.');
    } else {
      // Log pour déboguer
      console.log('Event data:', this.event);
      console.log('Has seating zones:', !!this.event.audienceZones);
      if (this.event.audienceZones) {
        console.log('Active zones:',
          this.event.audienceZones.filter(zone => zone.isActive));
      }
    }
  }

  /**
   * Navigue vers la page de détail de l'événement.
   */
  viewEventDetails(eventId: number | undefined): void {
    if (eventId) {
      this.router.navigate(['/events', eventId]);
    } else {
      console.warn('Cannot navigate to event details: eventId is undefined.');
    }
  }

  /**
   * Navigue vers la page de réservation de l'événement.
   */
  bookEvent(eventId: number | undefined): void {
    if (eventId) {
      this.router.navigate(['/events', eventId, 'booking']);
    } else {
      console.warn('Cannot navigate to booking page: eventId is undefined.');
    }
  }

  /**
   * Retourne l'adresse formatée de l'événement
   */
  get displayLocation(): string {
    if (this.event && this.event.address) {
      return `${this.event.address.city}, ${this.event.address.country}`;
    }
    return 'Lieu à déterminer';
  }

  /**
   * Retourne le jour de la date de début formaté.
   */
  get formattedStartDateDay(): string {
    if (this.event && this.event.startDate) {
      return this.datePipe.transform(this.event.startDate, 'dd') || '';
    }
    return '';
  }

  /**
   * Retourne le mois de la date de début formaté (en majuscules).
   */
  get formattedStartDateMonth(): string {
    if (this.event && this.event.startDate) {
      const month = this.datePipe.transform(this.event.startDate, 'MMM');
      return month ? month.toUpperCase().replace('.', '') : '';
    }
    return '';
  }

  /**
   * Récupère le prix minimum des billets pour l'événement
   */
  getMinTicketPrice(): number {
    return 0
  }
}
