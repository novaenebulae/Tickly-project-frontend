import {Component, inject, Input, OnInit} from '@angular/core';
import {EventService} from '../../../../core/services/domain/event/event.service';
import {EventModel} from '../../../../core/models/event/event.model';
import {EventsCarouselComponent} from '../events-carousel/events-carousel.component';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-similar-events-section',
  standalone: true,
  imports: [CommonModule, EventsCarouselComponent],
  templateUrl: './similar-events-section.component.html',
  styleUrl: './similar-events-section.component.scss'
})
export class SimilarEventsSectionComponent implements OnInit {
  @Input() event: EventModel | undefined;

  private eventService = inject(EventService);
  similarEvents: EventModel[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadSimilarEvents();
  }

  private loadSimilarEvents(): void {
    if (this.event) {
      const searchTerms = [this.event.category];

      this.eventService.searchEvents('', {category: searchTerms}).subscribe({
        next: (events) => {
          // Filtrer l'événement actuel et limiter à 6 événements similaires
          this.similarEvents = events
            .filter(e => e.id !== this.event?.id)
            .slice(0, 6);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des événements similaires:', error);
          this.loading = false;
        }
      });
    }
  }
}
