import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {AuthService} from '../services/domain/user/auth.service';
import {NotificationService} from '../services/domain/utilities/notification.service';
import {UserService} from '../services/domain/user/user.service';
import {UserModel} from '../models/user/user.model';

export const LoginGuard: CanActivateFn = (state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const notification = inject(NotificationService);
  const router = inject(Router);
  const targetUrl = state.url.toString();

  console.log(`LoginGuard: Checking access for URL: ${targetUrl}`);

  if (!authService.isLoggedIn()) {
    console.log('LoginGuard: User not logged in. Redirecting to /login.');
    notification.displayNotification(
      'Erreur : Vous devez être connecté pour accéder à cette page.',
      'error',
      'Fermer'
    );
    return router.createUrlTree(['/login']);
  }

  // Autorisé si : (connecté ET n'a pas besoin de setup) OU (connecté ET a besoin de setup ET va vers la page de setup)
  console.log('LoginGuard: Access GRANTED.');
  return true;
};
