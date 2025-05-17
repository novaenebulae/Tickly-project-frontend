import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../core/services/event.service';
import { Event } from '../core/models/event.model';
import {AllEventsPageComponent} from '../pages/public/all-events-page/all-events-page.component';

@Component({
  selector: 'app-test-events',
  standalone: true,
  imports: [CommonModule, AllEventsPageComponent],
  templateUrl: './test-events.component.html',
  styleUrls: ['./test-events.component.scss']
})
export class TestEventsComponent implements OnInit {
  event?: Event;
  events?: Event[]
  private eventService = inject(EventService);

  ngOnInit(): void {
    // Récupérer le premier événement pour le test
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        if (events && events.length > 0) {
          this.events = events;
          // this.event = events[0]; // Prend le premier événement
          console.log('Événements chargés:', this.event);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'événement:', err);
      }
    });
  }
}
