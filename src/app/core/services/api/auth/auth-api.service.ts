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
import { APP_CONFIG } from '../../../config/app-config';
import { LoginCredentials, AuthResponseDto } from '../../../models/auth/auth.model';
import { UserRegistrationDto } from '../../../models/user/user.model';
import {NotificationService} from '../../domain/utilities/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  private apiConfig = inject(ApiConfigService);
  private http = inject(HttpClient); // Direct access to HttpClient for more control
  private notificationService = inject(NotificationService);

  /**
   * Envoie une requête pour réinitialiser le mot de passe
   * @param dto - Objet contenant l'email de l'utilisateur
   * @returns Observable qui complète en cas de succès ou émet une erreur
   */
  requestPasswordReset(dto: { email: string }): Observable<void> {

    this.apiConfig.logApiRequest('POST', 'forgot-password', { email: dto.email });
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.passwordResetRequest);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<void>(url, dto, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('POST', 'forgot-password', { success: true })),
      catchError(error => this.handleAuthError(error, 'forgot-password'))
    );
  }

  /**
   * Réinitialise le mot de passe avec le token reçu par email
   * @param dto - Objet contenant le token et le nouveau mot de passe
   * @returns Observable qui complète en cas de succès ou émet une erreur
   */
  resetPassword(dto: { token: string, newPassword: string }): Observable<void> {

    this.apiConfig.logApiRequest('POST', 'reset-password', { token: dto.token, newPassword: '***' });
    const url = this.apiConfig.getUrl('auth/reset-password');
    const headers = this.apiConfig.createHeaders();

    return this.http.post<void>(url, dto, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('POST', 'reset-password', { success: true })),
      catchError(error => this.handleAuthError(error, 'reset-password'))
    );
  }

  // TODO : cela n'arrivera pas donc à supprimer
  requestPasswordChange(): Observable<void> {
    /* ... call API ... */
    return new Observable<void>(); // Retourne un observable vide
  }

  /**
   * Valide l'email d'un utilisateur avec le token fourni.
   * @param token - Le token de validation reçu par email
   * @returns Un Observable qui complète en cas de succès ou échoue en cas d'erreur
   */
  validateEmail(token: string): Observable<void> {

    this.apiConfig.logApiRequest('GET', 'validate-email', { token });
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.validateToken);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<void>(`${url}?token=${token}`, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('GET', 'validate-email', { success: true })),
      catchError(error => this.handleAuthError(error, 'validate'))
    );
  }


  /**
   * Calls the login API or uses mocks depending on the configuration.
   * @param credentials - Email and password.
   * @returns An Observable of AuthResponseDto.
   */
  login(credentials: LoginCredentials): Observable<AuthResponseDto> {

    this.apiConfig.logApiRequest('POST', 'login', {
      email: credentials.email,
      password: '***' // Ne pas logger le mot de passe en clair
    });
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.login);
    const headers = this.apiConfig.createHeaders();

    return this.http.post<AuthResponseDto>(url, credentials, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'login', {
        success: true,
        userId: response.userId || 'N/A', // Logger l'ID utilisateur si disponible
        hasToken: !!response.accessToken
      })),
      catchError(error => this.handleAuthError(error, 'login'))
    );
  }


  /**
   * Calls the register API or uses mocks depending on the configuration.
   * @param userRegistrationDto - User registration data.
   * @returns An Observable of AuthResponseDto.
   */
  register(userRegistrationDto: UserRegistrationDto): Observable<AuthResponseDto> {

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
   * Gère de façon centralisée les erreurs liées à l'authentification.
   * Cette méthode:
   * 1. Génère un message d'erreur adapté au contexte et au code HTTP
   * 2. Affiche une notification à l'utilisateur via le service de notification
   * 3. Retourne un Observable d'erreur contenant des informations structurées
   *
   * Note importante: Les composants utilisant cette méthode n'ont pas besoin de réafficher
   * le message d'erreur via le service de notification, car c'est déjà fait ici.
   *
   * @param error - La réponse HTTP d'erreur
   * @param context - Le contexte dans lequel l'erreur s'est produite ('login', 'register', etc.)
   * @returns Un Observable qui émet une erreur avec un message adapté à l'utilisateur
   */
  private handleAuthError(
    error: HttpErrorResponse,
    context: 'login' | 'register' | 'refresh' | 'validate' | 'forgot-password' | 'reset-password'
  ): Observable<never> {
    this.apiConfig.logApiError('AUTH-API', context, error);

    let userMessage: string;
    if (error.status === 404 && context === 'login') {
      userMessage = 'Échec de la connexion. Utilisateur non trouvé';
    } else if (error.status === 401 && context === 'login') {
      userMessage = 'Échec de la connexion. Identifiants invalides ou compte non vérifié.';
    } else if (error.status === 409 && context === 'register') {
      userMessage =
        typeof error.error === 'string'
          ? error.error
          : error.error?.message || 'Erreur : Cette adresse email est déja utilisée.';
    } else if (error.status === 400 && context === 'validate') {
      userMessage = 'Token de validation invalide ou expiré.';
    } else if (error.status === 404 && context === 'validate') {
      userMessage = 'Utilisateur non trouvé ou déjà validé.';
    } else if (error.status === 410 && context === 'validate') {
      userMessage = 'Ce lien de validation a expiré. Veuillez demander un nouveau lien.';
    } else if (error.status === 404 && context === 'forgot-password') {
      // Pour des raisons de sécurité, on n'indique pas si l'email existe ou non
      userMessage = 'Si un compte existe avec cette adresse email, un lien de réinitialisation a été envoyé.';
    } else if (error.status === 429 && context === 'forgot-password') {
      userMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
    } else if (error.status === 400 && context === 'reset-password') {
      userMessage = 'Le lien de réinitialisation est invalide ou a expiré.';
    } else if (error.status === 404 && context === 'reset-password') {
      userMessage = 'Le lien de réinitialisation est invalide ou a expiré.';
    } else if (error.status === 410 && context === 'reset-password') {
      userMessage = 'Ce lien de réinitialisation a expiré. Veuillez demander un nouveau lien.';
    } else if (error.status === 400) {
      userMessage =
        error.error?.message ||
        'Échec de l\'inscription. Veuillez réessayer.';
    } else {
      userMessage =
        'Une erreur inattendue s\'est produite, merci de réessayer plus tard';
    }

    this.notificationService.displayNotification(userMessage, 'error');
    return throwError(() => ({
      status: error.status,
      message: userMessage, // User-friendly message
      originalError: error // The original HttpErrorResponse for debugging
    }));
  }
}
