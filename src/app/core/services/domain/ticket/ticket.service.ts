/**
 * @file Domain service for managing tickets and reservations.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {computed, effect, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {forkJoin, Observable, of} from 'rxjs';
import {catchError, switchMap, tap} from 'rxjs/operators';

// API Service
import {TicketApiService} from '../../api/ticket/ticket-api.service';

// Domain Services
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from '../user/auth.service';

// Models and DTOs
import {
  ReservationConfirmationModel,
  ReservationRequestDto,
  TicketPdfDataDto,
} from '../../../models/tickets/reservation.model';
import {TicketModel} from '../../../models/tickets/ticket.model';
import {ParticipantInfoModel} from '../../../models/tickets/participant-info.model';
import {TicketPdfService} from './ticket-pdf.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private ticketApi = inject(TicketApiService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private pdfService = inject(TicketPdfService)

  // --- State Management using Signals ---
  private myTicketsSig: WritableSignal<TicketModel[]> = signal([]);
  /**
   * A signal representing the list of tickets belonging to the current authenticated user.
   */
  public readonly myTickets = computed(() => this.myTicketsSig());

  private selectedTicketDetailSig: WritableSignal<TicketModel | null | undefined> = signal(undefined);

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
        tap(fetchedTicket => {
          if (fetchedTicket) {
            const pdfData: TicketPdfDataDto = {
              ...fetchedTicket,
              // Use eventSnapshot data instead of making additional API calls
              structureName: `Structure pour ${fetchedTicket.eventSnapshot.name}`,
              organizerLogoUrl: fetchedTicket.eventSnapshot.mainPhotoUrl,
              termsAndConditions: "Conditions générales: Billet non remboursable, non échangeable. Présentez ce billet à l'entrée."
            };
            return pdfData;
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

    // Use cached ticket data
    const pdfData: TicketPdfDataDto = {
      ...ticket,
      structureName: `Structure pour ${ticket.eventSnapshot.name}`,
      organizerLogoUrl: ticket.eventSnapshot.mainPhotoUrl,
      termsAndConditions: "Conditions générales: Billet non remboursable, non échangeable. Présentez ce billet à l'entrée."
    };

    return of(pdfData);
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
