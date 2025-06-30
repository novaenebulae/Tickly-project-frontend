/**
 * @file Domain service for managing tickets and reservations.
 * This service encapsulates business logic related to ticketing, composes TicketApiService
 * for API interactions, and manages state/cache for user's tickets.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject, signal, computed, WritableSignal, effect } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';

// API Service
import { TicketApiService } from '../../api/ticket/ticket-api.service'; // Corrected path based on typical structure

// Domain Services
import { NotificationService } from '../utilities/notification.service';
import { AuthService } from '../user/auth.service';
import { EventService } from '../event/event.service'; // For event details if needed for PDF
import { StructureService } from '../structure/structure.service'; // For structure details if needed for PDF

// Models and DTOs
import {
  ReservationRequestDto,
  ReservationConfirmationModel,
  TicketPdfDataDto,
} from '../../../models/tickets/reservation.model';
import { TicketModel } from '../../../models/tickets/ticket.model';
import { ParticipantInfoModel } from '../../../models/tickets/participant-info.model';
import { TicketStatus } from '../../../models/tickets/ticket-status.enum';
import { EventModel } from '../../../models/event/event.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private ticketApi = inject(TicketApiService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private eventService = inject(EventService); // For enriching PDF data
  private structureService = inject(StructureService); // For enriching PDF data

  // --- State Management using Signals ---
  private myTicketsSig: WritableSignal<TicketModel[]> = signal([]);
  /**
   * A signal representing the list of tickets belonging to the current authenticated user.
   */
  public readonly myTickets = computed(() => this.myTicketsSig());

  private selectedTicketDetailSig: WritableSignal<TicketModel | null | undefined> = signal(undefined); // undefined: loading, null: not found
  /**
   * A signal representing the details of a currently selected or viewed ticket.
   */
  public readonly selectedTicketDetail = computed(() => this.selectedTicketDetailSig());

  constructor() {
    // Auto-load user's tickets when they log in or out
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();
      if (isLoggedIn) {
        this.loadMyTickets(true).subscribe(); // Force refresh on login
      } else {
        this.myTicketsSig.set([]);
        this.selectedTicketDetailSig.set(undefined);
      }
    });
  }

  // --- Reservation and Ticket Operations ---

  /**
   * Creates a new reservation for an event.
   * @param eventId - The ID of the event.
   * @param audienceZoneId - The ID of the selected audience zone.
   * @param participants - An array of participant information (1 to 4 participants).
   * @returns An Observable of `ReservationConfirmationModel` or `undefined` on error.
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
      userId: currentUserId // Optional, backend might infer from token
    };

    return this.ticketApi.createReservation(reservationDto).pipe(
      map(apiConfirmation => this.mapApiToReservationConfirmationModel(apiConfirmation)),
      tap(confirmation => {
        if (confirmation) {
          this.notification.displayNotification('Réservation effectuée avec succès ! Vos billets ont été émis.', 'valid');
          // Add new tickets to the beginning of myTicketsSig for immediate UI update
          const currentTickets = this.myTicketsSig();
          this.myTicketsSig.set([...confirmation.issuedTickets, ...currentTickets]);
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
   * Updates the `myTicketsSig` signal.
   * @param forceRefresh - If true, fetches from the API even if tickets are already in the signal.
   * @returns An Observable of `TicketModel[]`.
   */
  loadMyTickets(forceRefresh = false): Observable<TicketModel[]> {
    if (!forceRefresh && this.myTicketsSig().length > 0) {
      return of(this.myTicketsSig());
    }

    return this.ticketApi.getMyTickets().pipe(
      map(apiTickets => apiTickets.map(t => this.mapApiToTicketModel(t))),
      tap(tickets => {
        this.myTicketsSig.set(tickets);
      }),
      catchError(error => {
        this.handleError("Impossible de récupérer vos billets.", error);
        this.myTicketsSig.set([]); // Clear on error
        return of([]);
      })
    );
  }

  /**
   * Retrieves details for a specific ticket by its ID.
   * Updates the `selectedTicketDetailSig` signal.
   * @param ticketId - The unique ID of the ticket.
   * @param forceRefresh - If true, fetches from the API even if the ticket is already cached (e.g., in myTickets).
   * @returns An Observable of `TicketModel` or `undefined` if not found/error.
   */
  getTicketById(ticketId: string, forceRefresh = false): Observable<TicketModel | undefined> {
    this.selectedTicketDetailSig.set(undefined); // Indicate loading

    // Check cache (myTicketsSig) first if not forcing refresh
    if (!forceRefresh) {
      const cachedTicket = this.myTicketsSig().find(t => t.id === ticketId);
      if (cachedTicket) {
        this.selectedTicketDetailSig.set(cachedTicket);
        return of(cachedTicket);
      }
    }

    return this.ticketApi.getTicketById(ticketId).pipe(
      map(apiTicket => this.mapApiToTicketModel(apiTicket)),
      tap(ticket => {
        this.selectedTicketDetailSig.set(ticket || null); // Set to null if API returns undefined/error
        // Optionally update myTicketsSig if this ticket wasn't there or needs update
        if (ticket) {
          const currentTickets = this.myTicketsSig();
          const index = currentTickets.findIndex(t => t.id === ticket.id);
          if (index !== -1) {
            currentTickets[index] = ticket;
            this.myTicketsSig.set([...currentTickets]);
          } else {
            // This case might be rare if getMyTickets is comprehensive
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
   * Validates a ticket (e.g., for scanning at event entry).
   * Updates the status of the ticket in local cache (`myTicketsSig`, `selectedTicketDetailSig`).
   * @param ticketId - The ID of the ticket to validate.
   * @returns An Observable of the updated `TicketModel` or `undefined` on error.
   */
  validateTicket(ticketId: string): Observable<TicketModel | undefined> {
    return this.ticketApi.validateTicket(ticketId).pipe(
      map(apiTicket => this.mapApiToTicketModel(apiTicket)),
      tap(updatedTicket => {
        if (updatedTicket) {
          this.notification.displayNotification(`Billet #${ticketId} validé avec succès. Statut : ${updatedTicket.status}`, 'valid');
          // Update caches
          const currentTickets = this.myTicketsSig();
          const index = currentTickets.findIndex(t => t.id === updatedTicket.id);
          if (index !== -1) {
            currentTickets[index] = updatedTicket;
            this.myTicketsSig.set([...currentTickets]);
          }
          if (this.selectedTicketDetailSig()?.id === updatedTicket.id) {
            this.selectedTicketDetailSig.set(updatedTicket);
          }
        }
      }),
      catchError(error => {
        this.handleError(`Erreur lors de la validation du billet #${ticketId}.`, error);
        return of(undefined);
      })
    );
  }


  // --- PDF Export Preparation ---

  /**
   * Prepares the data required for generating a PDF for a specific ticket.
   * This method fetches additional details like structure name if not in the ticket snapshot.
   * @param ticketId - The ID of the ticket for which to prepare PDF data.
   * @returns An Observable of `TicketPdfDataDto` or `undefined` if an error occurs.
   */
  prepareTicketPdfData(ticketId: string): Observable<TicketPdfDataDto | undefined> {
    return this.getTicketById(ticketId, true).pipe( // Force refresh to get latest ticket data
      switchMap(ticket => {
        if (!ticket) {
          return of(undefined);
        }
        // Enrich with structure name if needed
        return this.eventService.getEventById(ticket.eventId).pipe(
          switchMap(eventDetails => {
            if (!eventDetails || !eventDetails.structure) {
              // If event details or structureId is missing, return ticket data as is
              const pdfData: TicketPdfDataDto = {
                ...ticket,
                // organizerLogoUrl and termsAndConditions would be fetched or configured elsewhere
              };
              return of(pdfData);
            }
            return this.structureService.getStructureById(eventDetails.structure).pipe(
              map(structureDetails => {
                const pdfData: TicketPdfDataDto = {
                  ...ticket,
                  structureName: structureDetails?.name,
                  // Example: Fetch organizer logo from structure or event, or use a default
                  organizerLogoUrl: structureDetails?.logoUrl || eventDetails?.mainPhotoUrl,
                  // Example: Fetch terms from a config or event details
                  termsAndConditions: "Conditions générales: Billet non remboursable, non échangeable. Présentez ce billet à l'entrée."
                };
                return pdfData;
              }),
              catchError(structError => {
                console.error('Error fetching structure details for PDF:', structError);
                // Fallback: return ticket data without structure name if structure fetch fails
                const pdfData: TicketPdfDataDto = { ...ticket };
                return of(pdfData);
              })
            );
          }),
          catchError(eventError => {
            console.error('Error fetching event details for PDF:', eventError);
            // Fallback: return ticket data as is if event fetch fails
            const pdfData: TicketPdfDataDto = { ...ticket };
            return of(pdfData);
          })
        );
      }),
      catchError(error => {
        // Error already handled by getTicketById, just return undefined
        return of(undefined);
      })
    );
  }


  // --- Data Mapping Utilities ---

  private mapApiToTicketModel(apiTicket: any): TicketModel {
    if (!apiTicket) return undefined as any; // Or throw error
    return {
      ...apiTicket,
      issuedAt: new Date(apiTicket.issuedAt),
      usedAt: apiTicket.usedAt ? new Date(apiTicket.usedAt) : undefined,
      eventSnapshot: {
        ...apiTicket.eventSnapshot,
        startDate: new Date(apiTicket.eventSnapshot.startDate),
        endDate: new Date(apiTicket.eventSnapshot.endDate),
      }
      // participantInfo and audienceZoneSnapshot are assumed to match model structure
    } as TicketModel;
  }

  private mapApiToReservationConfirmationModel(apiConfirmation: any): ReservationConfirmationModel {
    if (!apiConfirmation) return undefined as any;
    return {
      ...apiConfirmation,
      reservationDate: new Date(apiConfirmation.reservationDate),
      issuedTickets: (apiConfirmation.issuedTickets || []).map((t: any) => this.mapApiToTicketModel(t))
    } as ReservationConfirmationModel;
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
