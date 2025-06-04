import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {AuthService} from '../services/domain/user/auth.service';
import {NotificationService} from '../services/domain/utilities/notification.service';
import {UserRole} from '../models/user/user-role.enum';

export const AdminGuard: CanActivateFn = (state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const notification = inject(NotificationService);
  const router = inject(Router);
  const targetUrl = state.url.toString();

  console.log(`AdminGuard: Checking access for URL: ${targetUrl}`);

  if (!authService.isLoggedIn()) {
    console.log('AdminGuard: User not logged in. Redirecting to home.');
    notification.displayNotification(
      'Erreur : Vous devez être connecté pour accéder à cette page.',
      'error',
      'Fermer'
    );
    return router.createUrlTree(['']);
  }

  // Récupérer les données utilisateur depuis le token JWT (disponibles immédiatement)
  const currentUser = authService.currentUser();
  const needsStructureSetup = authService.needsStructureSetup();
  const userStructureId = authService.userStructureId();

  console.log('AdminGuard: Current user data:', {
    userId: currentUser?.userId,
    role: currentUser?.role,
    needsStructureSetup,
    userStructureId
  });

  // Vérifie si l'utilisateur a besoin de configurer sa structure et redirige vers la page appropriée
  if (needsStructureSetup && !targetUrl.includes('/create-structure')) {
    console.log('AdminGuard: User needs to set up structure. Redirecting to /create-structure.');
    return router.createUrlTree(['/create-structure']);
  } else if (!userStructureId) {
    console.log('AdminGuard: User is not associated with a structure. Redirecting to home.');
    notification.displayNotification(
      'Vous devez être associé à une structure pour accéder à l\'administration.',
      'warning'
    );
    return router.createUrlTree(['']);
  }

  // Autorisé si : (connecté ET n'a pas besoin de setup) OU (connecté ET a besoin de setup ET va vers la page de setup)
  console.log('AdminGuard: Access GRANTED.');
  return true;
};
