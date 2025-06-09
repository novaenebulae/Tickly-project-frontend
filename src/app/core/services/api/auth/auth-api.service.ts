/**
 * @file API service for authentication operations.
 * Handles HTTP requests for authentication and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from '../api-config.service';
import { AuthApiMockService } from './auth-api-mock.service'; // Import the mock service
import { APP_CONFIG } from '../../../config/app-config';
import { LoginCredentials, AuthResponseDto } from '../../../models/auth/auth.model';
import { UserRegistrationDto } from '../../../models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  private apiConfig = inject(ApiConfigService);
  private http = inject(HttpClient); // Direct access to HttpClient for more control
  private mockService = inject(AuthApiMockService); // Inject the mock service

  // TODO: Add methods for password reset and change
  requestPasswordReset(dto: { email: string }): Observable<void> {
    /* ... call API ... */
  return new Observable<void>();
  }

  requestPasswordChange(): Observable<void> {
    /* ... call API ... */
    return new Observable<void>(); // Retourne un observable vide
  }


  /**
   * Calls the login API or uses mocks depending on the configuration.
   * @param credentials - Email and password.
   * @returns An Observable of AuthResponseDto.
   */
  login(credentials: LoginCredentials): Observable<AuthResponseDto> {

    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockService.mockLogin(credentials);
    }

    this.apiConfig.logApiRequest('POST', 'login', credentials);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.login);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<AuthResponseDto>(url, credentials, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'login', response)),
      catchError(error => this.handleAuthError(error, 'login'))
    );
  }

  /**
   * Calls the register API or uses mocks depending on the configuration.
   * @param userRegistrationDto - User registration data.
   * @returns An Observable of AuthResponseDto.
   */
  register(userRegistrationDto: UserRegistrationDto): Observable<AuthResponseDto> {

    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockService.mockRegister(userRegistrationDto);
    }

    this.apiConfig.logApiRequest('POST', 'register', userRegistrationDto);
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.register);
    const headers = this.apiConfig.createHeaders();
    return this.http.post<AuthResponseDto>(url, userRegistrationDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'register', response)),
      catchError(error => this.handleAuthError(error, 'register'))
    );
  }

  /**
   * Calls the refresh token API or uses mocks depending on the configuration.
   * @returns An Observable of AuthResponseDto with refreshed token.
   */
  refreshToken(): Observable<AuthResponseDto> {
    this.apiConfig.logApiRequest('POST', 'refresh-token', {});

    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockService.mockRefreshToken();
    }

    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.refreshToken ?? '');
    const token = this.getStoredToken();
    if (!token) {
      return throwError(() => new Error('No token available for refresh'));
    }

    const headers = this.apiConfig.createHeaders();
    return this.http.post<AuthResponseDto>(url, { token }, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'refresh-token', response)),
      catchError(error => this.handleAuthError(error, 'refresh'))
    );
  }

  /**
   * Retrieves the stored authentication token.
   * @returns The token string, or null if not found.
   */
  private getStoredToken(): string | null {
    const keepLoggedIn = localStorage.getItem(APP_CONFIG.auth.keepLoggedInKey) === 'true';
    return keepLoggedIn
      ? localStorage.getItem(APP_CONFIG.auth.tokenKey)
      : sessionStorage.getItem(APP_CONFIG.auth.tokenKey);
  }

  /**
   * Handles authentication-related errors.
   * @param error - The HttpErrorResponse.
   * @param context - The context in which the error occurred (e.g., 'login', 'register').
   * @returns An Observable that emits an error with a user-friendly message.
   */
  private handleAuthError(
    error: HttpErrorResponse,
    context: 'login' | 'register' | 'refresh'
  ): Observable<never> {
    this.apiConfig.logApiError('AUTH-API', context, error);

    let userMessage: string;
    if (error.status === 401 && context === 'login') {
      userMessage = 'Incorrect email or password.';
    } else if (error.status === 409 && context === 'register') {
      userMessage =
        typeof error.error === 'string'
          ? error.error
          : error.error?.message || 'This email address is already in use.';
    } else if (error.status === 400) {
      userMessage =
        error.error?.message ||
        'Invalid data. Please verify the fields.';
    } else {
      userMessage =
        'A technical error occurred. Please try again later.';
    }

    return throwError(() => ({
      status: error.status,
      message: userMessage, // User-friendly message
      originalError: error // The original HttpErrorResponse for debugging
    }));
  }
}
