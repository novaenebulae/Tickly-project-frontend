/**
 * @file JWT HTTP Interceptor for adding authentication tokens to outgoing requests.
 * Automatically attaches Bearer token to HTTP requests when user is authenticated.
 * Handles token refresh on 401 errors and implements request queuing during refresh.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {AuthService} from '../services/domain/user/auth.service';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import {inject} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, filter, finalize, switchMap, take} from 'rxjs/operators';
import {APP_CONFIG} from '../config/app-config';

// Flag to track if a token refresh is in progress
let isRefreshing = false;

// Subject to notify queued requests when the token has been refreshed
const refreshTokenSubject = new BehaviorSubject<boolean>(false);

/**
 * JWT HTTP interceptor function that adds Bearer token to requests.
 * Only adds the Authorization header if a valid token is available.
 * Handles 401 errors by refreshing the token and retrying the request.
 * Implements request queuing to handle concurrent requests during token refresh.
 * @param req - The outgoing HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of the HTTP event
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Skip token handling for auth endpoints to avoid circular dependencies
  if (req.url.includes(APP_CONFIG.api.endpoints.auth.login) ||
    req.url.includes(APP_CONFIG.api.endpoints.auth.register) ||
    req.url.includes(APP_CONFIG.api.endpoints.auth.refreshToken ?? '')) {
    return next(req);
  }

  // Clone the request and add Authorization header ONLY if a token exists
  let clonedReq = req;
  if (token) {
    clonedReq = addTokenToRequest(req, token);
  }

  // Process the request and handle 401 errors
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handleUnauthorizedError(clonedReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Adds the Authorization header with the Bearer token to the request.
 * @param request - The original HTTP request
 * @param token - The JWT token
 * @returns A cloned request with the Authorization header
 */
function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Handles 401 Unauthorized errors by refreshing the token and retrying the request.
 * Implements request queuing to handle concurrent requests during token refresh.
 * @param request - The original HTTP request that failed with 401
 * @param next - The next handler in the interceptor chain
 * @param authService - The authentication service
 * @returns Observable of the HTTP event
 */
function handleUnauthorizedError(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> {
  // If we're not already refreshing the token
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(false);

    // Attempt to refresh the token
    return authService.refreshToken().pipe(
      switchMap((success: boolean) => {
        isRefreshing = false;

        if (success) {
          refreshTokenSubject.next(true);
          // Retry the request with the new token
          const newToken = authService.getToken();
          if (newToken) {
            return next(addTokenToRequest(request, newToken));
          }
        }

        // If refresh failed, propagate the error
        return throwError(() => new Error('Token refresh failed'));
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(false);
        // If refresh fails, logout and propagate the error
        authService.logout(true);
        return throwError(() => error);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  } else {
    // If a refresh is already in progress, queue the request until the token is refreshed
    return refreshTokenSubject.pipe(
      filter(refreshed => refreshed),
      take(1),
      switchMap(() => {
        const newToken = authService.getToken();
        if (newToken) {
          return next(addTokenToRequest(request, newToken));
        }
        return throwError(() => new Error('No token available after refresh'));
      })
    );
  }
}
