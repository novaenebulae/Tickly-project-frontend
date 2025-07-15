import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { UserApiService } from '../../api/user/user-api.service';
import { AuthService } from './auth.service';
import { NotificationService } from '../utilities/notification.service';
import { of, throwError } from 'rxjs';
import { UserModel } from '../../../models/user/user.model';
import { UserProfileUpdateDto } from '../../../models/user/user-profile-update.dto';
import { UserRole } from '../../../models/user/user-role.enum';
import { HttpErrorResponse } from '@angular/common/http';

describe('UserService', () => {
  let service: UserService;
  let userApiServiceSpy: jasmine.SpyObj<UserApiService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockUser: UserModel = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@example.com',
    role: UserRole.SPECTATOR,
    createdAt: new Date(),
    updatedAt: new Date(),
    avatarUrl: 'avatar.jpg'
  };

  const mockAuthUser = {
    userId: 1,
    sub: 'user@example.com',
    role: UserRole.SPECTATOR,
  };

  beforeEach(() => {
    const userApiSpy = jasmine.createSpyObj('UserApiService', [
      'getCurrentUserProfile', 'updateCurrentUserProfile', 'uploadAvatar',
      'requestAccountDeletion', 'confirmAccountDeletion'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['displayNotification']);

    userApiSpy.getCurrentUserProfile.and.returnValue(of(mockUser));
    userApiSpy.updateCurrentUserProfile.and.returnValue(of(mockUser));
    userApiSpy.uploadAvatar.and.returnValue(of({ fileUrl: 'new-avatar.jpg', message: 'Avatar mis à jour avec succès.' }));
    userApiSpy.requestAccountDeletion.and.returnValue(of(undefined));
    userApiSpy.confirmAccountDeletion.and.returnValue(of(undefined));
    authSpy.currentUser.and.returnValue(mockAuthUser);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        UserService,
        { provide: UserApiService, useValue: userApiSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    });

    service = TestBed.inject(UserService);
    userApiServiceSpy = TestBed.inject(UserApiService) as jasmine.SpyObj<UserApiService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentUserProfile', () => {
    it('should return cached profile if available and not force refreshing', () => {
      // 👇 CORRECTION : Le nom du signal était incorrect.
      (service as any).currentUserProfileDataSig.set(mockUser);
      userApiServiceSpy.getCurrentUserProfile.calls.reset();

      service.getCurrentUserProfile(false).subscribe(profile => {
        expect(profile).toEqual(mockUser);
        expect(userApiServiceSpy.getCurrentUserProfile).not.toHaveBeenCalled();
      });
    });

    it('should fetch profile from API when force refreshing', () => {
      service.getCurrentUserProfile(true).subscribe(profile => {
        expect(profile).toEqual(mockUser);
        expect(userApiServiceSpy.getCurrentUserProfile).toHaveBeenCalled();
      });
    });

    it('should return undefined if user is not logged in', () => {
      authServiceSpy.currentUser.and.returnValue(null);

      service.getCurrentUserProfile().subscribe(profile => {
        // 👇 CORRECTION : La méthode retourne `of(undefined)` dans ce cas, pas `null`.
        expect(profile).toBeUndefined();
        expect(userApiServiceSpy.getCurrentUserProfile).not.toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      userApiServiceSpy.getCurrentUserProfile.and.returnValue(throwError(() => errorResponse));

      service.getCurrentUserProfile(true).subscribe(profile => {
        // 👇 CORRECTION : Le `catchError` retourne `of(undefined)`, pas `null`.
        expect(profile).toBeUndefined();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });
  });

  describe('updateCurrentUserProfile', () => {
    it('should update user profile successfully', () => {
      const updateDto: UserProfileUpdateDto = { firstName: 'Updated', lastName: 'Name' };
      const updatedUser = { ...mockUser, firstName: 'Updated', lastName: 'Name' };
      userApiServiceSpy.updateCurrentUserProfile.and.returnValue(of(updatedUser));

      service.updateCurrentUserProfile(updateDto).subscribe(profile => {
        expect(profile).toEqual(updatedUser);
        expect(userApiServiceSpy.updateCurrentUserProfile).toHaveBeenCalledWith(updateDto);
        // 👇 CORRECTION : Le message de notification dans le service est différent.
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Votre profil a été mis à jour avec succès.', 'valid'
        );
      });
    });

    it('should handle API errors gracefully', () => {
      const updateDto: UserProfileUpdateDto = { firstName: 'Updated', lastName: 'Name' };
      const errorResponse = new Error('API error');
      userApiServiceSpy.updateCurrentUserProfile.and.returnValue(throwError(() => errorResponse));

      service.updateCurrentUserProfile(updateDto).subscribe(profile => {
        // 👇 CORRECTION : Le `catchError` retourne `of(undefined)`, pas `null`.
        expect(profile).toBeUndefined();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });
  });

  describe('uploadUserAvatar', () => {
    it('should upload avatar successfully and update user profile', () => {
      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      const updatedUser = { ...mockUser, avatarUrl: 'new-avatar.jpg' };
      userApiServiceSpy.getCurrentUserProfile.and.returnValue(of(updatedUser));

      service.uploadUserAvatar(file).subscribe(result => {
        // 👇 CORRECTION : La méthode retourne le profil mis à jour, pas un booléen.
        expect(result).toEqual(updatedUser);
        expect(userApiServiceSpy.uploadAvatar).toHaveBeenCalledWith(file);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Avatar mis à jour avec succès.', 'valid'
        );
      });
    });

    it('should handle API errors gracefully', () => {
      const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      const errorResponse = new Error('API error');
      userApiServiceSpy.uploadAvatar.and.returnValue(throwError(() => errorResponse));

      service.uploadUserAvatar(file).subscribe(result => {
        // 👇 CORRECTION : Le `catchError` retourne `of(undefined)`, il ne propage pas l'erreur.
        expect(result).toBeUndefined();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });
  });

  describe('requestAccountDeletion', () => {
    it('should request account deletion successfully', () => {
      service.requestAccountDeletion().subscribe(result => {
        expect(result).toBe(true);
        expect(userApiServiceSpy.requestAccountDeletion).toHaveBeenCalled();
        // 👇 CORRECTION : Le message de notification dans le service est différent.
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Un email de confirmation de suppression a été envoyé à votre adresse.', 'valid'
        );
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      userApiServiceSpy.requestAccountDeletion.and.returnValue(throwError(() => errorResponse));

      service.requestAccountDeletion().subscribe(result => {
        expect(result).toBe(false);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });
  });

  describe('confirmAccountDeletion', () => {
    it('should confirm account deletion successfully', () => {
      const token = 'deletion-token';

      service.confirmAccountDeletion(token).subscribe(result => {
        expect(result).toBe(true);
        expect(userApiServiceSpy.confirmAccountDeletion).toHaveBeenCalledWith(token);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Votre compte a été supprimé avec succès.', 'valid'
        );
      });
    });

    it('should handle API errors gracefully', () => {
      const token = 'deletion-token';
      const errorResponse = new Error('API error');

      userApiServiceSpy.confirmAccountDeletion.and.returnValue(throwError(() => errorResponse));

      service.confirmAccountDeletion(token).subscribe(result => {
        expect(result).toBe(false);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
      });
    });
  });
});
