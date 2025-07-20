/**
 * @file Domain service for managing tickets and reservations.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {computed, DestroyRef, effect, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {environment} from '../../../../../environments/environment';

// API Service
import {
  PaginatedTicketsResponse,
  TicketApiService,
  TicketValidationResponseDto
} from '../../api/ticket/ticket-api.service';

// Domain Services
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from '../user/auth.service';
import {EventTicketStatisticsDto, WebSocketService} from '../../websocket/websocket.service';

// Models and DTOs
import {
  ReservationConfirmationModel,
  ReservationRequestDto,
  TicketPdfDataDto,
} from '../../../models/tickets/reservation.model';
import {TicketModel} from '../../../models/tickets/ticket.model';
import {ParticipantInfoModel} from '../../../models/tickets/participant-info.model';
import {TicketStatus} from '../../../models/tickets/ticket-status.enum';
import {TicketPdfService} from './ticket-pdf.service';
import {StructureService} from '../structure/structure.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private ticketApi = inject(TicketApiService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private pdfService = inject(TicketPdfService);
  private structureService = inject(StructureService);
  private webSocketService = inject(WebSocketService);
  private destroyRef = inject(DestroyRef);

  // --- State Management using Signals ---
  private myTicketsSig: WritableSignal<TicketModel[]> = signal([]);
  /**
   * A signal representing the list of tickets belonging to the current authenticated user.
   */
  public readonly myTickets = computed(() => this.myTicketsSig());

  private selectedTicketDetailSig: WritableSignal<TicketModel | null | undefined> = signal(undefined);

  // --- Event Tickets Management ---
  private eventTicketsSig: WritableSignal<TicketModel[]> = signal([]);
  /**
   * A signal representing the list of tickets for the current event.
   */
  public readonly eventTickets = computed(() => this.eventTicketsSig());

  private eventTicketsTotalSig: WritableSignal<number> = signal(0);
  /**
   * A signal representing the total number of tickets for the current event.
   */
  public readonly eventTicketsTotal = computed(() => this.eventTicketsTotalSig());

  private eventTicketsPageSig: WritableSignal<number> = signal(0);
  /**
   * A signal representing the current page of tickets for the current event.
   */
  public readonly eventTicketsPage = computed(() => this.eventTicketsPageSig());

  private eventTicketsPagesSig: WritableSignal<number> = signal(0);
  /**
   * A signal representing the total number of pages of tickets for the current event.
   */
  public readonly eventTicketsPages = computed(() => this.eventTicketsPagesSig());

  private eventTicketsLoadingSig: WritableSignal<boolean> = signal(false);
  /**
   * A signal representing whether tickets are currently being loaded for the current event.
   */
  public readonly eventTicketsLoading = computed(() => this.eventTicketsLoadingSig());

  private eventTicketsStatisticsSig: WritableSignal<EventTicketStatisticsDto | undefined> = signal(undefined);
  /**
   * A signal representing the statistics for the current event.
   */
  public readonly eventTicketsStatistics = computed(() => this.eventTicketsStatisticsSig());

  constructor() {
    // Auto-load user's tickets when they log in or out
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();
      if (isLoggedIn) {
        this.loadMyTickets(true)
          .subscribe();
      } else {
        this.myTicketsSig.set([]);
        this.selectedTicketDetailSig.set(undefined);
      }
    });
  }

  // --- Reservation and Ticket Operations ---

  /**
   * Creates a new reservation for an event.
   */
  createReservation(
    eventId: number,
    audienceZoneId: number,
    participants: ParticipantInfoModel[]
  ): Observable<ReservationConfirmationModel | undefined> {
    const currentUserId = this.authService.currentUser()?.userId;

    if (!participants || participants.length === 0 || participants.length > 4) {
      this.notification.displayNotification('Vous devez renseigner entre 1 et 4 participants.', 'error');
      return of(undefined);
    }

    const reservationDto: ReservationRequestDto = {
      eventId,
      audienceZoneId,
      participants,
      userId: currentUserId
    };

    return this.ticketApi.createReservation(reservationDto).pipe(
      tap(confirmation => {
        if (confirmation) {
          this.notification.displayNotification('Réservation effectuée avec succès ! Vos billets ont été émis.', 'valid');
          // Add new tickets to the beginning of myTicketsSig for immediate UI update
          const currentTickets = this.myTicketsSig();
          this.myTicketsSig.set([...confirmation.tickets, ...currentTickets]);
        }
      }),
      catchError(error => {
        this.handleError("Erreur lors de la création de la réservation.", error);
        return of(undefined);
      })
    );
  }

  /**
   * Retrieves the tickets for the currently authenticated user.
   */
  loadMyTickets(forceRefresh = false): Observable<TicketModel[]> {
    if (!forceRefresh && this.myTicketsSig().length > 0) {
      return of(this.myTicketsSig());
    }

    return this.ticketApi.getMyTickets().pipe(
      tap(tickets => {
        this.myTicketsSig.set(tickets);
      }),
      catchError(error => {
        this.handleError("Impossible de récupérer vos billets.", error);
        this.myTicketsSig.set([]);
        return of([]);
      })
    );
  }

  /**
   * Retrieves details for a specific ticket by its ID.
   */
  getTicketById(ticketId: string, forceRefresh = false): Observable<TicketModel | undefined> {
    this.selectedTicketDetailSig.set(undefined);

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedTicket = this.myTicketsSig().find(t => t.id === ticketId);
      if (cachedTicket) {
        this.selectedTicketDetailSig.set(cachedTicket);
        return of(cachedTicket);
      }
    }

    return this.ticketApi.getTicketById(ticketId).pipe(
      tap(ticket => {
        this.selectedTicketDetailSig.set(ticket || null);
        if (ticket) {
          const currentTickets = this.myTicketsSig();
          const index = currentTickets.findIndex(t => t.id === ticket.id);
          if (index !== -1) {
            currentTickets[index] = ticket;
            this.myTicketsSig.set([...currentTickets]);
          } else {
            this.myTicketsSig.set([...currentTickets, ticket]);
          }
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de récupérer les détails du billet #${ticketId}.`, error);
        this.selectedTicketDetailSig.set(null);
        return of(undefined);
      })
    );
  }

  /**
   * Génère et télécharge un PDF pour un billet spécifique
   */
  downloadTicketPdf(ticketId: string): Observable<void> {
    return this.prepareTicketPdfData(ticketId).pipe(
      switchMap(pdfData => {
        if (pdfData) {
          return this.pdfService.generateSingleTicketPdf(pdfData);
        } else {
          this.notification.displayNotification(`Impossible de trouver le billet #${ticketId}.`, 'error');
          return of();
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de générer le PDF pour le billet #${ticketId}.`, error);
        return of();
      })
    );
  }

  /**
   * Génère et télécharge un PDF pour plusieurs billets
   */
  downloadMultipleTicketsPdf(ticketIds: string[]): Observable<void> {
    const pdfDataObservables = ticketIds.map(id => this.prepareTicketPdfData(id));

    return forkJoin(pdfDataObservables).pipe(
      switchMap(pdfDataArray => {
        const validPdfData = pdfDataArray.filter(data => data !== undefined) as TicketPdfDataDto[];

        if (validPdfData.length > 0) {
          return this.pdfService.generateMultipleTicketsPdf(validPdfData);
        } else {
          this.notification.displayNotification('Aucun billet valide trouvé pour la génération PDF.', 'error');
          return of();
        }
      }),
      catchError(error => {
        this.handleError('Erreur lors de la préparation des données PDF.', error);
        return of();
      })
    );
  }

  /**
   * Prepares the data required for generating a PDF for a specific ticket.
   * Uses the eventSnapshot data to avoid additional API calls.
   */
  prepareTicketPdfData(ticketId: string): Observable<TicketPdfDataDto | undefined> {
    const ticket = this.myTicketsSig().find(t => t.id === ticketId);

    if (!ticket) {
      return this.getTicketById(ticketId, true).pipe(
        switchMap(fetchedTicket => {
          if (fetchedTicket) {
            const pdfData: TicketPdfDataDto = {
              ...fetchedTicket,
              // Use structure logo instead of event main photo
              structureName: fetchedTicket.structureSnapshot?.name || `Structure pour ${fetchedTicket.eventSnapshot.name}`,
              organizerLogoUrl: fetchedTicket.structureSnapshot.logoUrl,
              termsAndConditions: "Conditions générales: Billet non remboursable, non échangeable. Présentez ce billet à l'entrée."
            };
            return of(pdfData);
          } else {
            this.notification.displayNotification(`Impossible de trouver le billet #${ticketId}.`, 'error');
            return of(undefined);
          }
        }),
        catchError(error => {
          this.handleError(`Impossible de préparer les données PDF pour le billet #${ticketId}.`, error);
          return of(undefined);
        })
      );
    }

    // Create PDF data for cached ticket
    const pdfData: TicketPdfDataDto = {
      ...ticket,
      structureName: ticket.structureSnapshot?.name || `Structure pour ${ticket.eventSnapshot.name}`,
      organizerLogoUrl: ticket.structureSnapshot.logoUrl,
      termsAndConditions: "Conditions générales: Billet non remboursable, non échangeable. Présentez ce billet à l'entrée."
    };

    return of(pdfData);
  }

  /**
   * Retrieves tickets for a specific event with pagination and filtering.
   * @param eventId The ID of the event
   * @param page The page number (0-based)
   * @param size The number of items per page
   * @param status Optional filter for ticket status
   * @param search Optional search term for participant name, email, or ticket UUID
   * @returns An Observable of the paginated tickets response
   */
  getEventTickets(
    eventId: number | string,
    page: number = 0,
    size: number = 20,
    status?: TicketStatus,
    search?: string
  ): Observable<PaginatedTicketsResponse> {
    this.eventTicketsLoadingSig.set(true);

    return this.ticketApi.getEventTickets(eventId, page, size, status, search).pipe(
      tap(response => {
        try {
          // Log the response structure to help diagnose any future issues
          if (environment.enableDebugLogs) {
            console.debug('Event tickets response structure:', Object.keys(response));
          }

          // Check if the response has the expected properties
          if (!response.items) {
            console.warn('API response missing items property:', response);
          }

          this.eventTicketsSig.set(response.items || []);
          this.eventTicketsTotalSig.set(response.totalItems || 0);
          this.eventTicketsPageSig.set(response.currentPage || 0);
          this.eventTicketsPagesSig.set(response.totalPages || 0);
          this.eventTicketsLoadingSig.set(false);
        } catch (error) {
          console.error('Error processing ticket response:', error);
          // Set default values to prevent UI errors
          this.eventTicketsSig.set([]);
          this.eventTicketsTotalSig.set(0);
          this.eventTicketsPageSig.set(0);
          this.eventTicketsPagesSig.set(0);
          this.eventTicketsLoadingSig.set(false);
          // Show notification to the user
          this.notification.displayNotification('Erreur lors du traitement des données de billets.', 'error');
        }
      }),
      catchError(error => {
        this.handleError("Impossible de récupérer les billets pour cet événement.", error);
        this.eventTicketsLoadingSig.set(false);
        return of({
          items: [],
          totalItems: 0,
          totalPages: 0,
          pageSize: size,
          currentPage: 0
        });
      })
    );
  }

  /**
   * Validates a ticket for a specific event.
   * @param eventId The ID of the event
   * @param ticketId The ID of the ticket to validate
   * @returns An Observable of the validation response
   */
  validateEventTicket(
    eventId: number | string,
    ticketId: string
  ): Observable<TicketValidationResponseDto | undefined> {
    return this.ticketApi.validateEventTicket(eventId, ticketId).pipe(
      tap(response => {
        this.notification.displayNotification(
          `Billet validé avec succès. Nouveau statut: ${response.status}`,
          'valid'
        );

        // Update the ticket in the list if it exists
        const currentTickets = this.eventTicketsSig();
        const index = currentTickets.findIndex(t => t.id === ticketId);
        if (index !== -1) {
          // Ensure the status is a valid TicketStatus enum value
          let validStatus: TicketStatus;
          if (Object.values(TicketStatus).includes(response.status as TicketStatus)) {
            validStatus = response.status as TicketStatus;
          } else {
            console.warn(`Received unknown ticket status: ${response.status}, defaulting to USED`);
            validStatus = TicketStatus.USED;
          }

          const updatedTicket = { ...currentTickets[index], status: validStatus };
          currentTickets[index] = updatedTicket;
          this.eventTicketsSig.set([...currentTickets]);
        }
      }),
      catchError(error => {
        this.handleError(`Impossible de valider le billet #${ticketId}.`, error);
        return of(undefined);
      })
    );
  }

  /**
   * Subscribes to real-time updates for tickets and statistics for a specific event.
   * @param eventId The ID of the event
   */
  subscribeToEventUpdates(eventId: number | string): void {
    // Subscribe to ticket updates
    this.webSocketService.subscribeToTicketUpdates(eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(updatedTicket => {
        console.log('Received ticket update:', updatedTicket);
        // Update the ticket in the list if it exists
        const currentTickets = this.eventTicketsSig();
        const index = currentTickets.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
          currentTickets[index] = updatedTicket;
          this.eventTicketsSig.set([...currentTickets]);
        }
      });

    // Subscribe to statistics updates
    this.webSocketService.subscribeToStatisticsUpdates(eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(statistics => {
        console.log('Received statistics update:', statistics);
        this.eventTicketsStatisticsSig.set(statistics);
      });

    // Set a timeout to generate fallback statistics if no statistics are received within 3 seconds
    setTimeout(() => {
      if (!this.eventTicketsStatisticsSig()) {
        console.log('No statistics received after timeout, generating fallback statistics');
        this.generateFallbackStatistics(eventId);
      }
    }, 3000);
  }

  /**
   * Generates fallback statistics based on the current tickets
   * @param eventId The ID of the event
   */
  private generateFallbackStatistics(eventId: number | string): void {
    // Double-check that we still don't have statistics
    if (this.eventTicketsStatisticsSig()) {
      console.log('Statistics already available, skipping fallback generation');
      return;
    }

    console.log('Generating fallback statistics for event', eventId);

    // Get the current tickets
    this.getEventTickets(eventId).pipe(
      tap(response => {
        // Triple-check that we still don't have statistics before setting fallback
        if (!this.eventTicketsStatisticsSig()) {
          const tickets = response.items || [];
          const totalTickets = tickets.length;
          const scannedTickets = tickets.filter(t => t.status === TicketStatus.USED).length;
          const remainingTickets = tickets.filter(t => t.status === TicketStatus.VALID).length;
          const fillRate = totalTickets > 0 ? (scannedTickets / totalTickets) * 100 : 0;

          // Create fallback statistics
          const fallbackStats: EventTicketStatisticsDto = {
            eventId: typeof eventId === 'string' ? parseInt(eventId, 10) : eventId,
            eventName: tickets.length > 0 ? tickets[0].eventSnapshot.name : `Event ${eventId}`,
            totalTickets,
            scannedTickets,
            remainingTickets,
            fillRate
          };

          console.info('Using fallback statistics generated from ticket data:', fallbackStats);

          // Set the fallback statistics
          this.eventTicketsStatisticsSig.set(fallbackStats);
        } else {
          console.log('Statistics became available while fetching tickets, skipping fallback generation');
        }
      }),
      catchError(error => {
        console.error('Error generating fallback statistics:', error);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Unsubscribes from real-time updates for a specific event.
   */
  unsubscribeFromEventUpdates(): void {
    this.webSocketService.disconnect();
  }

  /**
   * Centralized error handler for ticketing-related operations.
   */
  private handleError(userMessage: string, error: any): void {
    console.error(`TicketService Error: ${userMessage}`, error.originalError || error);
    this.notification.displayNotification(
      error.message || userMessage,
      'error'
    );
  }
}
