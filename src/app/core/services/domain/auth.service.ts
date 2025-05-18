// src/app/core/services/domain/auth.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

// Services
import { NotificationService } from '../notification.service';
import { AuthApiService } from '../api/auth-api.service';

// Models
import { JwtPayload, AuthResponseDto, LoginCredentials } from '../../models';
import { UserRegistrationDto} from '../../models';
import { APP_CONFIG } from '../../config/app-config';

/**
 * Service d'authentification
 * Gère la logique métier liée à l'authentification, aux tokens et aux sessions utilisateur
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private notification = inject(NotificationService);
  private authApi = inject(AuthApiService);

  // Signaux pour l'état d'authentification
  private currentUserSig = signal<JwtPayload | null>(null);
  private isLoggedInSig = signal<boolean>(false);
  private keepLoggedInSig = signal<boolean>(false);

  // États calculés exposés publiquement
  readonly currentUser = computed(() => this.currentUserSig());
  readonly isLoggedIn = computed(() => this.isLoggedInSig());
  readonly keepLoggedIn = computed(() => this.keepLoggedInSig());
  readonly userRole = computed(() => this.currentUserSig()?.role);
  readonly needsStructureSetup = computed(() => this.currentUserSig()?.needsStructureSetup === true);

  constructor() {
    // Initialiser l'état de la session
    this.loadKeepLoggedInPreference();
    this.checkInitialAuthState();
  }

  /**
   * Charge la préférence "Se souvenir de moi"
   */
  private loadKeepLoggedInPreference(): void {
    const keepLoggedIn = localStorage.getItem(APP_CONFIG.auth.keepLoggedInKey) === 'true';
    this.keepLoggedInSig.set(keepLoggedIn);
  }

  /**
   * Définit la préférence "Se souvenir de moi"
   */
  setKeepLoggedIn(keep: boolean): void {
    this.keepLoggedInSig.set(keep);
    localStorage.setItem(APP_CONFIG.auth.keepLoggedInKey, keep.toString());
  }

  /**
   * Vérifie l'état d'authentification initial au démarrage
   */
  private checkInitialAuthState(): void {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        const isExpired = (decodedToken.exp ?? 0) * 1000 < Date.now();

        if (!isExpired) {
          this.currentUserSig.set(decodedToken);
          this.isLoggedInSig.set(true);
          console.log('AuthService: User restored from token.', decodedToken);
        } else {
          console.log('AuthService: Token found but expired.');
          this.clearAuthData();
        }
      } catch (error) {
        console.error('AuthService: Error decoding initial token:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Authentifie l'utilisateur avec email et mot de passe
   */
  login(credentials: LoginCredentials): Observable<void> {
    return this.authApi.login(credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      map(() => void 0),
      catchError(error => {
        this.notification.displayNotification(
          error.message || 'Échec de connexion',
          'error',
          'Fermer'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Enregistre un nouvel utilisateur et l'authentifie
   */
  register(userRegistrationDto: UserRegistrationDto): Observable<void> {
    return this.authApi.register(userRegistrationDto).pipe(
      tap(response => this.handleAuthResponse(response)),
      map(() => void 0),
      catchError(error => {
        this.notification.displayNotification(
          error.message || 'Échec d\'inscription',
          'error',
          'Fermer'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Rafraîchit le token d'authentification
   */
  refreshToken(): Observable<void> {
    return this.authApi.refreshToken().pipe(
      tap(response => this.handleAuthResponse(response)),
      map(() => void 0),
      catchError(error => {
        console.error('Token refresh failed:', error);
        // Si le rafraîchissement échoue, déconnexion
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    this.clearAuthData();
    this.notification.displayNotification(
      'Déconnexion réussie',
      'valid',
      'Fermer'
    );
    this.router.navigateByUrl('/home');
  }

  /**
   * Traite la réponse d'authentification (login/register/refresh)
   */
  private handleAuthResponse(response: AuthResponseDto): void {
    if (!response || !response.token) {
      console.error('Invalid auth response:', response);
      this.notification.displayNotification(
        'Réponse d\'authentification invalide',
        'error',
        'Fermer'
      );
      return;
    }

    // Stocker le token selon la préférence "Se souvenir de moi"
    this.storeToken(response.token);

    try {
      // Décoder le token et mettre à jour l'état
      const decodedToken = jwtDecode<JwtPayload>(response.token);
      this.currentUserSig.set(decodedToken);
      this.isLoggedInSig.set(true);

      this.notification.displayNotification(
        'Authentification réussie',
        'valid',
        'Fermer'
      );

      // Rediriger selon le rôle/état
      this.navigateBasedOnAuthState(decodedToken);
    } catch (error) {
      console.error('Error processing authentication token:', error);
      this.clearAuthData();
      this.notification.displayNotification(
        'Erreur lors du traitement du token',
        'error',
        'Fermer'
      );
    }
  }

  /**
   * Redirige l'utilisateur selon son rôle et son état
   */
  navigateBasedOnAuthState(decodedToken: JwtPayload): void {
    let targetUrl: string;

    if (decodedToken.needsStructureSetup === true) {
      targetUrl = '/create-structure';
    } else {
      switch (decodedToken.role) {
        case 'STRUCTURE_ADMINISTRATOR':
          targetUrl = '/admin';
          break;
        case 'SPECTATOR':
          targetUrl = '/user';
          break;
        default:
          targetUrl = '/login';
          console.warn(`Unknown role for redirection: ${decodedToken.role}`);
      }
    }

    this.router.navigateByUrl(targetUrl).catch(err => {
      console.error(`Navigation to ${targetUrl} failed:`, err);
      this.notification.displayNotification(
        'Erreur de redirection',
        'error',
        'Fermer'
      );
      this.logout();
    });
  }

  /**
   * Récupère le token d'authentification
   */
  getToken(): string | null {
    return this.keepLoggedIn()
      ? localStorage.getItem(APP_CONFIG.auth.tokenKey)
      : sessionStorage.getItem(APP_CONFIG.auth.tokenKey);
  }

  /**
   * Stocke le token selon la préférence "Se souvenir de moi"
   */
  private storeToken(token: string): void {
    if (this.keepLoggedIn()) {
      localStorage.setItem(APP_CONFIG.auth.tokenKey, token);
    } else {
      sessionStorage.setItem(APP_CONFIG.auth.tokenKey, token);
    }
  }

  /**
   * Met à jour le token et l'état associé
   * Utile lors des opérations qui délivrent un nouveau token (création de structure, etc.)
   */
  updateTokenAndState(newToken: string): void {
    if (!newToken) {
      console.error('updateTokenAndState called with null or empty token');
      return;
    }

    this.storeToken(newToken);

    try {
      const decodedToken = jwtDecode<JwtPayload>(newToken);
      this.currentUserSig.set(decodedToken);
      console.log('Token and state updated successfully');
    } catch (error) {
      console.error('Error decoding new token during update:', error);
      this.logout();
    }
  }

  /**
   * Efface toutes les données d'authentification
   */
  private clearAuthData(): void {
    // On garde la préférence "Se souvenir de moi"
    const keepLoggedInValue = localStorage.getItem(APP_CONFIG.auth.keepLoggedInKey);

    // Supprimer le token du stockage approprié
    localStorage.removeItem(APP_CONFIG.auth.tokenKey);
    sessionStorage.removeItem(APP_CONFIG.auth.tokenKey);

    // Restaurer la préférence "Se souvenir de moi"
    if (keepLoggedInValue) {
      localStorage.setItem(APP_CONFIG.auth.keepLoggedInKey, keepLoggedInValue);
    }

    // Réinitialiser l'état
    this.currentUserSig.set(null);
    this.isLoggedInSig.set(false);
  }
}
