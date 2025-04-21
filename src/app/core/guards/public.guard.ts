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
    // Route souhaitant être accédée
    route: ActivatedRouteSnapshot,

    // Etat actuel du routeur
    state: RouterStateSnapshot
  ):
  // Types de retours flexibles permettant l'implémentation dans pluisieurs scénarios (peut-être too much)
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const targetUrl = state.url;
    console.log(`PublicGuard: Checking access for public URL: ${targetUrl}`);

    if (this.authService.isLoggedIn) {
      console.log(
        'PublicGuard: User is logged in. Preventing access to public route.'
      ); 
      this.notification.displayNotification(
        'Vous êtes déjà connecté.',
        'info',
        'Fermer'
      );

      const currentUser = this.authService.currentUserValue;
      let redirectUrl: string;

      if (currentUser?.needsStructureSetup === true) {
        redirectUrl = '/create-structure'; 
        console.log(
          `PublicGuard: Redirecting to ${redirectUrl} (needs setup).`
        ); 
      } else if (currentUser?.role === 'STRUCTURE_ADMINISTRATOR') {
        redirectUrl = '/admin';
        console.log(`PublicGuard: Redirecting to ${redirectUrl} (admin).`); 
      } else {
        redirectUrl = '/user'; 
        console.log(
          `PublicGuard: Redirecting to ${redirectUrl} (default/spectator).`
        );
      }
      return this.router.parseUrl(redirectUrl); 
    } else {
      // Non connecté, autoriser l'accès
      console.log('PublicGuard: User not logged in. Access GRANTED.'); 
      return true;
    }
  }
}