import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { EventModel } from '../../../../core/models/event/event.model';

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


  // On arrête la propagation du clic si l'utilisateur clique spécifiquement sur le bouton,
  // car l'item entier est déjà cliquable.
  onButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    this.viewEventDetails(event);
  }
}
