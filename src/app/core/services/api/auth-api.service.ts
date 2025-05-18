// src/app/core/services/api/auth-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiConfigService } from './api-config.service';
import { APP_CONFIG } from '../../config/app-config';
import { AuthResponseDto} from '../../models';
// Import des mocks si nécessaire
import { mockUsers} from '../../mocks/auth/users.mock';

import { LoginCredentials} from '../../models';

/**
 * Service API pour l'authentification
 * Gère les requêtes HTTP liées à l'authentification et délègue à des mocks si nécessaire
 */
@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private apiConfig = inject(ApiConfigService);

  /**
   * Appelle l'API de connexion ou utilise des mocks selon la configuration
   * @param credentials Email et mot de passe
   */
  login(credentials: LoginCredentials): Observable<AuthResponseDto> {
    // Log de la requête en mode développement
    this.apiConfig.logApiRequest('POST', 'login', credentials);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockLogin(credentials);
    }

    // Appel réel à l'API
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.login);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.post<AuthResponseDto>(url, credentials, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'login', response)),
      catchError(error => this.handleAuthError(error, 'login'))
    );
  }

  /**
   * Appelle l'API d'inscription ou utilise des mocks selon la configuration
   * @param userRegistrationDto Données d'inscription de l'utilisateur
   */
  register(userRegistrationDto: any): Observable<AuthResponseDto> {
    // Log de la requête en mode développement
    this.apiConfig.logApiRequest('POST', 'register', userRegistrationDto);

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockRegister(userRegistrationDto);
    }

    // Appel réel à l'API
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.register);
    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.post<AuthResponseDto>(url, userRegistrationDto, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'register', response)),
      catchError(error => this.handleAuthError(error, 'register'))
    );
  }

  /**
   * Appelle l'API de rafraîchissement du token ou utilise des mocks selon la configuration
   */
  refreshToken(): Observable<AuthResponseDto> {
    // Log de la requête en mode développement
    this.apiConfig.logApiRequest('POST', 'refresh-token', {});

    // Vérifier si on utilise les mocks
    if (this.apiConfig.isMockEnabledForDomain('auth')) {
      return this.mockRefreshToken();
    }

    // Appel réel à l'API
    const url = this.apiConfig.getUrl(APP_CONFIG.api.endpoints.auth.refreshToken);
    const token = this.getStoredToken();

    if (!token) {
      return throwError(() => new Error('No token available for refresh'));
    }

    const headers = this.apiConfig.createHeaders();

    return this.apiConfig.http.post<AuthResponseDto>(url, { token }, { headers }).pipe(
      tap(response => this.apiConfig.logApiResponse('POST', 'refresh-token', response)),
      catchError(error => {
        this.apiConfig.logApiError('POST', 'refresh-token', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère le token stocké
   */
  private getStoredToken(): string | null {
    const keepLoggedIn = localStorage.getItem(APP_CONFIG.auth.keepLoggedInKey) === 'true';
    return keepLoggedIn
      ? localStorage.getItem(APP_CONFIG.auth.tokenKey)
      : sessionStorage.getItem(APP_CONFIG.auth.tokenKey);
  }

  /**
   * Gère les erreurs d'authentification
   */
  private handleAuthError(
    error: HttpErrorResponse,
    context: 'login' | 'register' | 'refresh'
  ): Observable<never> {
    this.apiConfig.logApiError('POST', context, error);

    let userMessage: string;

    if (error.status === 401 && context === 'login') {
      userMessage = 'Email ou mot de passe incorrect.';
    } else if (error.status === 409 && context === 'register') {
      userMessage =
        typeof error.error === 'string'
          ? error.error
          : error.error?.message || 'Cette adresse email est déjà utilisée.';
    } else if (error.status === 400) {
      userMessage =
        error.error?.message ||
        'Données invalides. Veuillez vérifier les champs.';
    } else {
      userMessage =
        'Une erreur technique est survenue. Veuillez réessayer plus tard.';
    }

    return throwError(() => ({
      status: error.status,
      message: userMessage,
      original: error
    }));
  }

  // ===== Méthodes de mock pour les tests et développement =====

  // src/app/core/services/api/auth-api.service.ts

  /**
   * Version mock du login pour le développement et les tests
   */
  private mockLogin(credentials: LoginCredentials): Observable<AuthResponseDto> {
    // Si email ou password est null, c'est forcément invalide
    if (!credentials.email || !credentials.password) {
      return this.apiConfig.createMockError(400, 'Email et mot de passe requis');
    }

    // Chercher l'utilisateur dans les mocks
    const user = mockUsers.find((u: { email: string; password: string | null; }) =>
      u.email.toLowerCase() === credentials.email?.toLowerCase() &&
      u.password === credentials.password
    );

    if (!user) {
      return this.apiConfig.createMockError(401, 'Email ou mot de passe incorrect');
    }

    // Créer un mock de réponse avec token
    return this.apiConfig.createMockResponse<AuthResponseDto>({
      token: user.mockToken,
      userId: user.id,
      needsStructureSetup: user.needsStructureSetup || false,
      role: user.role
    });
  }

  /**
   * Version mock de l'inscription pour le développement et les tests
   */
  private mockRegister(userRegistrationDto: any): Observable<AuthResponseDto> {
    // Vérifier si l'email existe déjà
    const existingUser = mockUsers.find((u: { email: string; }) =>
      u.email.toLowerCase() === userRegistrationDto.email?.toLowerCase()
    );

    if (existingUser) {
      return this.apiConfig.createMockError(409, 'Cette adresse email est déjà utilisée');
    }

    // Vérifier les champs obligatoires
    if (!userRegistrationDto.email || !userRegistrationDto.password) {
      return this.apiConfig.createMockError(400, 'Données invalides. Veuillez vérifier les champs.');
    }

    // Simuler un nouvel utilisateur avec un token mock
    const newUserToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return this.apiConfig.createMockResponse<AuthResponseDto>({
      token: newUserToken,
      userId: mockUsers.length + 1,
      // Par défaut un nouvel utilisateur a besoin de configurer sa structure
      needsStructureSetup: true,
      // Par défaut, rôle administrateur de structure pour les nouveaux utilisateurs
      role: 'STRUCTURE_ADMINISTRATOR'
    });
  }

  /**
   * Version mock du rafraîchissement de token pour le développement et les tests
   */
  private mockRefreshToken(): Observable<AuthResponseDto> {
    const token = this.getStoredToken();

    if (!token) {
      return this.apiConfig.createMockError(401, 'Token non disponible');
    }

    // Simuler un nouveau token
    const newToken = `${token.split('_')[0]}_refreshed_${Date.now()}`;

    // Pour un refresh, on garderait les mêmes informations que dans le token actuel
    // Dans un mock, on peut utiliser des valeurs par défaut
    return this.apiConfig.createMockResponse<AuthResponseDto>({
      token: newToken,
      userId: 1, // L'ID réel devrait être extrait du token existant
      needsStructureSetup: false, // Supposons que la structure est déjà configurée
      role: 'STRUCTURE_ADMINISTRATOR' // Rôle par défaut
    });
  }
}
