import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {UserFavoritesService} from './user-favorites.service';
import {UserApiService} from '../../api/user/user-api.service';
import {AuthService} from './auth.service';
import {NotificationService} from '../utilities/notification.service';
import {of, throwError} from 'rxjs';
import {UserFavoriteStructureModel} from '../../../models/user/user-favorite-structure.model';
import {UserRole} from '../../../models/user/user-role.enum';

describe('UserFavoritesService', () => {
  let service: UserFavoritesService;
  let userApiServiceSpy: jasmine.SpyObj<UserApiService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockUser = {
    userId: 1,
    sub: 'user@example.com',
    role: UserRole.SPECTATOR
  };

  const mockFavorites: UserFavoriteStructureModel[] = [
    {
      id: 1,
      userId: 1,
      structure: {
        id: 101,
        name: 'Test Structure 1',
        types: [{ id: 1, name: 'Concert Hall' }],
        city: 'Paris',
        isActive: true
      },
      addedAt: new Date()
    },
    {
      id: 2,
      userId: 1,
      structure: {
        id: 102,
        name: 'Test Structure 2',
        types: [{ id: 2, name: 'Theater' }],
        city: 'Lyon',
        isActive: true
      },
      addedAt: new Date()
    }
  ];

  beforeEach(() => {
    // Create spy objects
    const userApiSpy = jasmine.createSpyObj('UserApiService', [
      'getUserFavoriteStructures', 'addFavoriteStructure', 'removeFavoriteStructure'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['displayNotification']);

    // Set up default return values
    userApiSpy.getUserFavoriteStructures.and.returnValue(of(mockFavorites));
    userApiSpy.addFavoriteStructure.and.returnValue(of(mockFavorites[0]));
    userApiSpy.removeFavoriteStructure.and.returnValue(of(undefined));
    authSpy.currentUser.and.returnValue(mockUser);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        UserFavoritesService,
        { provide: UserApiService, useValue: userApiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    });

    service = TestBed.inject(UserFavoritesService);
    userApiServiceSpy = TestBed.inject(UserApiService) as jasmine.SpyObj<UserApiService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadFavorites', () => {
    it('should return cached favorites if available and not force refreshing', () => {
      // Manually set favorites in the signal
      (service as any).favoritesSig.set(mockFavorites);
      userApiServiceSpy.getUserFavoriteStructures.calls.reset();

      service.loadFavorites(false).subscribe(favorites => {
        expect(favorites).toEqual(mockFavorites);
        expect(userApiServiceSpy.getUserFavoriteStructures).not.toHaveBeenCalled();
      });
    });

    it('should fetch favorites from API when force refreshing', () => {
      service.loadFavorites(true).subscribe(favorites => {
        expect(favorites).toEqual(mockFavorites);
        expect(userApiServiceSpy.getUserFavoriteStructures).toHaveBeenCalled();
      });
    });

    it('should return empty array if user is not logged in', () => {
      authServiceSpy.currentUser.and.returnValue(null);

      service.loadFavorites().subscribe(favorites => {
        expect(favorites).toEqual([]);
        expect(userApiServiceSpy.getUserFavoriteStructures).not.toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      userApiServiceSpy.getUserFavoriteStructures.and.returnValue(throwError(() => errorResponse));

      service.loadFavorites(true).subscribe(favorites => {
        expect(favorites).toEqual([]);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });
  });

  describe('isFavorite', () => {
    it('should return true if structure is in favorites', () => {
      // Manually set favorites in the signal
      (service as any).favoritesSig.set(mockFavorites);

      expect(service.isFavorite(101)).toBeTrue();
    });

    it('should return false if structure is not in favorites', () => {
      // Manually set favorites in the signal
      (service as any).favoritesSig.set(mockFavorites);

      expect(service.isFavorite(999)).toBeFalse();
    });
  });

  describe('toggleFavorite', () => {
    it('should add structure to favorites if not already a favorite', () => {
      // Manually set favorites in the signal
      (service as any).favoritesSig.set([mockFavorites[0]]);

      const newFavorite = {
        id: 3,
        userId: 1,
        structure: {
          id: 103,
          name: 'Test Structure 3',
          types: [{ id: 3, name: 'Stadium' }],
          city: 'Marseille',
          isActive: true
        },
        addedAt: new Date()
      };

      userApiServiceSpy.addFavoriteStructure.and.returnValue(of(newFavorite));

      service.toggleFavorite(103).subscribe(result => {
        expect(result).toBeTrue();
        expect(userApiServiceSpy.addFavoriteStructure).toHaveBeenCalled();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Structure ajoutée aux favoris.', 'valid'
        );
      });
    });

    it('should remove structure from favorites if already a favorite', () => {
      // Manually set favorites in the signal
      (service as any).favoritesSig.set(mockFavorites);

      service.toggleFavorite(101).subscribe(result => {
        expect(result).toBeFalse();
        expect(userApiServiceSpy.removeFavoriteStructure).toHaveBeenCalledWith(101);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Structure retirée des favoris.', 'info'
        );
      });
    });

    it('should handle API errors when adding a favorite', () => {
      const errorResponse = new Error('API error');
      userApiServiceSpy.addFavoriteStructure.and.returnValue(throwError(() => errorResponse));

      service.toggleFavorite(999).subscribe(result => {
        expect(result).toBeFalse();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          "Impossible d'ajouter aux favoris.", 'error'
        );
      });
    });

    it('should handle API errors when removing a favorite', () => {
      // Manually set favorites in the signal
      (service as any).favoritesSig.set(mockFavorites);

      const errorResponse = new Error('API error');
      userApiServiceSpy.removeFavoriteStructure.and.returnValue(throwError(() => errorResponse));

      service.toggleFavorite(101).subscribe({
        error: error => {
          expect(error).toBeTruthy();
          expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
            "Impossible de retirer des favoris.", 'error'
          );
        }
      });
    });
  });
});
