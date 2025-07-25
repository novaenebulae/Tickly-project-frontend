/**
 * @file Domain service for authentication and user session management.
 * Handles login, registration, token management, and user state.
 * Composes AuthApiService for API interactions.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode'; // Ensure 'jwt-decode' is installed
import {AuthApiService} from '../../api/auth/auth-api.service';
import {NotificationService} from '../utilities/notification.service';
import {APP_CONFIG} from '../../../config/app-config';
import {AuthResponseDto, JwtPayload, LoginCredentials} from '../../../models/auth/auth.model';
import {UserRegistrationDto} from '../../../models/user/user.model';
import {UserRole} from '../../../models/user/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApi = inject(AuthApiService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  // --- User State Signals ---
  private currentUserSig: WritableSignal<JwtPayload | null> = signal(null);
  public readonly currentUser = computed(() => this.currentUserSig());

  private isLoggedInSig: WritableSignal<boolean> = signal(false);
  public readonly isLoggedIn = computed(() => this.isLoggedInSig());

  private userRoleSig: WritableSignal<UserRole | null> = signal(null);

  private userStructureIdSig: WritableSignal<number | null> = signal(null);
  public readonly userStructureId = computed(() => this.userStructureIdSig());

  private keepLoggedInSig: WritableSignal<boolean> = signal(
    localStorage.getItem(APP_CONFIG.auth.keepLoggedInKey) === 'true'
  );

  constructor() {
    this.checkInitialAuthState();
  }

  /**
   * Checks the initial authentication state when the service is instantiated.
   * Loads token from storage if available and updates user state.
   */
  private checkInitialAuthState(): void {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        if (decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
          this.updateUserState(decodedToken, token);
        } else {
          this.clearAuthData(); // Token expired
        }
      } catch (error) {
        console.error('Error decoding token on initial auth state check:', error);
        this.clearAuthData(); // Invalid token
      }
    }
  }

  /**
   * Logs in the user with the provided credentials.
   * @param credentials - Login credentials (email and password).
   * @param keepLoggedIn - Whether to persist the session across browser restarts.
   * @returns An Observable that emits true on successful login, false otherwise.
   */
  login(credentials: LoginCredentials, keepLoggedIn: boolean): Observable<boolean> {
    return this.authApi.login(credentials).pipe(
      tap((response: AuthResponseDto) => {
        this.keepLoggedInSig.set(keepLoggedIn);
        localStorage.setItem(APP_CONFIG.auth.keepLoggedInKey, keepLoggedIn.toString());
        this.handleAuthResponse(response);
        this.notification.displayNotification("Connexion réussie ! Bienvenue.", 'valid');
      }),
      map(() => true),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Registers a new user.
   * @param registrationDto - User registration data.
   * @param keepLoggedIn - Whether to persist the session across browser restarts after registration.
   * @returns An Observable that emits true on successful registration and login, false otherwise.
   */
  register(registrationDto: UserRegistrationDto, keepLoggedIn: boolean): Observable<boolean> {
    return this.authApi.register(registrationDto).pipe(
      tap((response: AuthResponseDto) => {
        // Store the keepLoggedIn preference
        this.keepLoggedInSig.set(keepLoggedIn);
        localStorage.setItem(APP_CONFIG.auth.keepLoggedInKey, keepLoggedIn.toString());

        // Handle the auth response (store token, update user state)
        if (response.accessToken) {
          this.handleAuthResponse(response);
          // Show the standard message
          this.notification.displayNotification(
            "Inscription réussie ! Bienvenue sur Tickly.",
            'valid'
          );
        } else {
          // If no token is returned (e.g., email verification required)
          this.notification.displayNotification(
            "Inscription réussie ! Validez votre adresse mail afin de pouvoir vous connecter.",
            'valid'
          );
          this.router.navigate(['/']);
        }
      }),
      map(() => true),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Logs out the current user, invalidates the refresh token on the server,
   * clears authentication data, and navigates to the login page.
   * @param navigateToLogin - Whether to navigate to the login page after logout (default: true).
   */
  logout(navigateToLogin = true): void {
    const refreshToken = this.getRefreshToken();

    // If we have a refresh token, call the API to invalidate it
    if (refreshToken) {
      this.authApi.logout(refreshToken).subscribe({
        next: () => {
          this.notification.displayNotification("Vous avez été déconnecté.", 'info');
        },
        error: () => {
          this.notification.displayNotification("Erreur lors de la déconnexion, mais votre session locale a été supprimée.", 'warning');
        },
        complete: () => {
          // Always clear local auth data and navigate regardless of API call success
          this.clearAuthData();
          if (navigateToLogin) {
            this.router.navigate(['/auth/login']);
          }
        }
      });
    } else {
      // If no refresh token, just clear local data
      this.clearAuthData();
      this.notification.displayNotification("Vous avez été déconnecté.", 'info');
      if (navigateToLogin) {
        this.router.navigate(['/auth/login']);
      }
    }
  }

  /**
   * Updates the authentication token and user state.
   * @param newToken - The new JWT token.
   */
  public updateTokenAndState(newToken: string): void {
    console.log('updateTokenAndState called');
    try {
      const decodedToken = jwtDecode<JwtPayload>(newToken);
      console.log('Token decoded successfully:', decodedToken);

      // Stocker le token avant de mettre à jour l'état
      this.storeToken(newToken);
      console.log('Token stored');

      // Mettre à jour l'état utilisateur
      this.updateUserState(decodedToken);
      console.log('User state updated');

      this.notification.displayNotification("Session mise à jour.", 'info');
    } catch (error) {
      console.error('Failed to update token and state:', error);
      this.logout();
      this.notification.displayNotification("Erreur de mise à jour de session. Veuillez vous reconnecter.", 'error');
    }
  }

  /**
   * Clears session-specific authentication data if the user did not opt to "keep logged in".
   * This is typically called by BrowserCloseService on `beforeunload`.
   * It only clears the session token, leaving localStorage token intact if "keepLoggedIn" was true.
   */
  public clearSessionDataIfNotKeptLoggedIn(): void {
    if (!this.keepLoggedInSig()) {
      sessionStorage.removeItem(APP_CONFIG.auth.tokenKey);

      const tokenInLocalStorage = localStorage.getItem(APP_CONFIG.auth.tokenKey);
      if (!tokenInLocalStorage) {
        this.currentUserSig.set(null);
        this.isLoggedInSig.set(false);
        this.userRoleSig.set(null);
        this.userStructureIdSig.set(null);
        console.log('AuthService: Session data cleared because "keep me logged in" was not active.');
      }
    } else {
      console.log('AuthService: Session data preserved because "keep me logged in" is active.');
    }
  }

  /**
   * Requests a password reset for the given email address.
   * The backend is expected to handle sending the reset email.
   * @param email - The email address of the user requesting a password reset.
   * @returns An Observable that completes on success or errors on failure.
   */
  requestPasswordReset(email: string): Observable<void> {
    return this.authApi.requestPasswordReset({ email }).pipe(
      tap(() => {
        this.notification.displayNotification(
          "Si un compte existe pour cet email, un lien de réinitialisation de mot de passe a été envoyé.",
          'valid'
        );
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors de la demande de réinitialisation du mot de passe.",
          'error'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Handles the authentication response by storing the tokens and updating user state.
   * @param response - The authentication response DTO from the API.
   */
  private handleAuthResponse(response: AuthResponseDto): void {
    if (response.accessToken) {
      // Store both tokens
      this.storeTokens(response);

      try {
        const decodedToken = jwtDecode<JwtPayload>(response.accessToken);
        this.updateUserState(decodedToken, response.accessToken);
        this.navigateAfterLogin(decodedToken);
      } catch (error) {
        console.error('Failed to decode token or update user state:', error);
        this.clearAuthData();
      }
    } else {
      console.error('Failed to decode token or update user state: No Token found');
      this.clearAuthData();
    }
  }

  /**
   * Retrieves the stored authentication token.
   * @returns The token string or null if not found.
   */
  public getToken(): string | null {
    // Toujours vérifier la valeur actuelle dans localStorage pour keepLoggedIn
    const keepLoggedIn = localStorage.getItem(APP_CONFIG.auth.keepLoggedInKey) === 'true';

    let token = keepLoggedIn
      ? localStorage.getItem(APP_CONFIG.auth.tokenKey)
      : sessionStorage.getItem(APP_CONFIG.auth.tokenKey);

    // Fallback: chercher dans les deux stockages si pas trouvé
    if (!token) {
      token = localStorage.getItem(APP_CONFIG.auth.tokenKey) ||
        sessionStorage.getItem(APP_CONFIG.auth.tokenKey);
    }

    return token;
  }

  /**
   * Retrieves the stored refresh token.
   * @returns The refresh token string or null if not found.
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem(APP_CONFIG.auth.refreshTokenKey);
  }

  /**
   * Stores the authentication token in localStorage or sessionStorage.
   * @param token - The JWT token string.
   */
  private storeToken(token: string): void {
    // Toujours vérifier la valeur actuelle dans localStorage pour keepLoggedIn
    const keepLoggedIn = localStorage.getItem(APP_CONFIG.auth.keepLoggedInKey) === 'true';

    // Nettoyer les anciens tokens des deux stockages
    localStorage.removeItem(APP_CONFIG.auth.tokenKey);
    sessionStorage.removeItem(APP_CONFIG.auth.tokenKey);

    if (keepLoggedIn) {
      localStorage.setItem(APP_CONFIG.auth.tokenKey, token);
    } else {
      sessionStorage.setItem(APP_CONFIG.auth.tokenKey, token);
    }
  }

  /**
   * Stores the refresh token in localStorage.
   * @param refreshToken - The refresh token string.
   */
  private storeRefreshToken(refreshToken: string): void {
    localStorage.setItem(APP_CONFIG.auth.refreshTokenKey, refreshToken);
  }

  /**
   * Stores both the access token and refresh token.
   * @param response - The authentication response containing both tokens.
   */
  private storeTokens(response: AuthResponseDto): void {
    if (response.accessToken) {
      this.storeToken(response.accessToken);
    }

    if (response.refreshToken) {
      this.storeRefreshToken(response.refreshToken);
    }
  }

  /**
   * Updates the user state signals based on the decoded JWT payload.
   * @param decodedToken - The decoded JWT payload.
   * @param token - The raw JWT token string (optional, for re-storing if needed).
   */
  private updateUserState(decodedToken: JwtPayload, token?: string): void {
    this.currentUserSig.set(decodedToken);
    this.isLoggedInSig.set(true);
    this.userRoleSig.set(decodedToken.role as UserRole);
    this.userStructureIdSig.set(decodedToken.structureId || null);

  }

  /**
   * Met à jour le contexte de structure utilisateur (appelé après changement de structure).
   * @param structureId - Le nouvel ID de structure.
   */
  public updateUserStructureContext(structureId: number): void {
    this.userStructureIdSig.set(structureId);

  }

  /**
   * Navigates the user to the appropriate page after login based on their role and setup status.
   * @param decodedToken - The decoded JWT payload containing user information.
   */
  private navigateAfterLogin(decodedToken: JwtPayload): void {
    if (decodedToken.structureId) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      // Pas de structure assignée, rediriger vers la création de structure
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Clears all authentication data from signals and storage.
   */
  private clearAuthData(): void {
    this.currentUserSig.set(null);
    this.isLoggedInSig.set(false);
    this.userRoleSig.set(null);
    this.userStructureIdSig.set(null);

    // Clear tokens from both storage mechanisms
    localStorage.removeItem(APP_CONFIG.auth.tokenKey);
    sessionStorage.removeItem(APP_CONFIG.auth.tokenKey);
    localStorage.removeItem(APP_CONFIG.auth.refreshTokenKey);
  }

  /**
   * Refreshes the authentication token by making a call to the backend using the refresh token.
   * @returns An Observable that emits true if the token was refreshed successfully, false otherwise.
   */
  refreshToken(): Observable<boolean> {
    const refreshToken = this.getRefreshToken();

    // For testing purposes, if we have a token but no refresh token,
    // we'll use the token itself as a refresh token
    if (!refreshToken) {
      const token = this.getToken();
      if (token) {
        console.log('No refresh token available, but token exists. Using token for refresh.');
        return this.authApi.refreshToken(token).pipe(
          tap((response: AuthResponseDto) => {
            if (response.accessToken) {
              this.storeTokens(response);
              const decodedToken = jwtDecode<JwtPayload>(response.accessToken);
              this.updateUserState(decodedToken, response.accessToken);
              console.log('Token refreshed successfully');
            }
          }),
          map(() => true),
          catchError((error) => {
            console.error('Failed to refresh token:', error);
            this.clearAuthData();
            this.notification.displayNotification("Votre session a expiré. Veuillez vous reconnecter.", 'warning');
            this.router.navigate(['/auth/login']);
            return of(false);
          })
        );
      }

      console.error('No refresh token available');
      return of(false);
    }

    return this.authApi.refreshToken(refreshToken).pipe(
      tap((response: AuthResponseDto) => {
        if (response.accessToken) {
          // Store both the new access token and refresh token
          this.storeTokens(response);

          // Update user state with the new token
          const decodedToken = jwtDecode<JwtPayload>(response.accessToken);
          this.updateUserState(decodedToken, response.accessToken);

          console.log('Token refreshed successfully');
        }
      }),
      map(() => true),
      catchError((error) => {
        console.error('Failed to refresh token:', error);
        // If refresh fails, clear auth data and force re-login
        this.clearAuthData();
        this.notification.displayNotification("Votre session a expiré. Veuillez vous reconnecter.", 'warning');
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}
