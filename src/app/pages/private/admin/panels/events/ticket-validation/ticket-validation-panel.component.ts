import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';

// Angular Material imports
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatChipsModule} from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatBadgeModule} from '@angular/material/badge';
import {MatDividerModule} from '@angular/material/divider';

// Services
import {TicketService} from '../../../../../../core/services/domain/ticket/ticket.service';
import {EventService} from '../../../../../../core/services/domain/event/event.service';
import {NotificationService} from '../../../../../../core/services/domain/utilities/notification.service';

// Models
import {TicketStatus} from '../../../../../../core/models/tickets/ticket-status.enum';
import {EventModel} from '../../../../../../core/models/event/event.model';

/**
 * Component for validating tickets for an event
 */
@Component({
  selector: 'app-ticket-validation-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTableModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './ticket-validation-panel.component.html',
  styleUrls: ['./ticket-validation-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketValidationPanelComponent implements OnInit, OnDestroy {
  private ticketService = inject(TicketService);
  private eventService = inject(EventService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Event ID from route
  private eventId: number | null = null;

  // Event details
  private eventSig: WritableSignal<EventModel | null> = signal(null);
  public readonly event = this.eventSig;

  // Search and filter
  public searchTermSig: WritableSignal<string> = signal('');
  public readonly searchTerm = this.searchTermSig;

  public selectedStatusSig: WritableSignal<TicketStatus | undefined> = signal(undefined);
  public readonly selectedStatus = this.selectedStatusSig;

  private searchSubject = new Subject<string>();

  // Pagination
  public pageSizeSig: WritableSignal<number> = signal(20);
  public readonly pageSize = this.pageSizeSig;

  public pageSizeOptionsSig: WritableSignal<number[]> = signal([10, 20, 50, 100]);
  public readonly pageSizeOptions = this.pageSizeOptionsSig;

  // Expose ticket service signals
  public readonly tickets = this.ticketService.eventTickets;
  public readonly ticketsTotal = this.ticketService.eventTicketsTotal;
  public readonly ticketsPage = this.ticketService.eventTicketsPage;
  public readonly ticketsPages = this.ticketService.eventTicketsPages;
  public readonly ticketsLoading = this.ticketService.eventTicketsLoading;
  public readonly ticketsStatistics = this.ticketService.eventTicketsStatistics;

  // Table columns
  public displayedColumns: string[] = [
    'participant',
    'ticketId',
    'status',
    'audienceZone',
    'validationTime',
    'actions'
  ];

  // Ticket status enum for template
  public TicketStatus = TicketStatus;

  ngOnInit(): void {
    // Get event ID from route
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const eventId = params.get('eventId');
        if (eventId) {
          this.eventId = +eventId;
          this.loadEventDetails();
          this.loadTickets();
          this.setupSearchDebounce();
          this.subscribeToRealTimeUpdates();
        } else {
          this.notificationService.displayNotification('ID d\'événement manquant', 'error');
          this.router.navigate(['/admin/events']);
        }
      });
  }

  ngOnDestroy(): void {
    this.ticketService.unsubscribeFromEventUpdates();
  }

  /**
   * Loads event details
   */
  private loadEventDetails(): void {
    if (!this.eventId) return;

    this.eventService.getEventById(this.eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event) {
            this.eventSig.set(event);
          } else {
            this.notificationService.displayNotification('Événement non trouvé', 'error');
            this.router.navigate(['/admin/events']);
          }
        },
        error: (error) => {
          console.error('Error loading event details:', error);
          this.notificationService.displayNotification('Erreur lors du chargement des détails de l\'événement', 'error');
          this.router.navigate(['/admin/events']);
        }
      });
  }

  /**
   * Loads tickets for the event
   */
  private loadTickets(): void {
    if (!this.eventId) return;

    this.ticketService.getEventTickets(
      this.eventId,
      this.ticketsPage(),
      this.pageSize(),
      this.selectedStatus(),
      this.searchTerm()
    ).subscribe();
  }

  /**
   * Sets up search debounce
   */
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(searchTerm => {
        this.searchTermSig.set(searchTerm);
        this.loadTickets();
      });
  }

  /**
   * Subscribes to real-time updates
   */
  private subscribeToRealTimeUpdates(): void {
    if (!this.eventId) return;

    try {
      console.log(`Subscribing to real-time updates for event ${this.eventId}`);

      // Subscribe to event updates
      this.ticketService.subscribeToEventUpdates(this.eventId);

      // Check if statistics are available after a reasonable timeout
      setTimeout(() => {
        if (!this.ticketsStatistics()) {
          console.warn('Statistics not available after initialization timeout');
          this.notificationService.displayNotification(
            'Les statistiques en temps réel ne sont pas disponibles. Utilisez le bouton Rafraîchir pour mettre à jour les données.',
            'warning'
          );
        } else {
          console.log('Statistics successfully initialized:', this.ticketsStatistics());
        }
      }, 5000); // 5 seconds should be enough for statistics to be received
    } catch (error) {
      console.warn('Failed to subscribe to real-time updates:', error);
      // Still functional without real-time updates - user can refresh manually
      this.notificationService.displayNotification(
        'Les mises à jour en temps réel ne sont pas disponibles. Utilisez le bouton Rafraîchir pour mettre à jour les données.',
        'warning'
      );
    }
  }

  /**
   * Handles search input
   * @param event The input event
   */
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  /**
   * Clears the search
   */
  clearSearch(): void {
    this.searchTermSig.set('');
    this.searchSubject.next('');
  }

  /**
   * Handles status filter change
   */
  onStatusFilterChange(): void {
    this.loadTickets();
  }

  /**
   * Handles page change
   * @param event The page event
   */
  onPageChange(event: PageEvent): void {
    this.pageSizeSig.set(event.pageSize);
    this.ticketService.getEventTickets(
      this.eventId!,
      event.pageIndex,
      event.pageSize,
      this.selectedStatus(),
      this.searchTerm()
    ).subscribe();
  }

  /**
   * Validates a ticket
   * @param ticketId The ID of the ticket to validate
   */
  validateTicket(ticketId: string): void {
    if (!this.eventId) return;

    this.ticketService.validateEventTicket(this.eventId, ticketId)
      .subscribe();
  }

  /**
   * Gets the CSS class for a ticket status
   * @param status The ticket status
   * @returns The CSS class
   */
  getStatusCssClass(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.VALID:
        return 'status-valid';
      case TicketStatus.USED:
        return 'status-used';
      case TicketStatus.CANCELLED:
        return 'status-cancelled';
      case TicketStatus.EXPIRED:
        return 'status-expired';
      default:
        return '';
    }
  }

  /**
   * Gets the text for a ticket status
   * @param status The ticket status
   * @returns The text
   */
  getStatusText(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.VALID:
        return 'Valide';
      case TicketStatus.USED:
        return 'Utilisé';
      case TicketStatus.CANCELLED:
        return 'Annulé';
      case TicketStatus.EXPIRED:
        return 'Expiré';
      default:
        return 'Inconnu';
    }
  }

  /**
   * Gets the icon for a ticket status
   * @param status The ticket status
   * @returns The icon
   */
  getStatusIcon(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.VALID:
        return 'check_circle';
      case TicketStatus.USED:
        return 'done_all';
      case TicketStatus.CANCELLED:
        return 'cancel';
      case TicketStatus.EXPIRED:
        return 'schedule';
      default:
        return 'help';
    }
  }

  /**
   * Gets the last 8 characters of a ticket ID
   * @param ticketId The ticket ID
   * @returns The last 8 characters
   */
  getShortTicketId(ticketId: string): string {
    return ticketId.length > 8 ? ticketId.substring(ticketId.length - 8) : ticketId;
  }

  /**
   * Refreshes the tickets and statistics
   */
  refreshTickets(): void {
    if (!this.eventId) return;

    console.log('Manually refreshing tickets and statistics');

    // First, load tickets
    this.loadTickets();

    // Then, generate statistics based on the loaded tickets
    // This will update the statistics even if WebSocket is not working
    this.ticketService.getEventTickets(
      this.eventId,
      0,
      1000, // Get a large number of tickets to ensure accurate statistics
      undefined,
      ''
    ).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(response => {
      if (!this.ticketsStatistics()) {
        console.log('Generating statistics from manually refreshed tickets');

        const tickets = response.items || [];
        const totalTickets = tickets.length;
        const scannedTickets = tickets.filter(t => t.status === TicketStatus.USED).length;
        const remainingTickets = tickets.filter(t => t.status === TicketStatus.VALID).length;
        const fillRate = totalTickets > 0 ? (scannedTickets / totalTickets) * 100 : 0;

        // Create statistics
        const stats = {
          eventId: this.eventId!,
          eventName: this.event()?.name || `Event ${this.eventId}`,
          totalTickets,
          scannedTickets,
          remainingTickets,
          fillRate
        };

        // Update statistics
        this.ticketService['eventTicketsStatisticsSig'].set(stats);

        this.notificationService.displayNotification(
          'Les statistiques ont été mises à jour manuellement.',
          'info'
        );
      }
    });
  }

  /**
   * Navigates back to the events list
   */
  goBack(): void {
    this.router.navigate(['/admin/events']);
  }
}
