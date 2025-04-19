import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';


export const LoginGuard: CanActivateFn = (route, state) => {
  
  const jwt = localStorage.getItem('jwt');
  const authService = inject(AuthService);
  const notification = inject(NotificationService);

    if (jwt == null && !authService.isLoggedIn) {
      const router: Router = inject(Router);
      notification.displayNotification(
        'Erreur : Vous ne pouvez pas accéder à cette page sans être connecté',
        'error',
        'Fermer'
      );
      return router.parseUrl('/login');
    }
    return true;
  }


