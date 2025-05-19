import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { EventModel } from '../../../core/models/event/event.model';

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

  constructor(private router: Router, private datePipe: DatePipe) {}

  ngOnInit(): void {
    if (!this.event) {
      console.error('EventCardComponent: Event input is missing.');
    } else {
      // Log pour déboguer
      console.log('Event data:', this.event);
      console.log('Has seating zones:', !!this.event.seatingZones);
      if (this.event.seatingZones) {
        console.log('Active zones with prices:',
          this.event.seatingZones.filter(zone => zone.isActive && zone.ticketPrice > 0));
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
   * Vérifie si l'événement a un prix valide
   */
  hasValidPrice(): boolean {
    // Si c'est gratuit, pas besoin de vérifier le prix
    if (this.event.isFreeEvent) {
      return false;
    }

    // Vérifie que l'événement a des zones de placement avec des prix valides
    return this.event &&
      this.event.seatingZones &&
      this.event.seatingZones.length > 0 &&
      this.event.seatingZones.some(zone => zone.isActive && zone.ticketPrice > 0);
  }

  /**
   * Récupère le prix minimum des billets pour l'événement
   */
  getMinTicketPrice(): number {
    // Si c'est gratuit, le prix est 0
    if (this.event.isFreeEvent) {
      return 0;
    }

    // Si pas de zones de placement ou pas de zones actives avec prix, retourner 0
    if (!this.event.seatingZones || this.event.seatingZones.length === 0) {
      return 0;
    }

    // Filtrer les zones actives avec prix > 0
    const activeZonesWithPrices = this.event.seatingZones
      .filter(zone => zone.isActive && zone.ticketPrice > 0);

    // Si aucune zone ne correspond, retourner 0
    if (activeZonesWithPrices.length === 0) {
      return 0;
    }

    // Trouver le prix minimum
    return Math.min(...activeZonesWithPrices.map(zone => zone.ticketPrice));
  }
}
