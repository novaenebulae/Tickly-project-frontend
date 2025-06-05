import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';

// Services
import { EventService } from '../../../../../../core/services/domain/event/event.service';
import { CategoryService } from '../../../../../../core/services/domain/event/category.service';
import { AuthService } from '../../../../../../core/services/domain/user/auth.service';
import { UserStructureService } from '../../../../../../core/services/domain/user-structure/user-structure.service';

// Models
import { EventModel, EventStatus } from '../../../../../../core/models/event/event.model';
import { EventCategoryModel } from '../../../../../../core/models/event/event-category.model';
import { EventSearchParams } from '../../../../../../core/models/event/event-search-params.model';

registerLocaleData(localeFr);

interface FilterStatus {
  [key: string]: boolean;
}

@Component({
  selector: 'app-events-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatMenuModule,
    MatCheckboxModule, MatChipsModule, MatTooltipModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatBadgeModule, MatDividerModule, MatPaginatorModule,
    MatExpansionModule, RouterLink,
  ],
  templateUrl: './events-panel.component.html',
  styleUrls: ['./events-panel.component.scss'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
})
export class EventsPanelComponent implements OnInit, OnDestroy {

  // Services
  private eventService = inject(EventService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private userStructureService = inject(UserStructureService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);
  private cdRef = inject(ChangeDetectorRef);

  // UI State
  isLoading: boolean = false;
  error: string | null = null;
  defaultImage: string = 'images/no-image.jpg';
  filtersExpanded: boolean = false;

  // Data
  private allEvents: EventModel[] = [];
  filteredEvents: EventModel[] = [];
  paginatedEvents: EventModel[] = [];
  categories: EventCategoryModel[] = [];

  // Pagination
  pageSize: number = 10;
  currentPage: number = 0;
  totalItems: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // Filters and Search
  sortOption: string = 'startDate_asc';
  searchTerm: string = '';
  selectedCategoryIds: number[] = [];
  dateRangeStart: string = '';
  dateRangeEnd: string = '';

  filterStatus: FilterStatus = {
    'draft': false,
    'published': true,
    'pending_approval': false,
    'cancelled': false,
    'completed': false
  };

  // Statistics
  totalEvents: number = 0;
  publishedEvents: number = 0;
  draftEvents: number = 0;
  upcomingEvents: number = 0;

  // Structure events signal subscription
  private structureEventsSubscription: Subscription | null = null;

  // Search debounce
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;
  private subscriptions: Subscription[] = [];

  constructor() {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCategories();
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.searchSubscription?.unsubscribe();
    this.structureEventsSubscription?.unsubscribe();
  }

  // === Data Loading ===

  loadCategories(): void {
    const categoriesSub = this.categoryService.loadCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    });
    this.subscriptions.push(categoriesSub);
  }

  loadEvents(forceRefresh: boolean = false): void {
    this.isLoading = true;
    this.error = null;

    // Annuler la souscription précédente si elle existe
    if (this.structureEventsSubscription) {
      this.structureEventsSubscription.unsubscribe();
      this.structureEventsSubscription = null;
    }

    // S'abonner au signal des événements de la structure
    this.structureEventsSubscription = this.userStructureService.getUserStructureEvents(forceRefresh).subscribe({
      next: (events) => {
        this.allEvents = events;
        this.calculateStatistics();
        this.processEvents();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements:', error);
        this.error = "Erreur lors du chargement des événements.";
        this.isLoading = false;
      }
    });

    this.subscriptions.push(this.structureEventsSubscription);
  }

  // === Statistics ===

  calculateStatistics(): void {
    this.totalEvents = this.allEvents.length;
    this.publishedEvents = this.allEvents.filter(e => e.status === 'published').length;
    this.draftEvents = this.allEvents.filter(e => e.status === 'draft').length;
    this.upcomingEvents = this.allEvents.filter(e =>
      e.status === 'published' && new Date(e.startDate) > new Date()
    ).length;
  }

  // === Search and Filtering ===

  setupSearchDebounce(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.processEvents();
        this.cdRef.markForCheck();
      });
  }

  onSearchTermChange(): void {
    this.searchSubject.next(this.searchTerm || '');
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.processEvents();
  }

  onCategoryChange(): void {
    this.processEvents();
  }

  onDateRangeChange(): void {
    this.processEvents();
  }

  onStatusFilterChange(): void {
    this.processEvents();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryIds = [];
    this.dateRangeStart = '';
    this.dateRangeEnd = '';

    this.filterStatus = {
      'draft': false,
      'published': true,
      'pending_approval': false,
      'cancelled': false,
      'completed': false
    };

    this.processEvents();
  }

  // === Event Processing ===

  processEvents(): void {
    let events = [...this.allEvents];

    const activeStatusFilters = Object.keys(this.filterStatus)
      .filter(status => this.filterStatus[status]) as EventStatus[];

    if (activeStatusFilters.length > 0) {
      events = events.filter(event => activeStatusFilters.includes(event.status));
    } else {
      events = [];
    }

    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
      events = events.filter(event =>
        event.name.toLowerCase().includes(lowerSearchTerm) ||
        event.shortDescription?.toLowerCase().includes(lowerSearchTerm) ||
        event.fullDescription.toLowerCase().includes(lowerSearchTerm) ||
        event.category?.name.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (this.selectedCategoryIds.length > 0) {
      events = events.filter(event =>
        event.category && this.selectedCategoryIds.includes(event.category.id)
      );
    }

    if (this.dateRangeStart) {
      const startDate = new Date(this.dateRangeStart);
      events = events.filter(event => new Date(event.startDate) >= startDate);
    }

    if (this.dateRangeEnd) {
      const endDate = new Date(this.dateRangeEnd);
      events = events.filter(event => new Date(event.startDate) <= endDate);
    }

    this.sortEvents(events);

    this.filteredEvents = events;
    this.totalItems = events.length;

    this.currentPage = 0;
    this.updatePaginatedEvents();
  }

  sortEvents(events: EventModel[]): void {
    const [field, direction] = this.sortOption.split('_');

    events.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (field) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'startDate':
          valueA = new Date(a.startDate).getTime();
          valueB = new Date(b.startDate).getTime();
          break;
        case 'category':
          valueA = a.category?.name.toLowerCase() || '';
          valueB = b.category?.name.toLowerCase() || '';
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // === Pagination ===

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedEvents();
  }

  private updatePaginatedEvents(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEvents = this.filteredEvents.slice(startIndex, endIndex);
  }

  // === UI Helpers ===

  getStatusColor(status: EventStatus): 'primary' | 'accent' | 'warn' | undefined {
    switch (status) {
      case 'published': return 'primary';
      case 'draft': return 'accent';
      case 'cancelled': return 'warn';
      case 'completed': return undefined;
      case 'pending_approval': return 'accent';
      default: return undefined;
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'published': return 'Publié';
      case 'draft': return 'Brouillon';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      case 'pending_approval': return 'En attente';
      default: return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'published': return 'check_circle';
      case 'draft': return 'edit';
      case 'cancelled': return 'cancel';
      case 'completed': return 'done_all';
      case 'pending_approval': return 'schedule';
      default: return 'help';
    }
  }

  formatEventDuration(event: EventModel): string {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    const startStr = this.datePipe.transform(start, 'dd/MM HH:mm');
    const endStr = this.datePipe.transform(end, 'HH:mm');

    return `${startStr} - ${endStr}`;
  }

  // === Event Actions ===

  onAddEvent(): void {
    this.router.navigate(['/admin/events/create']);
  }

  refreshEvents(): void {
    this.loadEvents(true);
  }

  showEventDetails(event: EventModel): void {
    this.router.navigate(['/admin/events/details', event.id]);
  }

  editEvent(event: EventModel): void {
    this.router.navigate(['/admin/events', event.id, 'edit']);
  }

  deleteEvent(event: EventModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.name}" ?`)) {
      const deleteSub = this.eventService.deleteEvent(event.id!).subscribe({
        next: (success) => {
          if (success) {
            // Forcer le rafraîchissement des événements après suppression
            this.loadEvents(true);
            this.snackBar.open('Événement supprimé avec succès', 'Fermer', {
              duration: 3000
            });
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000
          });
        }
      });
      this.subscriptions.push(deleteSub);
    }
  }

  openEventPage(event: EventModel): void {
    this.router.navigate(['/events', event.id]);
  }
}
