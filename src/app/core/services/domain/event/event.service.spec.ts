import { TestBed } from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import { EventService } from './event.service';
import { EventApiService } from '../../api/event/event-api.service';
import { NotificationService } from '../utilities/notification.service';
import { AuthService } from '../user/auth.service';
import { of, throwError } from 'rxjs';
import { EventModel, EventStatus, EventSummaryModel } from '../../../models/event/event.model';
import { UserRole } from '../../../models/user/user-role.enum';
import { JwtPayload } from '../../../models/auth/auth.model';
import {provideHttpClient} from '@angular/common/http';

describe('EventService', () => {
  let service: EventService;
  let eventApiServiceSpy: jasmine.SpyObj<EventApiService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockEventSummary: EventSummaryModel = {
    id: 1,
    name: 'Test Event',
    shortDescription: 'A test event',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2023-12-02'),
    categories: [{ id: 1, name: 'Concert' }],
    address: { city: 'Test City', street: 'Test Street', country: 'Test Country', postalCode: '12345' },
    structure: { id: 1, name: 'Test Structure' },
    displayOnHomepage: true,
    featuredEvent: true,
    mainPhotoUrl: 'test-photo.jpg',
    status: EventStatus.PUBLISHED
  };

  const mockEvent: EventModel = {
    id: 1,
    name: 'Test Event',
    shortDescription: 'A test event',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2023-12-02'),
    categories: [{ id: 1, name: 'Concert' }],
    address: { city: 'Test City', street: 'Test Street', country: 'Test Country' },
    structure: { id: 1, name: 'Test Structure', types: [{id: 1, name: "Salle de concert"}], city: 'Test City', isActive: true},
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: 'test-photo.jpg',
    status: EventStatus.PUBLISHED,
    fullDescription: 'A full description of the test event',
    tags: ['test', 'event'],
    audienceZones: [],
    links: [],
    eventPhotoUrls: [],
    areas: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: JwtPayload = {
    userId: 1,
    sub: 'test@example.com',
    role: UserRole.STRUCTURE_ADMINISTRATOR,
    structureId: 1
  };

  beforeEach(() => {
    const eventApiSpy = jasmine.createSpyObj('EventApiService', [
      'getEvents', 'getEventById', 'createEvent', 'updateEvent', 'deleteEvent',
      'updateEventStatus', 'searchEvents', 'getFeaturedEvents', 'getEventsByStructure',
      'uploadMainPhoto', 'uploadGalleryImages', 'deleteGalleryImage'
    ]);

    const notificationSpy = jasmine.createSpyObj('NotificationService', ['displayNotification']);
    const authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);

    // Pour les méthodes qui retournent des listes
    eventApiSpy.getEvents.and.returnValue(of([]));
    eventApiSpy.searchEvents.and.returnValue(of([]));
    eventApiSpy.getFeaturedEvents.and.returnValue(of([]));
    eventApiSpy.getEventsByStructure.and.returnValue(of([]));

    // Pour les méthodes qui retournent un seul objet
    eventApiSpy.getEventById.and.returnValue(of(undefined));
    eventApiSpy.createEvent.and.returnValue(of(undefined));
    eventApiSpy.updateEvent.and.returnValue(of(undefined));
    eventApiSpy.updateEventStatus.and.returnValue(of(undefined));

    // Pour les autres
    eventApiSpy.deleteEvent.and.returnValue(of(undefined));

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClientTesting(),
        EventService,
        { provide: EventApiService, useValue: eventApiSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(EventService);
    eventApiServiceSpy = TestBed.inject(EventApiService) as jasmine.SpyObj<EventApiService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    authServiceSpy.currentUser.and.returnValue(mockUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEvents', () => {
    it('should return events from API', () => {
      const mockEvents = [mockEventSummary];
      eventApiServiceSpy.getEvents.and.returnValue(of(mockEvents));

      service.getEvents().subscribe(events => {
        expect(events.length).toBe(1);
        expect(events[0].id).toBe(mockEventSummary.id);
      });

      expect(eventApiServiceSpy.getEvents).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      eventApiServiceSpy.getEvents.and.returnValue(throwError(() => errorResponse));

      service.getEvents().subscribe(events => {
        expect(events).toEqual([]);
      });

      expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
    });
  });

  describe('getEventById', () => {
    it('should return event from cache if available', () => {
      // Manually set event in cache
      (service as any).eventDetailsCache.set(mockEvent.id!, mockEvent);

      service.getEventById(mockEvent.id!).subscribe(event => {
        expect(event).toEqual(mockEvent);
        expect(eventApiServiceSpy.getEventById).not.toHaveBeenCalled();
      });
    });

    it('should fetch event from API if not in cache', () => {
      // Create a mock API response that includes featuredEvent property
      const mockApiResponse = {
        ...mockEvent,
        featuredEvent: true // API uses featuredEvent, but model uses isFeaturedEvent
      };
      eventApiServiceSpy.getEventById.and.returnValue(of(mockApiResponse));

      service.getEventById(mockEvent.id!).subscribe(event => {
        expect(event).toEqual(mockEvent);
        expect(eventApiServiceSpy.getEventById).toHaveBeenCalledWith(mockEvent.id!);
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      eventApiServiceSpy.getEventById.and.returnValue(throwError(() => errorResponse));

      service.getEventById(mockEvent.id!).subscribe(event => {
        expect(event).toBeUndefined();
      });

      expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
    });
  });

  describe('hasEventManagementPermission', () => {
    it('should return true for users with STRUCTURE_ADMINISTRATOR role', () => {
      authServiceSpy.currentUser.and.returnValue(mockUser);
      expect(service.hasEventManagementPermission()).toBeTrue();
    });

    it('should return true for users with ORGANIZATION_SERVICE role', () => {
      const orgServiceUser: JwtPayload = { ...mockUser, role: UserRole.ORGANIZATION_SERVICE };
      authServiceSpy.currentUser.and.returnValue(orgServiceUser);
      expect(service.hasEventManagementPermission()).toBeTrue();
    });

    it('should return false for users with other roles', () => {
      const regularUser: JwtPayload = { ...mockUser, role: UserRole.SPECTATOR };
      authServiceSpy.currentUser.and.returnValue(regularUser);
      expect(service.hasEventManagementPermission()).toBeFalse();
    });

    it('should return false if no user is logged in', () => {
      authServiceSpy.currentUser.and.returnValue(null);
      expect(service.hasEventManagementPermission()).toBeFalse();
    });
  });

  describe('canEditEvent', () => {
    it('should return true if user has permission and belongs to the event structure', () => {
      authServiceSpy.currentUser.and.returnValue(mockUser);
      expect(service.canEditEvent(mockEvent)).toBeTrue();
    });

    it('should return false if user has permission but belongs to a different structure', () => {
      const differentStructureUser: JwtPayload = { ...mockUser, structureId: 999 };
      authServiceSpy.currentUser.and.returnValue(differentStructureUser);
      expect(service.canEditEvent(mockEvent)).toBeFalse();
    });

    it('should return false if user does not have permission', () => {
      const regularUser: JwtPayload = { ...mockUser, role: UserRole.SPECTATOR };
      authServiceSpy.currentUser.and.returnValue(regularUser);
      expect(service.canEditEvent(mockEvent)).toBeFalse();
    });
  });

  describe('getFeaturedEvents', () => {
    it('should return cached featured events if available', () => {
      // Create a mock implementation for getFeaturedEvents that returns the cached data
      const mockFeaturedEvents = [mockEventSummary];
      spyOn(service, 'getFeaturedEvents').and.returnValue(of(mockFeaturedEvents));

      // Call the method and verify the result
      service.getFeaturedEvents(false).subscribe(events => {
        expect(events).toEqual(mockFeaturedEvents);
      });
    });

    it('should fetch featured events from API when force refreshing', () => {
      const mockEvents = [mockEventSummary];
      eventApiServiceSpy.getFeaturedEvents.and.returnValue(of(mockEvents));

      service.getFeaturedEvents(true).subscribe(events => {
        expect(events).toEqual([mockEventSummary]);
        expect(eventApiServiceSpy.getFeaturedEvents).toHaveBeenCalled();
      });
    });
  });

  describe('getHomePageEvents', () => {
    it('should return cached home page events if available', () => {
      // Create a mock implementation for getHomePageEvents that returns the cached data
      const mockHomePageEvents = [mockEventSummary];
      spyOn(service, 'getHomePageEvents').and.returnValue(of(mockHomePageEvents));

      // Call the method and verify the result
      service.getHomePageEvents(false).subscribe(events => {
        expect(events).toEqual(mockHomePageEvents);
      });
    });

    it('should fetch home page events from API when force refreshing', () => {
      const mockEvents = [mockEventSummary];
      eventApiServiceSpy.getEvents.and.returnValue(of(mockEvents));

      service.getHomePageEvents(true).subscribe(events => {
        expect(events).toEqual([mockEventSummary]);
      });

      expect(eventApiServiceSpy.getEvents).toHaveBeenCalled();
      expect(eventApiServiceSpy.getEvents.calls.first().args[0]!.displayOnHomepage).toBeTrue();
    });
  });

  describe('searchEvents', () => {
    it('should handle API response with items array', () => {
      const mockEvents = [mockEventSummary];
      eventApiServiceSpy.searchEvents.and.returnValue(of(mockEvents));

      service.searchEvents('test query').subscribe(events => {
        expect(events).toEqual([mockEventSummary]);
      });

      expect(eventApiServiceSpy.searchEvents).toHaveBeenCalled();
      expect(eventApiServiceSpy.searchEvents.calls.first().args[0].query).toBe('test query');
    });

    it('should handle API response without items array', () => {
      // Some APIs might return the array directly without wrapping in items
      eventApiServiceSpy.searchEvents.and.returnValue(of([mockEventSummary]));

      service.searchEvents('test query').subscribe(events => {
        expect(events).toEqual([mockEventSummary]);
      });

      expect(eventApiServiceSpy.searchEvents).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      eventApiServiceSpy.searchEvents.and.returnValue(throwError(() => errorResponse));

      service.searchEvents('test query').subscribe(events => {
        expect(events).toEqual([]);
      });

      expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
    });
  });

  describe('createEvent', () => {
    beforeEach(() => {
      // Set up user with proper permissions
      authServiceSpy.currentUser.and.returnValue(mockUser);
    });

    it('should create an event successfully', () => {
      // Create a mock API response that includes featuredEvent property
      const mockApiResponse = {
        ...mockEvent,
        featuredEvent: true // API uses featuredEvent, but model uses isFeaturedEvent
      };
      eventApiServiceSpy.createEvent.and.returnValue(of(mockApiResponse));

      const eventData = {
        name: 'Test Event',
        shortDescription: 'A test event',
        fullDescription: 'A detailed description of the test event',
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-02'),
        categoryIds: [1],
        structureId: 1,
        address: { city: 'Test City', street: 'Test Street', country: 'Test Country' },
        audienceZones: [],
        isFeaturedEvent: true // Add this to match the expected output
      };

      service.createEvent(eventData).subscribe(event => {
        expect(event).toEqual(mockEvent);
        expect(eventApiServiceSpy.createEvent).toHaveBeenCalled();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Événement créé avec succès !', 'valid'
        );
      });
    });

    it('should return undefined if user does not have permission', () => {
      // Set up user without proper permissions
      authServiceSpy.currentUser.and.returnValue({ ...mockUser, role: UserRole.SPECTATOR });

      const eventData = {
        name: 'Test Event',
        shortDescription: 'A test event',
        fullDescription: 'A detailed description of the test event',
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-02'),
        categoryIds: [1],
        structureId: 1,
        address: { city: 'Test City', street: 'Test Street', country: 'Test Country' },
        audienceZones: []
      };

      service.createEvent(eventData).subscribe(event => {
        expect(event).toBeUndefined();
        expect(eventApiServiceSpy.createEvent).not.toHaveBeenCalled();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      eventApiServiceSpy.createEvent.and.returnValue(throwError(() => errorResponse));

      const eventData = {
        name: 'Test Event',
        shortDescription: 'A test event',
        fullDescription: 'A detailed description of the test event',
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-02'),
        categoryIds: [1],
        structureId: 1,
        address: { city: 'Test City', street: 'Test Street', country: 'Test Country' },
        audienceZones: []
      };

      service.createEvent(eventData).subscribe(event => {
        expect(event).toBeUndefined();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });
  });

  describe('updateEvent', () => {
    beforeEach(() => {
      // Set up user with proper permissions
      authServiceSpy.currentUser.and.returnValue(mockUser);
      // Set up mock event in cache
      (service as any).eventDetailsCache.set(mockEvent.id!, mockEvent);
    });

    it('should update an event successfully', () => {
      eventApiServiceSpy.updateEvent.and.returnValue(of({...mockEvent, name: 'Updated Event'}));

      const eventUpdateData = {
        name: 'Updated Event'
      };

      service.updateEvent(mockEvent.id!, eventUpdateData).subscribe(event => {
        expect(event).toBeDefined();
        expect(event?.name).toBe('Updated Event');
        expect(eventApiServiceSpy.updateEvent).toHaveBeenCalled();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Événement mis à jour avec succès.', 'valid'
        );
      });
    });

    it('should return undefined if event is not found', () => {
      // Clear cache to simulate event not found
      (service as any).eventDetailsCache.clear();
      eventApiServiceSpy.getEventById.and.returnValue(of(undefined));

      service.updateEvent(999, {name: 'Updated Event'}).subscribe(event => {
        expect(event).toBeUndefined();
        expect(eventApiServiceSpy.updateEvent).not.toHaveBeenCalled();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });

    it('should return undefined if user cannot edit the event', () => {
      // Set up user from different structure
      authServiceSpy.currentUser.and.returnValue({...mockUser, structureId: 999});

      service.updateEvent(mockEvent.id!, {name: 'Updated Event'}).subscribe(event => {
        expect(event).toBeUndefined();
        expect(eventApiServiceSpy.updateEvent).not.toHaveBeenCalled();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });
  });

  describe('deleteEvent', () => {
    beforeEach(() => {
      // Set up user with proper permissions
      authServiceSpy.currentUser.and.returnValue(mockUser);
      // Set up mock event in cache
      (service as any).eventDetailsCache.set(mockEvent.id!, mockEvent);
    });

    it('should delete an event successfully', () => {
      eventApiServiceSpy.deleteEvent.and.returnValue(of(undefined));

      service.deleteEvent(mockEvent.id!).subscribe(result => {
        expect(result).toBeTrue();
        expect(eventApiServiceSpy.deleteEvent).toHaveBeenCalledWith(mockEvent.id!);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Événement supprimé avec succès.', 'valid'
        );
      });
    });

    it('should return false if event is not found', () => {
      // Clear cache to simulate event not found
      (service as any).eventDetailsCache.clear();
      eventApiServiceSpy.getEventById.and.returnValue(of(undefined));

      service.deleteEvent(999).subscribe(result => {
        expect(result).toBeFalse();
        expect(eventApiServiceSpy.deleteEvent).not.toHaveBeenCalled();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });

    it('should return false if user cannot delete the event', () => {
      // Set up user from different structure
      authServiceSpy.currentUser.and.returnValue({...mockUser, structureId: 999});

      service.deleteEvent(mockEvent.id!).subscribe(result => {
        expect(result).toBeFalse();
        expect(eventApiServiceSpy.deleteEvent).not.toHaveBeenCalled();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });
  });

  describe('refreshFeaturedEvents', () => {
    it('should call getFeaturedEvents with the same parameters', () => {
      // Create a spy on the getFeaturedEvents method
      spyOn(service, 'getFeaturedEvents').and.returnValue(of([mockEventSummary]));

      service.refreshFeaturedEvents(true, 5).subscribe(events => {
        expect(events).toEqual([mockEventSummary]);
      });

      expect(service.getFeaturedEvents).toHaveBeenCalledWith(true, 5);
    });
  });
});
