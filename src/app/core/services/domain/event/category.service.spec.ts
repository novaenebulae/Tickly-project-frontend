import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {CategoryService} from './category.service';
import {EventApiService} from '../../api/event/event-api.service';
import {NotificationService} from '../utilities/notification.service';
import {of, throwError} from 'rxjs';
import {EventCategoryModel} from '../../../models/event/event-category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let eventApiServiceSpy: jasmine.SpyObj<EventApiService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockCategories: EventCategoryModel[] = [
    { id: 1, name: 'Concert' },
    { id: 2, name: 'Festival' },
    { id: 3, name: 'Exhibition' }
  ];

  beforeEach(() => {
    const eventApiSpy = jasmine.createSpyObj('EventApiService', ['getEventCategories']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['displayNotification']);

    eventApiSpy.getEventCategories.and.returnValue(of(mockCategories));

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClientTesting(),
        CategoryService,
        { provide: EventApiService, useValue: eventApiSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    });

    service = TestBed.inject(CategoryService);
    eventApiServiceSpy = TestBed.inject(EventApiService) as jasmine.SpyObj<EventApiService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadCategories', () => {
    it('should return cached categories if available and not force refreshing', () => {
      // Manually set categories in the signal
      (service as any).categoriesSig.set(mockCategories);
      eventApiServiceSpy.getEventCategories.calls.reset();
      service.loadCategories(false).subscribe(categories => {
        expect(categories).toEqual(mockCategories);
        expect(eventApiServiceSpy.getEventCategories).not.toHaveBeenCalled();
      });
    });

    it('should fetch categories from API when force refreshing', () => {
      eventApiServiceSpy.getEventCategories.and.returnValue(of(mockCategories));

      service.loadCategories(true).subscribe(categories => {
        expect(categories).toEqual(mockCategories);
        expect(eventApiServiceSpy.getEventCategories).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      eventApiServiceSpy.getEventCategories.and.returnValue(throwError(() => errorResponse));

      service.loadCategories(true).subscribe({
        next: categories => {
          expect(categories).toEqual([]);
        },
        error: () => fail('should not propagate error')
      });

      expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
    });
  });

  describe('categories signal', () => {
    it('should emit the current categories', () => {
      (service as any).categoriesSig.set(mockCategories);
      expect(service.categories()).toEqual(mockCategories);
    });
  });

  describe('isLoading signal', () => {
    it('should reflect the loading state', () => {
      (service as any).isLoadingSig.set(true);
      expect(service.isLoading()).toBeTrue();

      (service as any).isLoadingSig.set(false);
      expect(service.isLoading()).toBeFalse();
    });
  });
});
