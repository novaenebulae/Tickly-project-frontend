import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { PublicTicketComponent } from './public-ticket.component';
import { TicketApiService } from '../../../core/services/api/ticket/ticket-api.service';
import { TicketPdfService } from '../../../core/services/domain/ticket/ticket-pdf.service';
import { NotificationService } from '../../../core/services/domain/utilities/notification.service';
import { TicketStatus } from '../../../core/models/tickets/ticket-status.enum';

describe('PublicTicketComponent', () => {
  let component: PublicTicketComponent;
  let fixture: ComponentFixture<PublicTicketComponent>;
  let ticketApiServiceSpy: jasmine.SpyObj<TicketApiService>;
  let ticketPdfServiceSpy: jasmine.SpyObj<TicketPdfService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockTicket = {
    id: 'ticket-123',
    qrCodeValue: 'qr-code-value',
    status: TicketStatus.VALID,
    participant: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    eventSnapshot: {
      eventId: 1,
      name: 'Test Event',
      startDate: '2025-08-01T19:00:00Z',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        zipCode: '12345',
        country: 'Test Country'
      }
    },
    audienceZoneSnapshot: {
      audienceZoneId: 1,
      name: 'VIP Zone',
      seatingType: 'SEATED'
    },
    structureSnapshot: {
      id: 1,
      name: 'Test Structure',
      logoUrl: 'logo-url'
    }
  };

  beforeEach(async () => {
    // Create spies for the services
    ticketApiServiceSpy = jasmine.createSpyObj('TicketApiService', ['getPublicTicketById']);
    ticketPdfServiceSpy = jasmine.createSpyObj('TicketPdfService', ['generateSingleTicketPdf']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['displayNotification']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        PublicTicketComponent
      ],
      providers: [
        { provide: TicketApiService, useValue: ticketApiServiceSpy },
        { provide: TicketPdfService, useValue: ticketPdfServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ ticketId: 'ticket-123' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicTicketComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch ticket and generate PDF on init', () => {
    // Setup the spies to return successful responses
    ticketApiServiceSpy.getPublicTicketById.and.returnValue(of(mockTicket));
    ticketPdfServiceSpy.generateSingleTicketPdf.and.returnValue(of(undefined));

    // Initialize the component
    fixture.detectChanges();

    // Verify the API was called with the correct ticket ID
    expect(ticketApiServiceSpy.getPublicTicketById).toHaveBeenCalledWith('ticket-123');

    // Verify the PDF service was called with the correct data
    expect(ticketPdfServiceSpy.generateSingleTicketPdf).toHaveBeenCalled();

    // Check that the component state is updated correctly
    expect(component.isLoading()).toBeFalse();
    expect(component.isSuccess()).toBeTrue();
    expect(component.ticket()).toEqual(mockTicket);
  });

  it('should handle error when fetching ticket fails', () => {
    // Setup the spy to return an error
    const errorMessage = 'Failed to fetch ticket';
    ticketApiServiceSpy.getPublicTicketById.and.returnValue(throwError(() => new Error(errorMessage)));

    // Initialize the component
    fixture.detectChanges();

    // Verify the API was called
    expect(ticketApiServiceSpy.getPublicTicketById).toHaveBeenCalledWith('ticket-123');

    // Check that the component state is updated correctly
    expect(component.isLoading()).toBeFalse();
    expect(component.isSuccess()).toBeFalse();
    expect(component.errorMessage()).toContain(errorMessage);

    // Verify notification was displayed
    expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(jasmine.any(String), 'error');
  });

  it('should handle error when generating PDF fails', () => {
    // Setup the spies
    ticketApiServiceSpy.getPublicTicketById.and.returnValue(of(mockTicket));
    const errorMessage = 'Failed to generate PDF';
    ticketPdfServiceSpy.generateSingleTicketPdf.and.returnValue(throwError(() => new Error(errorMessage)));

    // Initialize the component
    fixture.detectChanges();

    // Verify the API was called
    expect(ticketApiServiceSpy.getPublicTicketById).toHaveBeenCalledWith('ticket-123');
    expect(ticketPdfServiceSpy.generateSingleTicketPdf).toHaveBeenCalled();

    // Check that the component state is updated correctly
    expect(component.isLoading()).toBeFalse();
    expect(component.isSuccess()).toBeFalse();
    expect(component.errorMessage()).toContain('Erreur lors de la génération du PDF');

    // Verify notification was displayed
    expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(jasmine.any(String), 'error');
  });

  it('should navigate to home when navigateToHome is called', () => {
    component.navigateToHome();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });
});
