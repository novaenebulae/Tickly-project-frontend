import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Installer : npm install jwt-decode
import { JwtPayload } from '../models/JwtPayload.interface';
import { AuthResponseDto } from '../models/AuthResponse.interface';





@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Injections via inject() pattern (ou via constructeur si préféré)
  private notification = inject(NotificationService);
  private http = inject(HttpClient);
  private router = inject(Router);

  // --- State Management with BehaviorSubject ---
  private currentUserSubject = new BehaviorSubject<JwtPayload | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  // --------------------------------------------

  private readonly JWT_STORAGE_KEY = 'jwt_token'; // Clé unique pour localStorage
  private apiUrl = 'http://localhost:8080'; // URL base de votre API

  constructor() {
    this.checkInitialAuthState(); // Vérifier l'état au démarrage
  }

  /** Récupère l'utilisateur actuel (payload décodé). */
  public get currentUserValue(): JwtPayload | null {
    return this.currentUserSubject.getValue();
  }

  /** Indique si l'utilisateur est actuellement connecté. */
  public get isLoggedIn(): boolean {
    return this.isLoggedInSubject.getValue();
  }

  /** Vérifie l'état d'authentification initial basé sur le token stocké. */
  private checkInitialAuthState(): void {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        const isExpired = (decodedToken.exp ?? 0) * 1000 < Date.now();

        if (!isExpired) {
          this.currentUserSubject.next(decodedToken);
          this.isLoggedInSubject.next(true);
          console.log('AuthService: User restored from token.', decodedToken);
          // La redirection initiale est mieux gérée par les guards ou le composant racine
        } else {
          console.log('AuthService: Token found but expired.');
          this.clearAuthData(); // Nettoyer si expiré
        }
      } catch (error) {
        console.error('AuthService: Error decoding initial token:', error);
        this.clearAuthData(); // Nettoyer si invalide
      }
    } else {
      this.isLoggedInSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }

  /**
   * Gère la réponse réussie de /login ou /register.
   * Stocke le token, décode, met à jour l'état, et navigue.
   * @param response La réponse du backend.
   */
  private handleAuthResponse(response: AuthResponseDto): void {
    console.log('AuthService: handleAuthResponse received:', response); // LOG 1
    if (response && response.token) {
      localStorage.setItem(this.JWT_STORAGE_KEY, response.token);
      try {
        const decodedToken = jwtDecode<JwtPayload>(response.token);
        console.log('AuthService: Token decoded:', decodedToken); // LOG 2
        this.currentUserSubject.next(decodedToken);
        this.isLoggedInSubject.next(true);
        this.notification.displayNotification(
          'Authentification réussie',
          'valid',
          'Fermer'
        );
        this.navigateBasedOnAuthState(decodedToken);
      } catch (error) {
        console.error('Error decoding token after auth:', error);
        this.logout(); // Déconnecter en cas d'erreur
        this.notification.displayNotification(
          'Erreur interne lors du traitement du token.',
          'error',
          'Fermer'
        );
      }
    } else {
      console.error('Invalid AuthResponseDto received:', response);
      this.notification.displayNotification(
        "Réponse invalide du serveur d'authentification.",
        'error',
        'Fermer'
      );
    }
  }

  /**
   * Navigue vers la page appropriée basé sur le payload du token.
   * Priorise needsStructureSetup si présent et true.
   * @param decodedToken Le payload JWT décodé.
   */
  public navigateBasedOnAuthState(decodedToken: JwtPayload): void {
    let targetUrl: string; // Pour logger l'URL cible

    if (decodedToken.needsStructureSetup === true) {
      targetUrl = '/create-structure'; // Adapter si besoin
      console.log(
        `AuthService: Navigating to ${targetUrl} (needsStructureSetup=true)`
      ); // LOG 3a
    } else {
      switch (decodedToken.role) {
        case 'STRUCTURE_ADMINISTRATOR':
          targetUrl = '/admin';
          break;
        case 'SPECTATOR':
          targetUrl = '/user';
          break;
        default:
          targetUrl = '/login'; // Fallback
          console.warn(`Unknown role for redirection: ${decodedToken.role}`);
      }
      console.log(
        `AuthService: Navigating to ${targetUrl} (role: ${decodedToken.role})`
      ); // LOG 3b
    }
    // Exécuter la navigation
    this.router.navigateByUrl(targetUrl).catch((err) => {
      console.error(`AuthService: Navigation to ${targetUrl} failed!`, err); // LOG 4: Erreur de navigation
      // Que faire si la navigation échoue ? Peut-être rediriger vers login ?
      this.notification.displayNotification(
        'Erreur de redirection interne.',
        'error',
        'Fermer'
      );
      this.logout(); // Sécurité
    });
  }

  /**
   * Tente de connecter l'utilisateur.
   * Attend AuthResponseDto du backend.
   */
  login(credentials: {
    email: string | null;
    password: string | null;
  }): Observable<void> {
    return this.http
      .post<AuthResponseDto>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.handleAuthResponse(response); // Gérer la réponse en cas de succès
        }),
        map(() => void 0), // Transformer en Observable<void> pour le composant
        catchError((error: HttpErrorResponse) =>
          this.handleAuthError(error, 'login')
        )
      );
  }

  /**
   * Enregistre un nouvel utilisateur.
   * Attend AuthResponseDto du backend car l'inscription connecte aussi.
   */
  register(userRegistrationDto: any): Observable<AuthResponseDto> {
    return this.http
      .post<AuthResponseDto>(`${this.apiUrl}/register`, userRegistrationDto)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleAuthError(error, 'register')
        )
      );
  }

  /**
   * Méthode combinée pour s'inscrire ET gérer la réponse d'authentification.
   * C'est celle à utiliser depuis RegisterComponent.
   */
  registerAndHandleAuth(userRegistrationDto: any): Observable<void> {
    return this.register(userRegistrationDto).pipe(
      tap((response) => {
        this.handleAuthResponse(response); // Gérer la réponse comme pour le login
      }),
      map(() => void 0), // Transformer en Observable<void>
      // L'erreur est déjà gérée par le catchError de register(), mais on la propage
      catchError((err) => throwError(() => err))
    );
  }

  /** Déconnecte l'utilisateur. */
  logout(): void {
    this.clearAuthData();
    this.notification.displayNotification(
      'Déconnexion réussie',
      'valid',
      'Fermer'
    );
    this.router.navigateByUrl('/login'); // Rediriger vers la page de connexion
  }

  /** Nettoie les données d'authentification (token, état). */
  private clearAuthData(): void {
    localStorage.removeItem(this.JWT_STORAGE_KEY);
    // Effacer aussi les anciennes clés si elles existent encore
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  /** Récupère le token actuel. */
  getToken(): string | null {
    return localStorage.getItem(this.JWT_STORAGE_KEY);
  }

  /**
   * Met à jour le token JWT stocké et l'état interne de l'utilisateur.
   * Appelé après une opération qui modifie l'état pertinent de l'utilisateur (ex: création structure).
   * @param newToken Le nouveau token JWT reçu du backend.
   */
  public updateTokenAndState(newToken: string): void {
    if (!newToken) {
      console.error(
        'AuthService: updateTokenAndState called with null or empty token.'
      );
      return; // Ne rien faire si le token est invalide
    }
    localStorage.setItem(this.JWT_STORAGE_KEY, newToken);
    try {
      const decodedToken = jwtDecode<JwtPayload>(newToken);
      // Mettre à jour l'état interne avec le nouveau payload
      this.currentUserSubject.next(decodedToken);
      // isLoggedInSubject reste true
      console.log(
        'AuthService: Token and state updated successfully from new token.'
      );
      // La navigation est généralement gérée par le composant appelant après cet appel
    } catch (error) {
      console.error(
        'AuthService: Error decoding new token during update:',
        error
      );
      // Si le nouveau token est invalide, déconnecter l'utilisateur est le plus sûr
      this.logout();
    }
  }

  /** Vérifie si l'utilisateur doit configurer sa structure. */
  needsStructureSetup(): boolean {
    return this.currentUserValue?.needsStructureSetup === true;
  }

  /** Gère les erreurs HTTP communes pour /login et /register. */
  private handleAuthError(
    error: HttpErrorResponse,
    context: 'login' | 'register'
  ): Observable<never> {
    let userMessage: string;
    if (error.status === 401 && context === 'login') {
      // Unauthorized
      userMessage = 'Email ou mot de passe incorrect.';
    } else if (error.status === 409 && context === 'register') {
      // Conflict (Email exists)
      // Utiliser le message du backend s'il existe, sinon un message générique
      userMessage =
        typeof error.error === 'string'
          ? error.error
          : error.error?.message || 'Cette adresse email est déjà utilisée.';
    } else if (error.status === 400) {
      // Bad Request (Validation)
      // Essayer d'extraire des détails de validation si le backend les fournit
      userMessage =
        error.error?.message ||
        'Données invalides. Veuillez vérifier les champs.';
    } else {
      // Autres erreurs (500, réseau, etc.)
      userMessage =
        'Une erreur technique est survenue. Veuillez réessayer plus tard.';
    }
    console.error(`${context} failed:`, error);
    this.notification.displayNotification(userMessage, 'error', 'Fermer');
    return throwError(() => new Error(userMessage)); // Renvoyer l'erreur
  }
}
