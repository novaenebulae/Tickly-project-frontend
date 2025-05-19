import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { EventModel } from '../../../core/models/event/event.model';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  providers: [DatePipe],
  imports: [
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

  constructor(private router: Router, private datePipe: DatePipe) {}

  ngOnInit(): void {
    if (!this.event) {
      console.error('EventCardComponent: Event input is missing.');
    }
  }

  /**
   * Navigue vers la page de détail de l'événement.
   * @param eventId L'ID de l'événement.
   */
  viewEventDetails(eventId: number | undefined): void {
    if (eventId) {
      this.router.navigate(['/events', eventId]);
    } else {
      console.warn('Cannot navigate to event details: eventId is undefined.');
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
    if (!this.event || !this.event.seatingZones || this.event.seatingZones.length === 0) {
      return 0;
    }

    // Filtrer les zones de placement actives avec des prix valides
    const activeZonesWithPrices = this.event.seatingZones
      .filter(zone => zone.isActive && zone.ticketPrice > 0);

    // S'il n'y a pas de zones actives avec des prix, retourner 0
    if (activeZonesWithPrices.length === 0) {
      return 0;
    }

    // Trouver le prix minimum parmi les zones actives
    return Math.min(...activeZonesWithPrices.map(zone => zone.ticketPrice));
  }
}
