import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  LOCALE_ID,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import {CommonModule, DatePipe, registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

// Angular Material imports
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatBadgeModule} from '@angular/material/badge';
import {MatDividerModule} from '@angular/material/divider';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatExpansionModule} from '@angular/material/expansion';

// Services
import {EventService} from '../../../../../../core/services/domain/event/event.service';
import {CategoryService} from '../../../../../../core/services/domain/event/category.service';
import {UserStructureService} from '../../../../../../core/services/domain/user-structure/user-structure.service';

// Models
import {EventStatus, EventSummaryModel} from '../../../../../../core/models/event/event.model';
import {EventCategoryModel} from '../../../../../../core/models/event/event-category.model';

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
    {provide: LOCALE_ID, useValue: 'fr-FR'}
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsPanelComponent implements OnInit {

  // Services
  private eventService = inject(EventService);
  private categoryService = inject(CategoryService);
  private userStructureService = inject(UserStructureService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);
  private cdRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  // UI State Signals
  private isLoadingSig: WritableSignal<boolean> = signal(false);
  public readonly isLoading = computed(() => this.isLoadingSig());

  private errorSig: WritableSignal<string | null> = signal(null);
  public readonly error = computed(() => this.errorSig());

  private defaultImageSig: WritableSignal<string> = signal('images/no-image.jpg');
  public readonly defaultImage = computed(() => this.defaultImageSig());

  public filtersExpandedSig: WritableSignal<boolean> = signal(false);
  public readonly filtersExpanded = computed(() => this.filtersExpandedSig());

  // Data Signals
  private allEventsSig: WritableSignal<EventSummaryModel[]> = signal([]);
  private filteredEventsSig: WritableSignal<EventSummaryModel[]> = signal([]);
  public readonly filteredEvents = computed(() => this.filteredEventsSig());

  private paginatedEventsSig: WritableSignal<EventSummaryModel[]> = signal([]);
  public readonly paginatedEvents = computed(() => this.paginatedEventsSig());

  private categoriesSig: WritableSignal<EventCategoryModel[]> = signal([]);
  public readonly categories = computed(() => this.categoriesSig());

  // Pagination Signals
  private pageSizeSig: WritableSignal<number> = signal(10);
  public readonly pageSize = computed(() => this.pageSizeSig());

  private currentPageSig: WritableSignal<number> = signal(0);
  public readonly currentPage = computed(() => this.currentPageSig());

  private totalItemsSig: WritableSignal<number> = signal(0);
  public readonly totalItems = computed(() => this.totalItemsSig());

  private pageSizeOptionsSig: WritableSignal<number[]> = signal([5, 10, 20, 50]);
  public readonly pageSizeOptions = computed(() => this.pageSizeOptionsSig());

  // Filters and Search Signals
  public sortOptionSig: WritableSignal<string> = signal('startDate_asc');
  public readonly sortOption = computed(() => this.sortOptionSig());

  public searchTermSig: WritableSignal<string> = signal('');
  public readonly searchTerm = computed(() => this.searchTermSig());

  public selectedCategoryIdsSig: WritableSignal<number[]> = signal([]);
  public readonly selectedCategoryIds = computed(() => this.selectedCategoryIdsSig());

  public dateRangeStartSig: WritableSignal<string> = signal('');
  public readonly dateRangeStart = computed(() => this.dateRangeStartSig());

  public dateRangeEndSig: WritableSignal<string> = signal('');
  public readonly dateRangeEnd = computed(() => this.dateRangeEndSig());

  private filterStatusSig: WritableSignal<FilterStatus> = signal({
    'DRAFT': true,
    'PUBLISHED': true,
    'CANCELLED': false,
    'COMPLETED': false
  });
  public readonly filterStatus = computed(() => this.filterStatusSig());

  // Statistics Signals
  private totalEventsSig: WritableSignal<number> = signal(0);
  public readonly totalEvents = computed(() => this.totalEventsSig());

  private publishedEventsSig: WritableSignal<number> = signal(0);
  public readonly publishedEvents = computed(() => this.publishedEventsSig());

  private draftEventsSig: WritableSignal<number> = signal(0);
  public readonly draftEvents = computed(() => this.draftEventsSig());

  private upcomingEventsSig: WritableSignal<number> = signal(0);
  public readonly upcomingEvents = computed(() => this.upcomingEventsSig());

  // Search debounce
  private searchSubject = new Subject<string>();

  constructor() {
    // Effect to process events when allEventsSig changes
    effect(() => {
      // Get the current value of allEventsSig
      const events = this.allEventsSig();

      // Only process if we have events
      if (events.length > 0) {
        this.calculateStatistics();
        this.processEvents();
      }
    });
  }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCategories();
    this.loadEvents(true);
  }


  // === Data Loading ===

  loadCategories(): void {
    this.categoryService.loadCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categoriesSig.set(categories);
          this.cdRef.markForCheck()
        },
        error: (error) => {
          console.error('Erreur lors du chargement des catégories:', error);
        }
      });
  }

  loadEvents(forceRefresh: boolean = false): void {
    this.isLoadingSig.set(true);
    this.errorSig.set(null);

    // Trigger the API call to load events
    this.userStructureService.getUserStructureEvents(forceRefresh)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Now we can access the events through the signal
          this.allEventsSig.set(this.userStructureService.userStructureEvents());
          this.isLoadingSig.set(false);
          this.cdRef.markForCheck()
        },
        error: (error) => {
          console.error('Erreur lors du chargement des événements:', error);
          this.errorSig.set("Erreur lors du chargement des événements.");
          this.isLoadingSig.set(false);
          this.cdRef.markForCheck()
        }
      });
  }

  // === Statistics ===

  calculateStatistics(): void {
    const events = this.allEventsSig();
    this.totalEventsSig.set(events.length);
    this.publishedEventsSig.set(events.filter(e => e.status === EventStatus.PUBLISHED).length);
    this.draftEventsSig.set(events.filter(e => e.status === EventStatus.DRAFT).length);
    this.upcomingEventsSig.set(events.filter(e =>
      e.status === EventStatus.PUBLISHED && new Date(e.startDate) > new Date()
    ).length);
  }

  // === Search and Filtering ===

  setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.processEvents();
        this.cdRef.markForCheck();
      });
  }

  onSearchTermChange(): void {
    this.searchSubject.next(this.searchTerm() || '');
  }

  clearSearch(): void {
    this.searchTermSig.set('');
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

  updateFilterStatus(status: string, value: boolean): void {
    const currentFilterStatus = this.filterStatus();
    this.filterStatusSig.set({
      ...currentFilterStatus,
      [status]: value
    });
    this.onStatusFilterChange();
  }

  clearAllFilters(): void {
    this.searchTermSig.set('');
    this.selectedCategoryIdsSig.set([]);
    this.dateRangeStartSig.set('');
    this.dateRangeEndSig.set('');

    this.filterStatusSig.set({
      'DRAFT': true,
      'PUBLISHED': true,
      'CANCELLED': false,
      'COMPLETED': false
    });

    this.processEvents();
  }

  getFormattedEventCategories(event: EventSummaryModel): string {
    if (!event.categories || event.categories.length === 0) {
      return 'Aucune catégorie';
    }
    return event.categories.map(c => c.name).join(', ');
  }

  // === Event Processing ===

  processEvents(): void {
    let events = [...this.allEventsSig()];

    // Convert lowercase status strings to EventStatus enum values
    const filterStatusObj = this.filterStatus();
    const activeStatusFilters = Object.keys(filterStatusObj)
      .filter(status => filterStatusObj[status]).map(status => status as EventStatus);

    console.log(activeStatusFilters);

    if (activeStatusFilters.length > 0) {
      events = events.filter(event => activeStatusFilters.includes(event.status));
    }

    const searchTermValue = this.searchTerm();
    if (searchTermValue) {
      const lowerSearchTerm = searchTermValue.toLowerCase().trim();
      events = events.filter(event =>
        event.name.toLowerCase().includes(lowerSearchTerm) ||
        event.shortDescription?.toLowerCase().includes(lowerSearchTerm) ||
        event.categories?.map(c => c.name).join(' ').toLowerCase().includes(lowerSearchTerm)
      );
    }

    const selectedCategoryIdsValue = this.selectedCategoryIds();
    if (selectedCategoryIdsValue.length > 0) {
      events = events.filter(event =>
        event.categories && event.categories.some(cat => selectedCategoryIdsValue.includes(cat.id))
      );
    }

    const dateRangeStartValue = this.dateRangeStart();
    if (dateRangeStartValue) {
      const startDate = new Date(dateRangeStartValue);
      events = events.filter(event => new Date(event.startDate) >= startDate);
    }

    const dateRangeEndValue = this.dateRangeEnd();
    if (dateRangeEndValue) {
      const endDate = new Date(dateRangeEndValue);
      events = events.filter(event => new Date(event.startDate) <= endDate);
    }

    this.sortEvents(events);

    this.filteredEventsSig.set(events);
    this.totalItemsSig.set(events.length);

    this.currentPageSig.set(0);
    this.updatePaginatedEvents();
  }

  sortEvents(events: EventSummaryModel[]): void {
    const [field, direction] = this.sortOption().split('_');

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
          valueA = a.categories[0]?.name.toLowerCase() || '';
          valueB = b.categories[0]?.name.toLowerCase() || '';
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
    this.currentPageSig.set(event.pageIndex);
    this.pageSizeSig.set(event.pageSize);
    this.updatePaginatedEvents();
  }

  private updatePaginatedEvents(): void {
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    this.paginatedEventsSig.set(this.filteredEvents().slice(startIndex, endIndex));
  }

  // === UI Helpers ===

  // Modifiée pour retourner des classes CSS au lieu des couleurs Material
  getStatusCssClass(status: EventStatus): string {
    switch (status) {
      case EventStatus.PUBLISHED:
        return 'status-published';
      case EventStatus.DRAFT:
        return 'status-draft';
      case EventStatus.CANCELLED:
        return 'status-cancelled';
      case EventStatus.COMPLETED:
        return 'status-completed';
      default:
        return 'status-draft';
    }
  }

  getStatusText(status: EventStatus): string {
    switch (status) {
      case EventStatus.PUBLISHED:
        return 'Publié';
      case EventStatus.DRAFT:
        return 'Brouillon';
      case EventStatus.CANCELLED:
        return 'Annulé';
      case EventStatus.COMPLETED:
        return 'Terminé';
      default:
        return status.toString();
    }
  }

  getStatusIcon(status: EventStatus): string {
    switch (status) {
      case EventStatus.PUBLISHED:
        return 'check_circle';
      case EventStatus.DRAFT:
        return 'edit';
      case EventStatus.CANCELLED:
        return 'cancel';
      case EventStatus.COMPLETED:
        return 'done_all';
      default:
        return 'help';
    }
  }

  formatEventDuration(event: EventSummaryModel): string {
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

  editEvent(event: EventSummaryModel): void {
    this.router.navigate(['/admin/event', event.id, 'edit']);
  }

  deleteEvent(event: EventSummaryModel): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.name}" ?`)) {
      this.isLoadingSig.set(true);
      this.eventService.deleteEvent(event.id!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (success) => {
            if (success) {
              // Forcer le rafraîchissement des événements après suppression
              this.loadEvents(true);
              this.snackBar.open('Événement supprimé avec succès', 'Fermer', {
                duration: 3000
              });
            } else {
              this.isLoadingSig.set(false);
            }
            this.cdRef.markForCheck()
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
              duration: 3000
            });
            this.isLoadingSig.set(false);
            this.cdRef.markForCheck()
          }
        });
    }
  }

  openEventPage(event: EventSummaryModel): void {
    this.router.navigate(['/events', event.id]);
  }

  cancelEvent(event: EventSummaryModel): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler l'événement "${event.name}" ?`)) {
      this.isLoadingSig.set(true);
      this.eventService.updateEventStatus(event.id!, EventStatus.CANCELLED)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updatedEvent) => {
            if (updatedEvent) {
              // Forcer le rafraîchissement des événements après annulation
              this.loadEvents(true);
              this.snackBar.open('Événement annulé avec succès', 'Fermer', {
                duration: 3000
              });
            } else {
              this.isLoadingSig.set(false);
              this.cdRef.markForCheck()
            }
          },
          error: (error) => {
            console.error('Erreur lors de l\'annulation:', error);
            this.snackBar.open('Erreur lors de l\'annulation', 'Fermer', {
              duration: 3000
            });
            this.isLoadingSig.set(false);
          }
        });
    }
  }

  protected readonly EventStatus = EventStatus;
}
