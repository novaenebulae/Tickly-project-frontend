import { AuthService } from './../services/auth.service';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core'; // Nécessaire pour injecter AuthService si besoin
import { Observable } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Récupérer le token via AuthService pour une meilleure encapsulation
  const authService = inject(AuthService); // Injecter le service
  const token = authService.getToken();

  // Cloner la requête et ajouter l'en-tête SEULEMENT si un token existe
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`, // Format standard Bearer
      },
    });
    // console.log('JWT Interceptor: Adding Authorization header', clonedReq.headers.get('Authorization'));
    return next(clonedReq); // Envoyer la requête CLONÉE
  }

  // Si pas de token, envoyer la requête ORIGINALE
  // console.log('JWT Interceptor: No token found, passing original request');
  return next(req); // <<<=== Important: 'next(req)' doit être EN DEHORS du 'if'
};
