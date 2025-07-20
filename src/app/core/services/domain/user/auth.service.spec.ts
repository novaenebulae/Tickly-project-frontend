import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {AuthApiService} from '../../api/auth/auth-api.service';
import {NotificationService} from '../utilities/notification.service';
import {of, throwError} from 'rxjs';
import {AuthResponseDto, JwtPayload, LoginCredentials} from '../../../models/auth/auth.model';
import {UserRegistrationDto} from '../../../models/user/user.model';
import {UserRole} from '../../../models/user/user-role.enum';

// PAS BESOIN D'IMPORTER jwt-decode ICI

describe('AuthService', () => {
  let service: AuthService;
  let authApiServiceSpy: jasmine.SpyObj<AuthApiService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockDecodedToken: JwtPayload = {
    userId: 1,
    sub: 'user@example.com',
    role: UserRole.SPECTATOR,
    exp: Math.floor(Date.now() / 1000) + 3600 // Expiration dans 1 heure
  };
  // Token généré à partir de mockDecodedToken (header.payload.signature)
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInN1YiI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiU1BFQ1RBVE9SIiwiZXhwIjozMjM4NDM5MjM5fQ.fake-signature';


  const mockAuthResponse: AuthResponseDto = {
    accessToken: mockToken,
    expiresIn: 3600,
    firstName: 'John',
    lastName: 'Doe',
    email: 'user@example.com',
    userId: 1,
    role: UserRole.SPECTATOR
  };

  const mockLoginCredentials: LoginCredentials = {
    email: 'user@example.com',
    password: 'password123'
  };

  const mockRegistrationDto: UserRegistrationDto = {
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    termsAccepted: true
  };

  beforeEach(() => {
    // Create spy objects
    const authApiSpy = jasmine.createSpyObj('AuthApiService', [
      'login', 'register', 'requestPasswordReset', 'refreshToken'
    ]);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['displayNotification']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    authApiSpy.login.and.returnValue(of(mockAuthResponse));
    authApiSpy.register.and.returnValue(of(mockAuthResponse));
    authApiSpy.refreshToken.and.returnValue(of(mockAuthResponse));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        AuthService,
        { provide: AuthApiService, useValue: authApiSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    authApiServiceSpy = TestBed.inject(AuthApiService) as jasmine.SpyObj<AuthApiService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store token', () => {
      service.login(mockLoginCredentials, true).subscribe(result => {
        expect(result).toBeTrue();
        expect(authApiServiceSpy.login).toHaveBeenCalledWith(mockLoginCredentials);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          "Connexion réussie ! Bienvenue.", 'valid'
        );
      });
    });

    it('should handle login error', () => {
      const errorResponse = new Error('Login failed');
      authApiServiceSpy.login.and.returnValue(throwError(() => errorResponse));

      service.login(mockLoginCredentials, true).subscribe({
        error: error => {
          expect(error).toBeTruthy();
        }
      });
    });
  });

  describe('register', () => {
    it('should register successfully and store token', () => {
      service.register(mockRegistrationDto, true).subscribe(result => {
        expect(result).toBeTrue();
        expect(authApiServiceSpy.register).toHaveBeenCalledWith(mockRegistrationDto);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          "Inscription réussie ! Bienvenue sur Tickly.", 'valid'
        );
      });
    });

    it('should handle registration without token (email verification required)', () => {
      const responseWithoutToken: AuthResponseDto = {
        expiresIn: 0,
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        userId: 1,
        role: UserRole.SPECTATOR
        // accessToken is intentionally omitted
      };
      authApiServiceSpy.register.and.returnValue(of(responseWithoutToken));

      service.register(mockRegistrationDto, true).subscribe(result => {
        expect(result).toBeTrue();
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          "Inscription réussie ! Validez votre adresse mail afin de pouvoir vous connecter.", 'valid'
        );
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      });
    });

    it('should handle registration error', () => {
      const errorResponse = new Error('Registration failed');
      authApiServiceSpy.register.and.returnValue(throwError(() => errorResponse));

      service.register(mockRegistrationDto, true).subscribe({
        error: error => {
          expect(error).toBeTruthy();
        }
      });
    });
  });

  describe('logout', () => {
    it('should clear auth data and navigate to login page', () => {
      // Setup: first login to set auth data
      service.login(mockLoginCredentials, true).subscribe();

      // Test logout
      service.logout();

      expect(service.isLoggedIn()).toBeFalse();
      expect(service.currentUser()).toBeNull();
      expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
        "Vous avez été déconnecté.", 'info'
      );
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should not navigate to login page when navigateToLogin is false', () => {
      service.logout(false);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', () => {
      const email = 'user@example.com';
      authApiServiceSpy.requestPasswordReset.and.returnValue(of(undefined));

      service.requestPasswordReset(email).subscribe(() => {
        expect(authApiServiceSpy.requestPasswordReset).toHaveBeenCalledWith({ email });
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          "Si un compte existe pour cet email, un lien de réinitialisation de mot de passe a été envoyé.",
          'valid'
        );
      });
    });

    it('should handle password reset request error', () => {
      const email = 'user@example.com';
      const errorResponse = { message: 'Reset request failed' };
      authApiServiceSpy.requestPasswordReset.and.returnValue(throwError(() => errorResponse));

      service.requestPasswordReset(email).subscribe({
        error: error => {
          expect(error).toBeTruthy();
          expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
        }
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', () => {
      // Setup: first login to set auth data
      service.login(mockLoginCredentials, true).subscribe();

      service.refreshToken().subscribe(result => {
        expect(result).toBeTrue();
        expect(authApiServiceSpy.refreshToken).toHaveBeenCalled();
      });
    });

    it('should return false if no current token exists', () => {
      // Ensure no token exists
      service.logout(false);

      service.refreshToken().subscribe(result => {
        expect(result).toBeFalse();
        expect(authApiServiceSpy.refreshToken).not.toHaveBeenCalled();
      });
    });

    it('should handle refresh token error', () => {
      // Setup: first login to set auth data
      service.login(mockLoginCredentials, true).subscribe();

      const errorResponse = new Error('Refresh failed');
      authApiServiceSpy.refreshToken.and.returnValue(throwError(() => errorResponse));

      service.refreshToken().subscribe(result => {
        expect(result).toBeFalse();
        expect(service.isLoggedIn()).toBeFalse();
      });
    });
  });
});
