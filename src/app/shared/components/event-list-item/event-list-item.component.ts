import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { EventModel } from '../../../core/models/event/event.model';

@Component({
  selector: 'app-event-list-item',
  templateUrl: './event-list-item.component.html',
  styleUrls: ['./event-list-item.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule
  ],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListItemComponent implements OnInit {
  @Input() event!: EventModel;

  constructor(
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (!this.event) {
      console.error('EventListItemComponent: Event input is missing.');
    }
  }

  viewEventDetails(event: MouseEvent): void {
    if (this.event && this.event.id) {
      this.router.navigate(['/events', this.event.id]);
    } else {
      console.warn('Cannot navigate to event details: eventId is undefined.');
    }
  }

  get formattedStartDate(): string {
    if (this.event && this.event.startDate) {
      // Exemple: "10 Juil. 2025 ・ 18:00"
      return this.datePipe.transform(this.event.startDate, 'dd MMM yyyy ・ HH:mm', '', 'fr') || '';
    }
    return 'Date non spécifiée';
  }

  get displayLocation(): string {
    if (this.event && this.event.address) {
      return `${this.event.address.city}, ${this.event.address.country}`;
    }
    return ''; // Retourne une chaîne vide si pas d'adresse
  }

  /**
   * Récupère le prix minimum des billets pour l'événement
   * @returns Le prix minimum des billets actifs ou 0 si aucun billet n'est disponible
   */
  getMinTicketPrice(): number {
    if (!this.event || !this.event.seatingZones || this.event.seatingZones.length === 0) {
      return 0;
    }

    // Filtrer les zones de placement actives avec des prix valides
    const activeZonesWithPrices = this.event.seatingZones
      .filter(zone => zone.isActive && zone.ticketPrice !== null && zone.ticketPrice !== undefined);

    // S'il n'y a pas de zones actives avec des prix, retourner 0
    if (activeZonesWithPrices.length === 0) {
      return 0;
    }

    // Trouver le prix minimum parmi les zones actives
    return Math.min(...activeZonesWithPrices.map(zone => zone.ticketPrice));
  }

  // On arrête la propagation du clic si l'utilisateur clique spécifiquement sur le bouton,
  // car l'item entier est déjà cliquable.
  onButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    this.viewEventDetails(event);
  }
}
