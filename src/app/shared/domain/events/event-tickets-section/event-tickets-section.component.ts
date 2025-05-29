import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  availableQuantity: number;
  totalQuantity: number;
  isSoldOut: boolean;
  maxPerOrder?: number;
}

@Component({
  selector: 'app-event-tickets-section',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './event-tickets-section.component.html',
  styleUrl: './event-tickets-section.component.scss'
})
export class EventTicketsSectionComponent implements OnInit {
  @Input() tickets: TicketType[] = [];
  @Input() eventId: string = '';
  @Input() eventDate: Date | null = null;
  @Input() isEventCancelled: boolean = false;
  @Input() isEventSoldOut: boolean = false;

  totalAvailableTickets: number = 0;
  totalTickets: number = 0;
  availabilityPercentage: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.calculateTicketStats();
  }

  calculateTicketStats(): void {
    if (!this.tickets || this.tickets.length === 0) return;

    this.totalAvailableTickets = this.tickets.reduce(
      (total, ticket) => total + ticket.availableQuantity, 0
    );

    this.totalTickets = this.tickets.reduce(
      (total, ticket) => total + ticket.totalQuantity, 0
    );

    this.availabilityPercentage = this.totalTickets > 0
      ? (this.totalAvailableTickets / this.totalTickets) * 100
      : 0;
  }

  getAvailabilityColor(ticket: TicketType): string {
    const percentage = (ticket.availableQuantity / ticket.totalQuantity) * 100;
    if (percentage <= 10) return 'accent'; // rouge/orange
    if (percentage <= 30) return 'warn';  // jaune/orange
    return 'primary'; // bleu/vert
  }

  getAvailabilityText(ticket: TicketType): string {
    const percentage = (ticket.availableQuantity / ticket.totalQuantity) * 100;
    if (percentage <= 10) return 'Presque épuisé';
    if (percentage <= 30) return 'Se remplit rapidement';
    return 'Disponible';
  }

  startBooking(): void {
    if (this.eventId) {
      this.router.navigate(['/checkout', this.eventId]);
    }
  }

  // isBookingDisabled(): boolean {
  //   return this.isEventCancelled ||
  //     this.isEventSoldOut ||
  //     this.totalAvailableTickets <= 0 ||
  //     (this.eventDate && new Date() > this.eventDate);
  // }

  getBookingButtonText(): string {
    if (this.isEventCancelled) return 'Événement annulé';
    if (this.isEventSoldOut) return 'Complet';
    if (this.eventDate && new Date() > this.eventDate) return 'Événement terminé';
    return 'Réserver maintenant';
  }
}
