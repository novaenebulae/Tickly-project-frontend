import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';


export const LoginGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const notification = inject(NotificationService);
  const router = inject(Router);
  const targetUrl = state.url; // URL cible

  console.log(`LoginGuard: Checking access for URL: ${targetUrl}`); // LOG G1

  if (!authService.isLoggedIn) {
    console.log('LoginGuard: User not logged in. Redirecting to /login.'); // LOG G2
    notification.displayNotification(
      'Erreur : Vous devez être connecté pour accéder à cette page.',
      'error',
      'Fermer'
    );
    return router.parseUrl('/login');
  }


  // Autorisé si : (connecté ET n'a pas besoin de setup) OU (connecté ET a besoin de setup ET va vers la page de setup)
  console.log('LoginGuard: Access GRANTED.'); // LOG G5
  return true;
};


