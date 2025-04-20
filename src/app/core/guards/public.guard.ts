import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const targetUrl = state.url;
    console.log(`PublicGuard: Checking access for public URL: ${targetUrl}`); // LOG P1

    if (this.authService.isLoggedIn) {
      console.log(
        'PublicGuard: User is logged in. Preventing access to public route.'
      ); // LOG P2
      this.notification.displayNotification(
        'Vous êtes déjà connecté.',
        'info',
        'Fermer'
      );

      // Redirection appropriée
      const currentUser = this.authService.currentUserValue;
      let redirectUrl: string;

      if (currentUser?.needsStructureSetup === true) {
        redirectUrl = '/create-structure'; // Adapter
        console.log(
          `PublicGuard: Redirecting to ${redirectUrl} (needs setup).`
        ); // LOG P3a
      } else if (currentUser?.role === 'STRUCTURE_ADMINISTRATOR') {
        redirectUrl = '/admin';
        console.log(`PublicGuard: Redirecting to ${redirectUrl} (admin).`); // LOG P3b
      } else {
        redirectUrl = '/user'; // Ou autre page par défaut
        console.log(
          `PublicGuard: Redirecting to ${redirectUrl} (default/spectator).`
        ); // LOG P3c
      }
      // Utiliser router.parseUrl pour retourner UrlTree
      return this.router.parseUrl(redirectUrl); // <<<=== CHANGER ICI
      // this.router.navigate([redirectUrl]); // navigate retourne Promise<boolean>, pas idéal dans un guard synchrone
      // return false; // Empêcher l'accès à la page publique
    } else {
      // Non connecté, autoriser l'accès
      console.log('PublicGuard: User not logged in. Access GRANTED.'); // LOG P4
      return true;
    }
  }
}