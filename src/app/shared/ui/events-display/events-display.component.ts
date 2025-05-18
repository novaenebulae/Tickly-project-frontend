import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { Event } from '../../../core/models/event.model';
import { EventCardComponent } from '../../components/event-card-item/event-card.component';
import { EventListItemComponent } from '../../components/event-list-item/event-list-item.component';
import { EventFiltersComponent } from '../../components/events-filters/event-filters.component';

@Component({
  selector: 'app-events-display',
  templateUrl: './events-display.component.html',
  styleUrl: './events-display.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    EventCardComponent,
    EventListItemComponent,
    EventFiltersComponent
  ],
  animations: [
    trigger('staggerInEvents', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger('70ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class EventsDisplayComponent implements OnInit {
  // Inputs
  @Input() events: Event[] = [];
  @Input() displayMode: 'grid' | 'list' = 'grid';
  @Input() isLoading: boolean = false;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 12;
  @Input() currentPage: number = 1;

  // Outputs
  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() displayModeChanged = new EventEmitter<'grid' | 'list'>();

  // Variables pour l'affichage conditionnel
  skeletonArray = Array(12).fill(0);

  // Propriétés pour la pagination
  pageSizeOptions: number[] = [4, 8, 12, 24, 48];

  constructor() { }

  ngOnInit(): void {
    // Logique d'initialisation si nécessaire
  }

  onDisplayModeChange(mode: 'grid' | 'list'): void {
    if (this.displayMode !== mode) {
      this.displayMode = mode;
      this.displayModeChanged.emit(mode);
    }
  }

  onFiltersChanged(filters: any): void {
    console.log('Filtres reçus dans events-display:', filters);
    this.filtersChanged.emit(filters);
  }

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event);
  }
}
