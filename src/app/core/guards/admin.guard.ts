import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {AuthService} from '../services/domain/user/auth.service';
import {NotificationService} from '../services/domain/utilities/notification.service';
import {UserService} from '../services/domain/user/user.service';
import {UserModel} from '../models/user/user.model';
import {UserRole} from '../models/user/user-role.enum';

export const AdminGuard: CanActivateFn = (state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
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

  // Récupérer le profil utilisateur courant
  const currentUser = userService.currentUserProfileData();

  // Vérifie si l'utilisateur a besoin de configurer sa structure et redirige vers la page appropriée
  if (currentUser?.needsStructureSetup && !targetUrl.includes('/create-structure')) {
    console.log('AdminGuard: User needs to set up structure. Redirecting to /create-structure.');
    return router.createUrlTree(['/create-structure']);
  } else if (!currentUser?.structureId) {
    console.log('AdminGuard: User is not associated with a structure. Redirecting to home.');
    return router.createUrlTree(['']);
  }

  // Autorisé si : (connecté ET n'a pas besoin de setup) OU (connecté ET a besoin de setup ET va vers la page de setup)
  console.log('AdminGuard: Access GRANTED.');
  return true;
};


