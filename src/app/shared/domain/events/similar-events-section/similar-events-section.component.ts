import {ChangeDetectionStrategy, Component, DestroyRef, inject, Input, OnInit} from '@angular/core';
import {EventService} from '../../../../core/services/domain/event/event.service';
import {EventSummaryModel} from '../../../../core/models/event/event.model';
import {EventsCarouselComponent} from '../events-carousel/events-carousel.component';
import {CommonModule} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-similar-events-section',
  standalone: true,
  imports: [CommonModule, EventsCarouselComponent],
  templateUrl: './similar-events-section.component.html',
  styleUrl: './similar-events-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimilarEventsSectionComponent implements OnInit {
  @Input() event: EventSummaryModel | undefined;

  private destroyRef = inject(DestroyRef);

  private eventService = inject(EventService);
  similarEvents: EventSummaryModel[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadSimilarEvents();
  }

  private loadSimilarEvents(): void {
    if (this.event) {
      const searchTerms = this.event.categories.map(c => c.id);

      this.eventService.searchEvents('', {categoryIds: searchTerms})
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
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
