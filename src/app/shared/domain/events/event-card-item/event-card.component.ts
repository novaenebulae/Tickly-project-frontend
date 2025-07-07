import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, DatePipe, NgOptimizedImage} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatRippleModule} from '@angular/material/core';

import {EventSummaryModel} from '../../../../core/models/event/event.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  providers: [DatePipe],
  imports: [
    CommonModule, // Ajout du CommonModule pour NgClass
    NgOptimizedImage,
    MatRippleModule,
    MatIconModule,
    MatButtonModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCardComponent implements OnInit {
  @Input() event!: EventSummaryModel;

  constructor(private router: Router, private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    if (!this.event) {
      console.error('EventCardComponent: Event input is missing.');
    } else {
      // Log pour déboguer
      // console.log('Event data:', this.event);
      // console.log('Has seating zones:', !!this.event.audienceZones);
      // if (this.event.audienceZones) {
      //   console.log('Active zones:',
      //     this.event.audienceZones.filter(zone => zone.isActive));
      // }
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
    if (this.event && this.event.address?.city) {
      return `${this.event.address.city}`;
    }
    return 'Lieu à déterminer';
  }

  get displayStructure(): string {
    if (this.event && this.event.structure.name) {
      return `${this.event.structure.name}`;
    }
    return 'Lieu à déterminer';
  }

get formattedCategories () {
    return this.event.categories.map(cat => cat.name).join(', ');
}


  protected readonly Array = Array;
}
