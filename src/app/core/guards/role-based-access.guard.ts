import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/domain/user/auth.service';
import { NotificationService } from '../services/domain/utilities/notification.service';
import { UserRole } from '../models/user/user-role.enum';

/**
 * Configuration pour les accès basés sur les rôles
 */
export interface RoleAccessConfig {
  /** Rôles autorisés à accéder à la route */
  allowedRoles: UserRole[];
  /** Message d'erreur personnalisé si l'accès est refusé */
  deniedMessage?: string;
  /** Nom du guard pour les logs */
  guardName?: string;
}

/**
 * Guard générique qui protège les routes basées sur les rôles d'utilisateur.
 * Permet de définir quels rôles ont accès à quelles routes avec un système flexible.
 */
export function createRoleBasedGuard(config: RoleAccessConfig): CanActivateFn {
  return (route, state): boolean | UrlTree => {
    const authService = inject(AuthService);
    const notification = inject(NotificationService);
    const router = inject(Router);
    const targetUrl = state.url.toString();
    const guardName = config.guardName || 'RoleBasedGuard';

    console.log(`${guardName}: Checking access for URL: ${targetUrl}`);

    // Vérifier si l'utilisateur est connecté
    if (!authService.isLoggedIn()) {
      console.log(`${guardName}: User not logged in. Redirecting to home.`);
      notification.displayNotification(
        'Erreur : Vous devez être connecté pour accéder à cette page.',
        'error',
        'Fermer'
      );
      return router.createUrlTree(['']);
    }

    // Récupérer les données utilisateur
    const currentUser = authService.currentUser();
    const needsStructureSetup = authService.needsStructureSetup();
    const userStructureId = authService.userStructureId();

    console.log(`${guardName}: Current user data:`, {
      userId: currentUser?.userId,
      role: currentUser?.role,
      needsStructureSetup,
      structureId: currentUser?.structureId,
    });

    // Vérifier si l'utilisateur a un rôle autorisé
    const hasRequiredRole = currentUser?.role && config.allowedRoles.includes(currentUser.role);

    if (!hasRequiredRole) {
      console.log(`${guardName}: User does not have required role. Redirecting to home.`);
      const message = config.deniedMessage ||
        'Vous n\'avez pas les droits nécessaires pour accéder à cette page.';
      notification.displayNotification(message, 'warning', 'Fermer');
      return router.createUrlTree(['']);
    }

    // Gestion de la configuration de structure
    if (needsStructureSetup) {
      if (targetUrl.includes('/create-structure')) {
        console.log(`${guardName}: User going to structure creation. Access GRANTED.`);
        return true;
      } else {
        console.log(`${guardName}: User needs to set up structure. Redirecting to /create-structure.`);
        return router.createUrlTree(['/create-structure']);
      }
    }

    // Vérifier l'association à une structure
    if (!userStructureId) {
      console.log(`${guardName}: User is not associated with a structure. Redirecting to home.`);
      notification.displayNotification(
        'Vous devez être associé à une structure pour accéder à cette page.',
        'warning',
        'Fermer'
      );
      return router.createUrlTree(['']);
    }

    console.log(`${guardName}: Access GRANTED.`);
    return true;
  };
}

