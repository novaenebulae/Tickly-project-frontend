import {TestBed} from '@angular/core/testing';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {AppError, ErrorHandlingService} from './error-handling.service';
import {NotificationService} from './domain/utilities/notification.service';
import {environment} from '../../../environments/environment';

describe('ErrorHandlingService', () => {
  let service: ErrorHandlingService;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(() => {
    // Create spy for NotificationService
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['displayNotification']);

    // Spy on console.error
    consoleErrorSpy = spyOn(console, 'error');

    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        ErrorHandlingService,
        { provide: NotificationService, useValue: notificationSpy }
      ]
    });

    service = TestBed.inject(ErrorHandlingService);
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleHttpError', () => {
    it('should handle HTTP errors and display notifications', () => {
      // Arrange
      const httpError = new HttpErrorResponse({
        error: { message: 'Server error message' },
        status: 500,
        statusText: 'Internal Server Error'
      });

      // Act
      let capturedError: AppError | undefined;
      service.handleHttpError(httpError, 'testContext').subscribe(
        () => fail('Expected an error to be thrown'),
        (error) => capturedError = error
      );

      // Assert
      expect(notificationService.displayNotification).toHaveBeenCalledWith(
        'Server error message', 'error'
      );
      expect(capturedError).toBeDefined();
      expect(capturedError?.userMessage).toBe('Server error message');
      expect(capturedError?.statusCode).toBe(500);
      expect(capturedError?.context).toBe('testContext');
    });

    it('should use default message when error object does not contain a message', () => {
      // Arrange
      const httpError = new HttpErrorResponse({
        error: {},
        status: 500,
        statusText: 'Internal Server Error'
      });

      // Act
      service.handleHttpError(httpError, 'testContext').subscribe(
        () => fail('Expected an error to be thrown'),
        () => {}
      );

      // Assert
      expect(notificationService.displayNotification).toHaveBeenCalledWith(
        'Une erreur est survenue sur le serveur.', 'error'
      );
    });

    it('should use status-specific messages for common HTTP errors', () => {
      // Arrange
      const httpError404 = new HttpErrorResponse({
        error: {},
        status: 404,
        statusText: 'Not Found'
      });

      // Act
      service.handleHttpError(httpError404, 'testContext').subscribe(
        () => fail('Expected an error to be thrown'),
        () => {}
      );

      // Assert
      expect(notificationService.displayNotification).toHaveBeenCalledWith(
        'La ressource demandée n\'existe pas.', 'error'
      );
    });
  });

  describe('handleValidationError', () => {
    it('should handle validation errors and display notifications', () => {
      // Arrange
      const errorMessages = {
        name: 'Le nom est requis',
        email: 'L\'email n\'est pas valide'
      };

      // Act
      let capturedError: AppError | undefined;
      service.handleValidationError(errorMessages, 'testContext').subscribe(
        () => fail('Expected an error to be thrown'),
        (error) => capturedError = error
      );

      // Assert
      expect(notificationService.displayNotification).toHaveBeenCalledWith(
        'Le nom est requis\nL\'email n\'est pas valide', 'error'
      );
      expect(capturedError).toBeDefined();
      expect(capturedError?.userMessage).toBe('Le nom est requis\nL\'email n\'est pas valide');
      expect(capturedError?.context).toBe('testContext');
    });

    it('should use default message when no error messages are provided', () => {
      // Arrange
      const errorMessages = {};

      // Act
      service.handleValidationError(errorMessages, 'testContext').subscribe(
        () => fail('Expected an error to be thrown'),
        () => {}
      );

      // Assert
      expect(notificationService.displayNotification).toHaveBeenCalledWith(
        'Veuillez corriger les erreurs dans le formulaire.', 'error'
      );
    });
  });

  describe('handleGeneralError', () => {
    it('should handle general errors and display notifications', () => {
      // Arrange
      const message = 'Une erreur est survenue';
      const error = new Error('Test error');

      // Act
      let capturedError: AppError | undefined;
      service.handleGeneralError(message, error, 'testContext').subscribe(
        () => fail('Expected an error to be thrown'),
        (error) => capturedError = error
      );

      // Assert
      expect(notificationService.displayNotification).toHaveBeenCalledWith(
        message, 'error'
      );
      expect(capturedError).toBeDefined();
      expect(capturedError?.userMessage).toBe(message);
      expect(capturedError?.originalError).toBe(error);
      expect(capturedError?.context).toBe('testContext');
    });
  });

  describe('notifyError', () => {
    it('should display error notification without throwing an error', () => {
      // Arrange
      const message = 'Une erreur est survenue';
      const error = new Error('Test error');

      // Act
      service.notifyError(message, 'testContext', error);

      // Assert
      expect(notificationService.displayNotification).toHaveBeenCalledWith(
        message, 'error'
      );
    });
  });

  describe('logging behavior', () => {
    it('should log errors when enableDebugLogs is true', () => {
      // Arrange
      spyOnProperty(environment, 'enableDebugLogs').and.returnValue(true);
      const message = 'Test error';

      // Act
      service.notifyError(message, 'testContext');

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should not log errors when enableDebugLogs is false', () => {
      // Arrange
      spyOnProperty(environment, 'enableDebugLogs').and.returnValue(false);
      const message = 'Test error';

      // Act
      service.notifyError(message, 'testContext');

      // Assert
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
