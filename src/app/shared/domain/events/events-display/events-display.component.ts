import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterModule} from '@angular/router';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {EventCardComponent} from '../event-card-item/event-card.component';
import {EventListItemComponent} from '../event-list-item/event-list-item.component';
import {EventFiltersComponent} from '../event-filters/event-filters.component';
import {EventSummaryModel} from '../../../../core/models/event/event.model';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsDisplayComponent {
  // Inputs
  @Input() events: EventSummaryModel[] = [];
  @Input() displayMode: 'grid' | 'list' = 'grid';
  @Input() isLoading: boolean = false;
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 8;
  @Input() currentPage: number = 1;
  @Input() showFilters: boolean = true;

  // Outputs
  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() displayModeChanged = new EventEmitter<'grid' | 'list'>();

  // Variables pour l'affichage conditionnel
  skeletonArray = Array(24).fill(0);

  // Propriétés pour la pagination
  pageSizeOptions: number[] = [8, 16, 24, 48];

  onDisplayModeChange(mode: 'grid' | 'list'): void {
    if (this.displayMode !== mode) {
      this.displayMode = mode;
      this.displayModeChanged.emit(mode);
    }
  }

  onFiltersChanged(filters: any): void {
    this.filtersChanged.emit(filters);
  }

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event);
  }
}
