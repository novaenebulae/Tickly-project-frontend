// src/app/core/services/api/ticketing-api.service.ts

/**
 * @file API service for ticketing operations (reservations, ticket management).
 * Handles HTTP requests and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {inject, Injectable} from '@angular/core';
import {HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {ApiConfigService} from '../api-config.service';
import {APP_CONFIG} from '../../../config/app-config';
import {ErrorHandlingService} from '../../error-handling.service';

import {ReservationConfirmationModel, ReservationRequestDto, UserReservationModel} from '../../../models/tickets/reservation.model';
import {TicketModel} from '../../../models/tickets/ticket.model';
import {TicketStatus} from '../../../models/tickets/ticket-status.enum';

/**
 * Interface for paginated response of tickets
 */
export interface PaginatedTicketsResponse {
  items: TicketModel[];
  totalItems: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
}

/**
 * Interface for ticket validation response
 */
export interface TicketValidationResponseDto {
  ticketId: string;
  message: string;
  status: TicketStatus;
  participant?: any;
  validationTimestamp?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TicketApiService {
  private apiConfig = inject(ApiConfigService);
  private http = inject(ApiConfigService).http;
  private errorHandler = inject(ErrorHandlingService);

  /**
   * Creates a new reservation and issues tickets.
   * @param reservationDto - The DTO containing reservation request details.
   * The API is expected to return data mappable to `ReservationConfirmationModel`.
   * @returns An Observable of `ReservationConfirmationModel`.
   */
  createReservation(reservationDto: ReservationRequestDto): Observable<ReservationConfirmationModel> {
    const endpointContext = APP_CONFIG.api.endpoints.ticketing.reservations;

    // if (this.apiConfig.isMockEnabledForDomain('ticketing')) {
    //   return this.mockService.mockCreateReservation(reservationDto);
    // }

    this.apiConfig.logApiRequest('POST', endpointContext, reservationDto);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<ReservationConfirmationModel>(url, reservationDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'createReservation'))
    );
  }

  /**
   * Retrieves reservations and tickets for the currently authenticated user.
   * The API now returns data grouped by reservation.
   * @returns An Observable of an array of `UserReservationModel`.
   */
  getMyReservations(): Observable<UserReservationModel[]> {
    const endpointContext = APP_CONFIG.api.endpoints.ticketing.myReservations;

    // if (this.apiConfig.isMockEnabledForDomain('ticketing')) {
    //   return this.mockService.mockGetMyTickets();
    // }

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    return this.http.get<UserReservationModel[]>(url, { headers }).pipe(
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

    // if (this.apiConfig.isMockEnabledForDomain('ticketing')) {
    //   return this.mockService.mockValidateTicket(ticketId);
    // }

    this.apiConfig.logApiRequest('POST', endpointContext, { ticketId }); // Or empty body
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();
    // The body for validation might be empty or contain specific validation parameters
    return this.http.post<TicketModel>(url, {}, { headers }).pipe( // Assuming POST with empty body
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'validateTicket'))
    );
  }

  /**
   * Retrieves a paginated and filtered list of tickets for a specific event.
   * @param eventId - The ID of the event.
   * @param page - The page number (0-based).
   * @param size - The number of items per page.
   * @param status - Optional filter for ticket status.
   * @param search - Optional search term for participant name, email, or ticket UUID.
   * @returns An Observable of PaginatedTicketsResponse.
   */
  getEventTickets(
    eventId: number | string,
    page: number = 0,
    size: number = 20,
    status?: TicketStatus,
    search?: string
  ): Observable<PaginatedTicketsResponse> {
    const endpointContext = APP_CONFIG.api.endpoints.events.tickets(eventId);

    this.apiConfig.logApiRequest('GET', endpointContext);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }

    if (search) {
      params = params.set('search', search);
    }

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<PaginatedTicketsResponse>(url, { headers, params }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'getEventTickets'))
    );
  }

  /**
   * Validates a specific ticket for an event.
   * @param eventId - The ID of the event.
   * @param ticketId - The ID of the ticket to validate.
   * @returns An Observable of TicketValidationResponseDto.
   */
  validateEventTicket(
    eventId: number | string,
    ticketId: string
  ): Observable<TicketValidationResponseDto> {
    const endpointContext = APP_CONFIG.api.endpoints.events.validateTicket(eventId, ticketId);

    this.apiConfig.logApiRequest('POST', endpointContext);

    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<TicketValidationResponseDto>(url, {}, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'validateEventTicket'))
    );
  }

  /**
   * Retrieves a public ticket by its ID without requiring authentication.
   * This is used for the public ticket page accessible via email links.
   * @param ticketId - The unique ID of the ticket.
   * @returns An Observable of `TicketModel`.
   */
  getPublicTicketById(ticketId: string): Observable<TicketModel> {
    const endpointContext = APP_CONFIG.api.endpoints.ticketing.publicTicketById(ticketId);

    this.apiConfig.logApiRequest('GET', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    // No authentication headers needed for public endpoint
    return this.http.get<TicketModel>(url).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'getPublicTicketById'))
    );
  }

  /**
   * Cancels a reservation.
   * @param reservationId - The ID of the reservation to cancel.
   * @returns An Observable of the updated `TicketModel` with status set to CANCELLED.
   */
  cancelTicket(reservationId: number): Observable<TicketModel> {
    const endpointContext = APP_CONFIG.api.endpoints.ticketing.cancelTicket(reservationId.toString());

    this.apiConfig.logApiRequest('DELETE', endpointContext);
    const url = this.apiConfig.getUrl(endpointContext);
    const headers = this.apiConfig.createHeaders();

    return this.http.delete<TicketModel>(url, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('DELETE', endpointContext, response)),
      catchError(error => this.handleTicketingError(error, 'cancelTicket'))
    );
  }

  /**
   * Handles errors from Ticketing API calls.
   * Uses the centralized ErrorHandlingService to provide consistent error handling.
   * @param error - The HttpErrorResponse.
   * @param context - A string describing the context of the error.
   */
  private handleTicketingError(error: HttpErrorResponse, context: string): Observable<never> {
    // Déterminer le message d'erreur en fonction du statut
    let userMessage: string;

    if (error.status === 404) {
      userMessage = 'Billet ou réservation non trouvé(e).';
    } else if (error.status === 403) {
      userMessage = 'Action non autorisée sur ce billet/cette réservation.';
    } else if (error.status === 400) {
      userMessage = 'Données de réservation ou de billet invalides.';
    } else if (error.status === 409) { // Conflict, e.g., ticket already used, no capacity
      userMessage = error.error?.message || 'Conflit lors de l\'opération de billetterie (ex: plus de places disponibles, billet déjà utilisé).';
    } else {
      // Si aucun cas spécifique n'est trouvé, utiliser le message par défaut du service
      return this.errorHandler.handleHttpError(error, `ticket-${context}`);
    }

    // Utiliser le service d'erreur avec le message personnalisé
    return this.errorHandler.handleGeneralError(userMessage, error, `ticket-${context}`);
  }
}
