/**
 * @file JWT HTTP Interceptor for adding authentication tokens to outgoing requests.
 * Automatically attaches Bearer token to HTTP requests when user is authenticated.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import { AuthService } from '../services/domain/user/auth.service';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * JWT HTTP interceptor function that adds Bearer token to requests.
 * Only adds the Authorization header if a valid token is available.
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

  // Clone the request and add Authorization header ONLY if a token exists
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }

  // Continue with original request if no token available
  return next(req);
};
