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
  const userStructureId = authService.userStructureId();

  console.log('AdminGuard: Current user data:', {
    userId: currentUser?.userId,
    role: currentUser?.role,
    structureId: currentUser?.structureId,
  });

  // Vérifier que l'utilisateur a le rôle d'administrateur
  if (currentUser?.role !== UserRole.STRUCTURE_ADMINISTRATOR) {
    console.log('AdminGuard: User is not a structure administrator. Redirecting to home.');
    notification.displayNotification(
      'Vous devez être administrateur d\'une structure pour accéder à cette page.',
      'warning',
      'Fermer'
    );
    return router.createUrlTree(['']);
  }

  // Si l'utilisateur n'a pas de structure associée (et n'a pas besoin de setup)
  if (!userStructureId) {
    console.log('AdminGuard: User is not associated with a structure. Redirecting to home.');
    notification.displayNotification(
      'Vous devez être associé à une structure pour accéder à l\'administration.',
      'warning',
      'Fermer'
    );
    return router.createUrlTree(['']);
  }

  // Si l'utilisateur essaie d'accéder à la configuration alors qu'il a déjà une structure
  if (targetUrl.includes('/create-structure') && userStructureId) {
    console.log('AdminGuard: User already has a structure. Redirecting to admin dashboard.');
    return router.createUrlTree(['/admin']);
  }

  // Autorisé : utilisateur admin avec structure
  console.log('AdminGuard: Access GRANTED.');
  return true;
};
