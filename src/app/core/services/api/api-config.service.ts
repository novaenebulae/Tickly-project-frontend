// src/app/core/services/api/api-config.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { APP_CONFIG } from '../../config/app-config';
import { environment} from '../../../../environments/environment';

/**
 * Service de configuration et d'utilitaires pour les appels API
 * Centralise la gestion des en-têtes, des URLs et du mode mock
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  readonly apiUrl: string;

  constructor(public http: HttpClient) {
    // Utilise l'URL de l'API depuis l'environnement ou la config par défaut
    this.apiUrl = environment.apiUrl || APP_CONFIG.api.baseUrl;
  }

  /**
   * Crée des en-têtes HTTP avec authentification si un token est disponible
   */
  createHeaders(additionalHeaders: Record<string, string> = {}): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...additionalHeaders
    });

    const token = this.getAuthToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Récupère le token d'authentification
   */
  private getAuthToken(): string | null {
    const keepLoggedIn = localStorage.getItem(APP_CONFIG.auth.keepLoggedInKey) === 'true';
    return keepLoggedIn
      ? localStorage.getItem(APP_CONFIG.auth.tokenKey)
      : sessionStorage.getItem(APP_CONFIG.auth.tokenKey);
  }

  /**
   * Construit l'URL complète pour un endpoint API
   * @param endpoint Chemin de l'endpoint (sans slash initial)
   */
  getUrl(endpoint: string): string {
    // Assure que l'endpoint n'a pas de slash au début (évite doubles slashes)
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.apiUrl}/${normalizedEndpoint}`;
  }

  /**
   * Vérifie si les mocks sont activés globalement
   */
  get isMockEnabled(): boolean {
    return environment.useMocks && APP_CONFIG.mock.enabled;
  }

  /**
   * Vérifie si les mocks sont activés pour un domaine spécifique
   * @param domain Domaine fonctionnel (auth, events, structures)
   */
  isMockEnabledForDomain(domain: 'auth' | 'events' | 'structures'): boolean {
    return this.isMockEnabled && APP_CONFIG.mock[domain];
  }

  /**
   * Crée une observable qui simule un délai de réponse API pour les mocks
   * @param data Données à retourner
   */
  createMockResponse<T>(data: T): Observable<T> {
    return of(data).pipe(
      delay(environment.mockDelay || APP_CONFIG.mock.delay)
    );
  }

  /**
   * Crée une erreur simulée pour les mocks
   * @param status Code HTTP de l'erreur
   * @param message Message d'erreur
   */
  createMockError(status: number, message: string): Observable<never> {
    // Simule un délai avant de retourner l'erreur
    return throwError(() => ({
      status,
      error: { message }
    })).pipe(
      delay(environment.mockDelay || APP_CONFIG.mock.delay)
    );
  }

  /**
   * Construit les paramètres HTTP à partir d'un objet
   * @param params Objet contenant les paramètres à envoyer
   */
  createHttpParams(params: Record<string, any> = {}): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          httpParams = httpParams.set(key, value.toISOString());
        } else if (Array.isArray(value)) {
          // Gérer les tableaux (peut varier selon l'API)
          value.forEach(item => {
            httpParams = httpParams.append(`${key}[]`, item.toString());
          });
        } else {
          httpParams = httpParams.set(key, value.toString());
        }
      }
    });

    return httpParams;
  }

  /**
   * Journalise les requêtes API en développement
   * @param method Méthode HTTP
   * @param url URL de la requête
   * @param body Corps de la requête (optionnel)
   */
  logApiRequest(method: string, url: string, body?: any): void {
    if (environment.enableDebugLogs) {
      console.log(`[API Request] ${method} ${url}`);
      if (body) {
        console.log('[API Request Body]', body);
      }
    }
  }

  /**
   * Journalise les réponses API en développement
   * @param method Méthode HTTP
   * @param url URL de la requête
   * @param response Réponse de l'API
   */
  logApiResponse(method: string, url: string, response: any): void {
    if (environment.enableDebugLogs) {
      console.log(`[API Response] ${method} ${url}`, response);
    }
  }

  /**
   * Journalise les erreurs API en développement
   * @param method Méthode HTTP
   * @param url URL de la requête
   * @param error Erreur de l'API
   */
  logApiError(method: string, url: string, error: any): void {
    if (environment.enableDebugLogs) {
      console.error(`[API Error] ${method} ${url}`, error);
    }
  }
}
