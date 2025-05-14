import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {NotificationService} from './notification.service';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {tap, catchError, map} from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode';
import {JwtPayload} from '../models/JwtPayload.interface';
import {AuthResponseDto} from '../models/AuthResponse.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private notification = inject(NotificationService);
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<JwtPayload | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private readonly JWT_STORAGE_KEY = 'jwt_token';
  private apiUrl = 'http://localhost:8080';

  private keepLoggedIn: boolean = false;

  constructor() {
    this.checkInitialAuthState();
  }

  public get currentUserValue(): JwtPayload | null {
    return this.currentUserSubject.getValue();
  }

  public get isLoggedIn(): boolean {
    return this.isLoggedInSubject.getValue();
  }

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
        } else {
          console.log('AuthService: Token found but expired.');
          this.clearAuthData();
        }
      } catch (error) {
        console.error('AuthService: Error decoding initial token:', error);
        this.clearAuthData();
      }
    } else {
      this.isLoggedInSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }

  private handleAuthResponse(response: AuthResponseDto): void {
    console.log('AuthService: handleAuthResponse received:', response);
    if (response && response.token) {
      if (this.keepLoggedIn) {
        localStorage.setItem(this.JWT_STORAGE_KEY, response.token);
      } else {
        sessionStorage.setItem(this.JWT_STORAGE_KEY, response.token);
      }
      try {
        const decodedToken = jwtDecode<JwtPayload>(response.token);
        console.log('AuthService: Token decoded:', decodedToken);
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
        this.logout();
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

  public navigateBasedOnAuthState(decodedToken: JwtPayload): void {
    let targetUrl: string;

    if (decodedToken.needsStructureSetup === true) {
      targetUrl = '/create-structure';
      console.log(
        `AuthService: Navigating to ${targetUrl} (needsStructureSetup=true)`
      );
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
      console.log(
        `AuthService: Navigating to ${targetUrl} (role: ${decodedToken.role})`
      );
    }
    this.router.navigateByUrl(targetUrl).catch((err) => {
      console.error(`AuthService: Navigation to ${targetUrl} failed!`, err);
      this.notification.displayNotification(
        'Erreur de redirection interne.',
        'error',
        'Fermer'
      );
      this.logout();
    });
  }

  login(credentials: {
    email: string | null;
    password: string | null;
  }): Observable<void> {
    return this.http
      .post<AuthResponseDto>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.handleAuthResponse(response);
        }),
        map(() => void 0),
        catchError((error: HttpErrorResponse) =>
          this.handleAuthError(error, 'login')
        )
      );
  }

  register(userRegistrationDto: any): Observable<AuthResponseDto> {
    return this.http
      .post<AuthResponseDto>(`${this.apiUrl}/register`, userRegistrationDto)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleAuthError(error, 'register')
        )
      );
  }

  registerAndHandleAuth(userRegistrationDto: any): Observable<void> {
    return this.register(userRegistrationDto).pipe(
      tap((response) => {
        this.handleAuthResponse(response);
      }),
      map(() => void 0),
      catchError((err) => throwError(() => err))
    );
  }

  logout(): void {
    this.clearAuthData();
    this.notification.displayNotification(
      'Déconnexion réussie',
      'valid',
      'Fermer'
    );
    this.router.navigateByUrl('/home');
  }

  private clearAuthData(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  getToken(): string | null {
    this.keepLoggedIn = localStorage.getItem('keepLoggedIn') === 'true';
    return this.keepLoggedIn ? localStorage.getItem(this.JWT_STORAGE_KEY) : sessionStorage.getItem(this.JWT_STORAGE_KEY);
  }

  public updateTokenAndState(newToken: string): void {
    if (!newToken) {
      console.error(
        'AuthService: updateTokenAndState called with null or empty token.'
      );
      return;
    }
    if (this.keepLoggedIn) {
      localStorage.setItem(this.JWT_STORAGE_KEY, newToken);
    } else {
      sessionStorage.setItem(this.JWT_STORAGE_KEY, newToken);
    }
    try {
      const decodedToken = jwtDecode<JwtPayload>(newToken);
      this.currentUserSubject.next(decodedToken);
      console.log(
        'AuthService: Token and state updated successfully from new token.'
      );
    } catch (error) {
      console.error(
        'AuthService: Error decoding new token during update:',
        error
      );
      this.logout();
    }
  }

  needsStructureSetup(): boolean {
    return this.currentUserValue?.needsStructureSetup === true;
  }

  private handleAuthError(
    error: HttpErrorResponse,
    context: 'login' | 'register'
  ): Observable<never> {
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
    console.error(`${context} failed:`, error);
    this.notification.displayNotification(userMessage, 'error', 'Fermer');
    return throwError(() => new Error(userMessage));
  }
}
