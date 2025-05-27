// src/app/core/services/api/ticketing-api.service.ts

/**
 * @file API service for ticketing operations (reservations, ticket management).
 * Handles HTTP requests and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from '../api-config.service';
import { TicketApiMockService } from './ticket-api-mock.service';
import { APP_CONFIG } from '../../../config/app-config';

import { ReservationRequestDto, ReservationConfirmationModel } from '../../../models/tickets/reservation.model';
import { TicketModel } from '../../../models/tickets/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;
  private mockService = inject(TicketApiMockService);

  /**
   * Creates a new reservation and issues tickets.
   * @param reservationDto - The DTO containing reservation request details.
   * The API is expected to return data mappable to `ReservationConfirmationModel`.
   * @returns An Observable of `ReservationConfirmationModel`.
   */
  createReservation(reservationDto: ReservationRequestDto): Observable<ReservationConfirmationModel> {
    const endpointContext = APP_CONFIG.api.endpoints.ticketing.reservations;
    this.apiConfig.logApiRequest('POST', endpointContext, reservationDto);

    if (this.apiConfig.isMockEnabledForDomain('ticketing')) {
      return this.mockService.mockCreateReservation(reservationDto);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<ReservationConfirmationModel>(url, reservationDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'createReservation'))
    );
  }

  /**
   * Retrieves tickets for the currently authenticated user.
   * The API is expected to return data mappable to `TicketModel[]`.
   * @returns An Observable of an array of `TicketModel`.
   */
  getMyTickets(): Observable<TicketModel[]> {
    const endpointContext = APP_CONFIG.api.endpoints.ticketing.myTickets;
    this.apiConfig.logApiRequest('GET', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('ticketing')) {
      return this.mockService.mockGetMyTickets();
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<TicketModel[]>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'getMyTickets'))
    );
  }

  /**
   * Retrieves details for a specific ticket by its ID.
   * The API is expected to return data mappable to `TicketModel`.
   * @param ticketId - The unique ID of the ticket.
   * @returns An Observable of `TicketModel`.
   */
  getTicketById(ticketId: string): Observable<TicketModel> {
    const endpointContext = APP_CONFIG.api.endpoints.ticketing.ticketById(ticketId);
    this.apiConfig.logApiRequest('GET', endpointContext);

    if (this.apiConfig.isMockEnabledForDomain('ticketing')) {
      return this.mockService.mockGetTicketById(ticketId);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<TicketModel>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'getTicketById'))
    );
  }

  /**
   * Validates a ticket, typically used for scanning at event entry.
   * The API is expected to return the updated ticket data (e.g., with status 'USED').
   * @param ticketId - The ID of the ticket to validate.
   * @returns An Observable of the updated `TicketModel`.
   */
  validateTicket(ticketId: string): Observable<TicketModel> {
    // Assuming your backend has a specific endpoint for validation, e.g., POST /tickets/{id}/validate
    // Or it could be a PUT to the ticket itself with a status change.
    // Adjust the endpoint and method as per your API design.
    const validateEndpoint = APP_CONFIG.api.endpoints.ticketing.validateTicket || `ticketing/tickets/${ticketId}/validate`;
    const endpointContext = validateEndpoint; // For logging
    this.apiConfig.logApiRequest('POST', endpointContext, { ticketId }); // Or empty body

    if (this.apiConfig.isMockEnabledForDomain('ticketing')) {
      return this.mockService.mockValidateTicket(ticketId);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    // The body for validation might be empty or contain specific validation parameters
    return this.http.post<TicketModel>(url, {}, { headers }).pipe( // Assuming POST with empty body
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'validateTicket'))
    );
  }

  /**
   * Handles errors from Ticketing API calls.
   * @param error - The HttpErrorResponse.
   * @param context - A string describing the context of the error.
   */
  private handleTicketingError(error: HttpErrorResponse, context: string): Observable<never> {
    this.apiConfig.logApiError('TICKETING-API', context, error);
    let userMessage = 'Une erreur est survenue avec le service de billetterie.'; // Message en français

    if (error.status === 404) {
      userMessage = 'Billet ou réservation non trouvé(e).';
    } else if (error.status === 403) {
      userMessage = 'Action non autorisée sur ce billet/cette réservation.';
    } else if (error.status === 400) {
      userMessage = 'Données de réservation ou de billet invalides.';
    } else if (error.status === 409) { // Conflict, e.g., ticket already used, no capacity
      userMessage = error.error?.message || 'Conflit lors de l\'opération de billetterie (ex: plus de places disponibles, billet déjà utilisé).';
    }
    return throwError(() => ({
      status: error.status,
      message: userMessage,
      originalError: error
    }));
  }
}
