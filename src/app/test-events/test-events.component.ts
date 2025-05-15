import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventListItemComponent } from '../shared/components/event-list-item/event-list-item.component';
import { EventService } from '../core/services/event.service';
import { Event } from '../core/models/event.model';
import {EventFiltersComponent} from '../shared/components/events-filters/event-filters.component';

@Component({
  selector: 'app-test-events',
  standalone: true,
  imports: [CommonModule, EventListItemComponent, EventFiltersComponent],
  templateUrl: './test-events.component.html',
  styleUrls: ['./test-events.component.scss']
})
export class TestEventsComponent implements OnInit {
  event?: Event;
  private eventService = inject(EventService);

  ngOnInit(): void {
    // Récupérer le premier événement pour le test
    this.eventService.getEvents().subscribe({
      next: (events) => {
        if (events && events.length > 0) {
          this.event = events[0]; // Prend le premier événement
          console.log('Événement chargé:', this.event);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'événement:', err);
      }
    });
  }
}
