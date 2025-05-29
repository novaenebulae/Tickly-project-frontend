// src/app/core/services/api/ticketing-api-mock.service.ts

/**
 * @file Provides mock implementations for the Ticketing API service methods.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'; // For generating unique ticket IDs

import { ApiConfigService } from '../api-config.service';
import {
  ReservationRequestDto,
  ReservationConfirmationModel,
} from '../../../models/tickets/reservation.model';
import { TicketModel } from '../../../models/tickets/ticket.model';
import { TicketStatus} from '../../../models/tickets/ticket-status.enum';

// Mock data - We'll need mock events and audience zones for snapshots
// For simplicity, we'll use placeholder snapshots or require them in the DTO for mock.
import { allMockEvents } from '../../../mocks/events/data/event-data.mock';

// You might need mock audience zones too, or construct snapshots manually.

@Injectable({
  providedIn: 'root'
})
export class TicketApiMockService {
  private apiConfig = inject(ApiConfigService);

  // In-memory store for mock tickets (simulates DB)
  private currentMockTickets: TicketModel[] = [];
  private currentUserId = 1; // Simulate a logged-in user

  /**
   * Mock implementation for creating a reservation and issuing tickets.
   * @param reservationDto - DTO containing reservation request details.
   * @returns Observable of a ReservationConfirmationModel.
   */
  mockCreateReservation(reservationDto: ReservationRequestDto): Observable<ReservationConfirmationModel> {
    const endpointContext = 'ticketing/reservations - create';
    this.apiConfig.logApiRequest('MOCK POST', endpointContext, reservationDto);

    if (!reservationDto.eventId || !reservationDto.audienceZoneId || !reservationDto.participants || reservationDto.participants.length === 0) {
      return this.apiConfig.createMockError(400, 'Mock: Missing required fields for reservation (eventId, audienceZoneId, participants).');
    }
    if (reservationDto.participants.length > 4) {
      return this.apiConfig.createMockError(400, 'Mock: Cannot reserve more than 4 tickets at a time.');
    }

    // Simulate fetching event and audience zone details for snapshots
    // In a real app, these would come from a data store or another service call if not in DTO
    const mockEvent = allMockEvents.find(e => e.id === reservationDto.eventId);
    if (!mockEvent) {
      return this.apiConfig.createMockError(404, `Mock: Event with ID ${reservationDto.eventId} not found.`);
    }
    // Assuming mockEvent has an audienceZones array matching our API structure
    const mockAudienceZone = mockEvent.audienceZones?.find((az: any) => az.id === reservationDto.audienceZoneId);
    if (!mockAudienceZone) {
      return this.apiConfig.createMockError(404, `Mock: Audience Zone with ID ${reservationDto.audienceZoneId} not found for event ${reservationDto.eventId}.`);
    }


    const issuedTickets: TicketModel[] = [];
    const now = new Date();

    reservationDto.participants.forEach(participant => {
      const newTicketId = uuidv4();
      const newTicket: TicketModel = {
        id: newTicketId,
        eventId: reservationDto.eventId,
        eventSnapshot: { // Create a snapshot
          name: mockEvent.name,
          startDate: new Date(mockEvent.startDate), // Ensure dates are Date objects
          endDate: new Date(mockEvent.endDate),
          address: mockEvent.address, // Assuming address is an object
          mainPhotoUrl: mockEvent.mainPhotoUrl
        },
        audienceZoneId: reservationDto.audienceZoneId,
        audienceZoneSnapshot: { // Create a snapshot
          name: mockAudienceZone.name,
          seatingType: mockAudienceZone.seatingType
        },
        participantInfo: participant,
        qrCodeData: `TICKET_VALIDATE_URL/${newTicketId}`, // Example QR data
        status: TicketStatus.VALID,
        issuedAt: now,
        bookedByUserId: reservationDto.userId || this.currentUserId,
      };
      issuedTickets.push(newTicket);
      this.currentMockTickets.push(newTicket); // Add to in-memory store
    });

    const confirmation: ReservationConfirmationModel = {
      reservationId: `RES-${uuidv4().substring(0, 8).toUpperCase()}`,
      eventId: reservationDto.eventId,
      userId: reservationDto.userId || this.currentUserId,
      issuedTickets: issuedTickets,
      totalTicketsIssued: issuedTickets.length,
      reservationDate: now,
    };

    return this.apiConfig.createMockResponse(confirmation);
  }

  /**
   * Mock implementation for retrieving tickets for the current user.
   * @returns Observable of an array of TicketModel.
   */
  mockGetMyTickets(): Observable<TicketModel[]> {
    const endpointContext = 'ticketing/tickets/my';
    this.apiConfig.logApiRequest('MOCK GET', endpointContext);

    const userTickets = this.currentMockTickets.filter(
      ticket => ticket.bookedByUserId === this.currentUserId
    );
    return this.apiConfig.createMockResponse(userTickets);
  }

  /**
   * Mock implementation for retrieving details of a specific ticket.
   * @param ticketId - The ID of the ticket.
   * @returns Observable of a TicketModel or an error if not found.
   */
  mockGetTicketById(ticketId: string): Observable<TicketModel> {
    const endpointContext = `ticketing/tickets/byId(${ticketId})`;
    this.apiConfig.logApiRequest('MOCK GET', endpointContext);

    const ticket = this.currentMockTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return this.apiConfig.createMockError(404, `Mock: Ticket with ID ${ticketId} not found.`);
    }
    return this.apiConfig.createMockResponse(ticket);
  }

  /**
   * Mock implementation for validating a ticket (e.g., for scanning at entry).
   * This would typically change the ticket status to USED.
   * @param ticketId - The ID of the ticket to validate.
   * @returns Observable of the updated TicketModel or an error.
   */
  mockValidateTicket(ticketId: string): Observable<TicketModel> {
    const endpointContext = `ticketing/tickets/validate(${ticketId})`;
    this.apiConfig.logApiRequest('MOCK POST', endpointContext);

    const ticketIndex = this.currentMockTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      return this.apiConfig.createMockError(404, `Mock: Ticket with ID ${ticketId} not found for validation.`);
    }

    const ticket = this.currentMockTickets[ticketIndex];
    if (ticket.status === TicketStatus.USED) {
      return this.apiConfig.createMockError(409, `Mock: Ticket ${ticketId} has already been used.`);
    }
    if (ticket.status === TicketStatus.CANCELLED || ticket.status === TicketStatus.EXPIRED) {
      return this.apiConfig.createMockError(400, `Mock: Ticket ${ticketId} is ${ticket.status} and cannot be used.`);
    }

    // Update status to USED
    const updatedTicket = {
      ...ticket,
      status: TicketStatus.USED,
      usedAt: new Date()
    };
    this.currentMockTickets[ticketIndex] = updatedTicket;

    return this.apiConfig.createMockResponse(updatedTicket);
  }
}
