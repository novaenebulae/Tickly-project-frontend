/**
 * @file Service for API configuration and utilities.
 * Centralizes the management of headers, URLs, and mock mode.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';

import {APP_CONFIG} from '../../config/app-config';
import {environment} from '../../../../environments/environment';

/**
 * Service for API configuration and utilities.
 * Centralizes the management of headers, URLs, and mock mode.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  /**
   * The base URL for the API, obtained from the environment or default config.
   */
  readonly apiUrl: string;

  constructor(public http: HttpClient) {
    // Use the API URL from the environment or the default config
    this.apiUrl = environment.apiUrl || APP_CONFIG.api.baseUrl;
  }

  /**
   * Creates HTTP headers with content type and authorization if a token is available.
   * @param additionalHeaders - Optional additional headers to include.
   * @returns HttpHeaders - The constructed HTTP headers.
   */
  createHeaders(additionalHeaders: Record<string, string> = {}): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...additionalHeaders
    });
  }

  /**
   * Crée les en-têtes HTTP pour les requêtes FormData, incluant l'autorisation mais sans 'Content-Type'.
   * HttpClient d'Angular définira automatiquement 'Content-Type' à 'multipart/form-data' avec le bon boundary.
   * @returns HttpHeaders Les en-têtes HTTP construits.
   */
  createFormDataHeaders(): HttpHeaders {
    return new HttpHeaders();
  }

  /**
   * Constructs the full URL for an API endpoint.
   * @param endpoint - The endpoint path (without leading slash).
   * @returns The full API URL.
   */
  getUrl(endpoint: string): string {
    // Ensure the endpoint does not start with a slash (avoid double slashes)
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.apiUrl}/${normalizedEndpoint}`;
  }

  /**
   * Checks if mocks are enabled globally.
   */
  get isMockEnabled(): boolean {
    return environment.useMocks && APP_CONFIG.mock.enabled;
  }

  /**
   * Checks if mocks are enabled for a specific domain.
   * @param domain - The functional domain (auth, events, structures).
   */
  isMockEnabledForDomain(domain: 'auth' | 'events' | 'structures' | 'ticketing' | 'friendship'| 'users' | 'team' | 'statistics'): boolean {
    return this.isMockEnabled && APP_CONFIG.mock[domain];
  }

  /**
   * Creates an Observable that simulates an API response delay for mocks.
   * @param data - The data to return.
   * @returns An Observable that emits the data after a delay.
   */
  createMockResponse<T>(data: T): Observable<T> {
    return of(data).pipe(
      delay(environment.mockDelay || APP_CONFIG.mock.delay)
    );
  }

  /**
   * Logs API requests in development mode.
   * @param method - The HTTP method.
   * @param url - The URL of the request.
   * @param body - The request body (optional).
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
   * Logs API responses in development mode.
   * @param method - The HTTP method.
   * @param url - The URL of the request.
   * @param response - The API response.
   */
  logApiResponse(method: string, url: string, response: any): void {
    if (environment.enableDebugLogs) {
      console.log(`[API Response] ${method} ${url}`, response);
    }
  }

  /**
   * Logs API errors in development mode.
   * @param method - The HTTP method.
   * @param url - The URL of the request.
   * @param error - The API error.
   */
  logApiError(method: string, url: string, error: any): void {
    if (environment.enableDebugLogs) {
      console.error(`[API Error] ${method} ${url}`, error);
    }
  }


}
