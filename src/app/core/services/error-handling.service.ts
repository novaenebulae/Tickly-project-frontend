/**
 * @file Service for centralizing error handling across the application.
 * @licence Proprietary
 */

import {inject, Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {NotificationService} from './domain/utilities/notification.service';
import {environment} from '../../../environments/environment';

/**
 * Interface for standardized error objects returned by the service
 */
export interface AppError {
  /** User-friendly message to display */
  userMessage: string;
  /** Technical error details (not shown to user) */
  technicalMessage?: string;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Original error object for debugging */
  originalError?: any;
  /** Error context/location to help with debugging */
  context?: string;
}

/**
 * Service responsible for centralizing error handling across the application.
 * It provides consistent error processing, logging, and user notifications.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  private notification = inject(NotificationService);

  /**
   * Handles HTTP errors from API calls
   *
   * @param error - The HTTP error response
   * @param context - The context where the error occurred (e.g., 'getUserProfile')
   * @param defaultMessage - Default user-friendly message if none can be determined
   * @returns An Observable that errors with a standardized AppError
   */
  handleHttpError(
    error: HttpErrorResponse,
    context: string,
    defaultMessage = 'Une erreur est survenue lors de la communication avec le serveur.'
  ): Observable<never> {
    // Create standardized error object
    const appError: AppError = {
      userMessage: this.getUserMessageFromHttpError(error, defaultMessage),
      technicalMessage: error.message,
      statusCode: error.status,
      originalError: error,
      context
    };

    // Log error in development mode
    this.logError(context, appError);

    // Display notification to user
    this.notification.displayNotification(appError.userMessage, 'error');

    // Return error observable
    return throwError(() => appError);
  }

  /**
   * Handles validation errors from forms or other client-side validations
   *
   * @param errorMessages - Map of field names to error messages
   * @param context - The context where the error occurred
   * @returns An Observable that errors with a standardized AppError
   */
  handleValidationError(
    errorMessages: Record<string, string>,
    context: string
  ): Observable<never> {
    // Create a combined error message
    const combinedMessage = Object.values(errorMessages).join('\n');

    const appError: AppError = {
      userMessage: combinedMessage || 'Veuillez corriger les erreurs dans le formulaire.',
      context
    };

    // Log error in development mode
    this.logError(context, appError);

    // Display notification to user
    this.notification.displayNotification(appError.userMessage, 'error');

    // Return error observable
    return throwError(() => appError);
  }

  /**
   * Handles general application errors
   *
   * @param message - User-friendly error message
   * @param error - Original error object
   * @param context - The context where the error occurred
   * @returns An Observable that errors with a standardized AppError
   */
  handleGeneralError(
    message: string,
    error: any,
    context: string
  ): Observable<never> {
    const appError: AppError = {
      userMessage: message,
      originalError: error,
      context
    };

    // Log error in development mode
    this.logError(context, appError);

    // Display notification to user
    this.notification.displayNotification(message, 'error');

    // Return error observable
    return throwError(() => appError);
  }

  /**
   * Displays an error notification without throwing an error
   *
   * @param message - User-friendly error message
   * @param context - The context where the error occurred
   * @param error - Optional original error object for logging
   */
  notifyError(message: string, context: string, error?: any): void {
    const appError: AppError = {
      userMessage: message,
      originalError: error,
      context
    };

    // Log error in development mode
    this.logError(context, appError);

    // Display notification to user
    this.notification.displayNotification(message, 'error');
  }

  /**
   * Extracts a user-friendly message from an HTTP error response
   *
   * @param error - The HTTP error response
   * @param defaultMessage - Default message if none can be determined
   * @returns A user-friendly error message
   */
  private getUserMessageFromHttpError(error: HttpErrorResponse, defaultMessage: string): string {
    // Try to get message from error response
    if (error.error && typeof error.error === 'object') {
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.error) {
        return error.error.error;
      }
    }

    // Use status-specific messages for common HTTP errors
    switch (error.status) {
      case 400:
        return 'La requête contient des données invalides.';
      case 401:
        return 'Vous devez être connecté pour effectuer cette action.';
      case 403:
        return 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.';
      case 404:
        return 'La ressource demandée n\'existe pas.';
      case 409:
        return 'Un conflit est survenu lors de la modification de la ressource.';
      case 422:
        return 'Les données fournies ne sont pas valides.';
      case 500:
        return 'Une erreur est survenue sur le serveur.';
      case 503:
        return 'Le service est temporairement indisponible.';
      case 0:
        return 'Impossible de communiquer avec le serveur. Vérifiez votre connexion internet.';
      default:
        return defaultMessage;
    }
  }

  /**
   * Logs error information to the console in development mode
   *
   * @param context - The context where the error occurred
   * @param error - The error object to log
   */
  private logError(context: string, error: any): void {
    // Only log in development mode
    if (environment.enableDebugLogs) {
      console.error(`[ERROR] ${context}:`, error);
    }
  }
}
