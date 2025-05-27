/**
 * @file Domain service for authentication and user session management.
 * Handles login, registration, token management, and user state.
 * Composes AuthApiService for API interactions.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { Injectable, inject, signal, WritableSignal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Ensure 'jwt-decode' is installed

import { AuthApiService } from '../../api/auth/auth-api.service';
import { NotificationService } from '../utilities/notification.service';
import { APP_CONFIG } from '../../../config/app-config';
import { LoginCredentials, AuthResponseDto, JwtPayload } from '../../../models/auth/auth.model';
import { UserRegistrationDto } from '../../../models/user/user.model';
import { UserRole } from '../../../models/user/user-role.enum';
import { UserModel } from '../../../models/user/user.model'; // For refreshCurrentUserDataFromUpdatedProfile

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApi = inject(AuthApiService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  // private userService = inject(UserService); // Optional: if needed for deep cache clearing on logout

  // --- User State Signals ---
  private currentUserSig: WritableSignal<JwtPayload | null> = signal(null);
  public readonly currentUser = computed(() => this.currentUserSig());

  private isLoggedInSig: WritableSignal<boolean> = signal(false);
  public readonly isLoggedIn = computed(() => this.isLoggedInSig());

  private userRoleSig: WritableSignal<UserRole | null> = signal(null);
  public readonly userRole = computed(() => this.userRoleSig());

  private needsStructureSetupSig: WritableSignal<boolean> = signal(false);
  public readonly needsStructureSetup = computed(() => this.needsStructureSetupSig());

  private structureIdSig: WritableSignal<number | null> = signal(null);
  public readonly structureId = computed(() => this.structureIdSig());

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
        this.notification.displayNotification(error.message || "Échec de la connexion. Vérifiez vos identifiants.", 'error');
        return of(false);
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
        this.keepLoggedInSig.set(keepLoggedIn);
        localStorage.setItem(APP_CONFIG.auth.keepLoggedInKey, keepLoggedIn.toString());
        this.handleAuthResponse(response);
        this.notification.displayNotification("Inscription réussie ! Vous êtes maintenant connecté.", 'valid');
      }),
      map(() => true),
      catchError(error => {
        this.notification.displayNotification(error.message || "Échec de l'inscription. Veuillez réessayer.", 'error');
        return of(false);
      })
    );
  }

  /**
   * Logs out the current user, clears authentication data, and navigates to the login page.
   * @param navigateToLogin - Whether to navigate to the login page after logout (default: true).
   */
  logout(navigateToLogin = true): void {
    this.clearAuthData();
    // this.userService?.clearUserCacheOnLogout(); // Optional: if UserService needs specific cache clearing
    this.notification.displayNotification("Vous avez été déconnecté.", 'info');
    if (navigateToLogin) {
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Clears session-specific authentication data if the user did not opt to "keep logged in".
   * This is typically called by BrowserCloseService on `beforeunload`.
   * It only clears the session token, leaving localStorage token intact if "keepLoggedIn" was true.
   */
  public clearSessionDataIfNotKeptLoggedIn(): void {
    if (!this.keepLoggedInSig()) { // keepLoggedInSig reflects the choice made at login
      // Only clear session storage token and related session state
      sessionStorage.removeItem(APP_CONFIG.auth.tokenKey);

      // If the current state was loaded from session token, clear it
      const tokenInLocalStorage = localStorage.getItem(APP_CONFIG.auth.tokenKey);
      if (!tokenInLocalStorage) { // Implies current session was from sessionStorage
        this.currentUserSig.set(null);
        this.isLoggedInSig.set(false);
        this.userRoleSig.set(null);
        this.needsStructureSetupSig.set(false);
        this.structureIdSig.set(null);
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
    // This method will call AuthApiService.requestPasswordReset (to be created)
    return this.authApi.requestPasswordReset({ email }).pipe( // Assuming DTO {email: string}
      tap(() => {
        this.notification.displayNotification(
          "Si un compte existe pour cet email, un lien de réinitialisation de mot de passe a été envoyé.", // French
          'valid'
        );
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors de la demande de réinitialisation du mot de passe.", // French
          'error'
        );
        return throwError(() => error); // Rethrow for component handling if needed
      })
    );
  }

  /**
   * Requests a password change for the currently authenticated user.
   * The backend is expected to handle sending a password change/confirmation email.
   * @returns An Observable that completes on success or errors on failure.
   */
  requestPasswordChange(): Observable<void> {
    if (!this.isLoggedIn()) {
      this.notification.displayNotification("Vous devez être connecté pour demander un changement de mot de passe.", 'warning');
      return throwError(() => new Error('User not logged in'));
    }
    // This method will call AuthApiService.requestPasswordChange (to be created)
    return this.authApi.requestPasswordChange().pipe(
      tap(() => {
        this.notification.displayNotification(
          "Un email vous a été envoyé pour confirmer le changement de votre mot de passe.", // French
          'valid'
        );
      }),
      catchError(error => {
        this.notification.displayNotification(
          error.message || "Erreur lors de la demande de changement de mot de passe.", // French
          'error'
        );
        return throwError(() => error);
      })
    );
  }


  /**
   * Handles the authentication response by storing the token and updating user state.
   * @param response - The authentication response DTO from the API.
   */
  private handleAuthResponse(response: AuthResponseDto): void {
    this.storeToken(response.token);
    try {
      const decodedToken = jwtDecode<JwtPayload>(response.token);
      this.updateUserState(decodedToken, response.token);
      this.navigateAfterLogin(decodedToken);
    } catch (error) {
      console.error('Failed to decode token or update user state:', error);
      this.clearAuthData(); // Clear data if token is invalid
      this.notification.displayNotification("Erreur de session. Veuillez vous reconnecter.", 'error');
    }
  }

  /**
   * Stores the authentication token in localStorage or sessionStorage.
   * @param token - The JWT token string.
   */
  private storeToken(token: string): void {
    if (this.keepLoggedInSig()) {
      localStorage.setItem(APP_CONFIG.auth.tokenKey, token);
    } else {
      sessionStorage.setItem(APP_CONFIG.auth.tokenKey, token);
    }
  }

  /**
   * Retrieves the stored authentication token.
   * @returns The token string or null if not found.
   */
  private getToken(): string | null {
    return this.keepLoggedInSig()
      ? localStorage.getItem(APP_CONFIG.auth.tokenKey)
      : sessionStorage.getItem(APP_CONFIG.auth.tokenKey);
  }

  /**
   * Updates the user state signals based on the decoded JWT payload.
   * @param decodedToken - The decoded JWT payload.
   * @param token - The raw JWT token string (optional, for re-storing if needed).
   */
  private updateUserState(decodedToken: JwtPayload, token?: string): void {
    this.currentUserSig.set(decodedToken);
    this.isLoggedInSig.set(true);
    this.userRoleSig.set(decodedToken.role as UserRole); // Assuming role in token matches UserRole enum
    this.needsStructureSetupSig.set(decodedToken.needsStructureSetup || false);
    this.structureIdSig.set(decodedToken.structureId || null);

    if (token) { // Ensure token is stored according to keepLoggedIn preference
      this.storeToken(token);
    }
  }

  /**
   * Updates the authentication token and user state.
   * Useful after operations that might return a new token (e.g., structure creation).
   * @param newToken - The new JWT token.
   */
  public updateTokenAndState(newToken: string): void {
    try {
      const decodedToken = jwtDecode<JwtPayload>(newToken);
      this.storeToken(newToken); // Store first
      this.updateUserState(decodedToken, newToken); // Then update state
      this.notification.displayNotification("Session mise à jour.", 'info');
    } catch (error) {
      console.error('Failed to update token and state:', error);
      this.logout(); // Log out if the new token is invalid
      this.notification.displayNotification("Erreur de mise à jour de session. Veuillez vous reconnecter.", 'error');
    }
  }

  /**
   * Clears all authentication-related data from storage and service state.
   */
  private clearAuthData(): void {
    localStorage.removeItem(APP_CONFIG.auth.tokenKey);
    sessionStorage.removeItem(APP_CONFIG.auth.tokenKey);
    // Don't clear keepLoggedInKey here, as it's a user preference
    // localStorage.removeItem(APP_CONFIG.auth.keepLoggedInKey); // Only if you want to reset this on manual logout

    this.currentUserSig.set(null);
    this.isLoggedInSig.set(false);
    this.userRoleSig.set(null);
    this.needsStructureSetupSig.set(false);
    this.structureIdSig.set(null);
  }

  /**
   * Navigates the user to the appropriate page after successful login.
   * @param decodedToken - The decoded JWT payload.
   */
  private navigateAfterLogin(decodedToken: JwtPayload): void {
    if (decodedToken.needsStructureSetup) {
      this.router.navigate(['/structure/create']); // Or your structure setup route
    } else if (decodedToken.role === UserRole.STRUCTURE_ADMINISTRATOR || decodedToken.role === UserRole.RESERVATION_SERVICE || decodedToken.role === UserRole.ORGANIZATION_SERVICE) {
      this.router.navigate(['/admin/dashboard']); // Or your admin dashboard route
    } else {
      this.router.navigate(['/dashboard']); // Default dashboard for regular users
    }
  }

  /**
   * Allows UserService to notify AuthService to refresh its currentUserSig
   * if profile details (like name, avatar) that might be in JwtPayload are updated.
   * This is a simple refresh; more complex scenarios might require re-fetching/re-decoding a token.
   * @param updatedProfile - The partially updated UserModel.
   */
  refreshCurrentUserDataFromUpdatedProfile(updatedProfile: Partial<UserModel>): void {
    const currentUser = this.currentUserSig();
    if (currentUser && currentUser.userId === updatedProfile.id) {
      // Create a new object for the signal to trigger change detection
      const updatedPayload: JwtPayload = { ...currentUser };

      // Update fields if they exist in JwtPayload and were changed
      // Assuming JwtPayload might contain firstName, lastName for display purposes
      if (updatedProfile.firstName && 'firstName' in updatedPayload) {
        (updatedPayload as any).firstName = updatedProfile.firstName;
      }
      if (updatedProfile.lastName && 'lastName' in updatedPayload) {
        (updatedPayload as any).lastName = updatedProfile.lastName;
      }
      // Add other updatable fields present in JwtPayload as needed

      this.currentUserSig.set(updatedPayload);
    }
  }

  /**
   * Checks if the current user has a specific role or one of an array of roles.
   * @param expectedRole - A single UserRole or an array of UserRoles.
   * @returns True if the current user has the expected role(s), false otherwise.
   */
  hasRole(expectedRole: UserRole | UserRole[]): boolean {
    const currentRole = this.userRole();
    if (!currentRole) {
      return false;
    }
    if (Array.isArray(expectedRole)) {
      return expectedRole.includes(currentRole);
    }
    return currentRole === expectedRole;
  }
}
