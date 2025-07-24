/**
 * @file API service for authentication operations.
 * Handles HTTP requests for authentication and delegates to a mock service if enabled.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

import {ApiConfigService} from '../api-config.service';
import {APP_CONFIG} from '../../../config/app-config';
import {AuthResponseDto, LoginCredentials} from '../../../models/auth/auth.model';
import {UserRegistrationDto} from '../../../models/user/user.model';
import {NotificationService} from '../../domain/utilities/notification.service';
import {ErrorHandlingService} from '../../error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

  private apiConfig = inject(ApiConfigService);
  private http = inject(HttpClient); // Direct access to HttpClient for more control
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ErrorHandlingService);

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

  /**
   * Valide l'email d'un utilisateur avec le token fourni.
   * @param token - Le token de validation reçu par email
   * @returns Un Observable contenant la réponse d'authentification avec le token JWT
   */
  validateEmail(token: string): Observable<AuthResponseDto> {

    this.apiConfig.logApiRequest('GET', 'validate-email', { token });
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.validateToken);
    const headers = this.apiConfig.createHeaders();

    return this.http.get<AuthResponseDto>(`${url}?token=${token}`, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('GET', 'validate-email', {
        success: true,
        userId: response.userId || 'N/A',
        hasToken: !!response.accessToken
      })),
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
   * @param refreshToken - The refresh token to use for obtaining a new access token.
   * @returns An Observable of AuthResponseDto with refreshed token.
   */
  refreshToken(refreshToken: string): Observable<AuthResponseDto> {
    this.apiConfig.logApiRequest('POST', 'refresh-token', {});

    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.refreshToken ?? '');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available for refresh'));
    }

    const headers = this.apiConfig.createHeaders();
    return this.http.post<AuthResponseDto>(url, { refreshToken }, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'refresh', response)),
      catchError(error => this.handleAuthError(error, 'refresh'))
    );
  }

  /**
   * Calls the logout API to invalidate the refresh token on the server.
   * @param refreshToken - The refresh token to invalidate.
   * @returns An Observable of void that completes when the logout is successful.
   */
  logout(refreshToken: string): Observable<void> {
    this.apiConfig.logApiRequest('POST', 'logout', {});

    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.logout ?? '');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available for logout'));
    }

    const headers = this.apiConfig.createHeaders();
    return this.http.post<void>(url, { refreshToken }, { headers }).pipe(
      tap(() => this.apiConfig.logApiResponse('POST', 'logout', { success: true })),
      catchError(error => this.handleAuthError(error, 'logout'))
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
   * Cette méthode utilise le service ErrorHandlingService pour:
   * 1. Générer un message d'erreur adapté au contexte et au code HTTP
   * 2. Afficher une notification à l'utilisateur
   * 3. Retourner un Observable d'erreur contenant des informations structurées
   *
   * @param error - La réponse HTTP d'erreur
   * @param context - Le contexte dans lequel l'erreur s'est produite ('login', 'register', etc.)
   * @returns Un Observable qui émet une erreur avec un message adapté à l'utilisateur
   */
  private handleAuthError(
    error: HttpErrorResponse,
    context: 'login' | 'register' | 'refresh' | 'validate' | 'forgot-password' | 'reset-password' | 'logout'
  ): Observable<never> {
    // Déterminer le message d'erreur en fonction du contexte et du code d'erreur
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
      // Si aucun cas spécifique n'est trouvé, utiliser le message par défaut du service
      return this.errorHandler.handleHttpError(error, `auth-${context}`);
    }

    // Utiliser le service d'erreur avec le message personnalisé
    return this.errorHandler.handleGeneralError(userMessage, error, `auth-${context}`);
  }
}
