import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../services/domain/user/auth.service';
import {NotificationService} from '../services/domain/utilities/notification.service';
import {UserService} from '../services/domain/user/user.service';
import {UserRole} from '../models/user/user-role.enum';

@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  canActivate(
    // Route souhaitant être accédée
    route: ActivatedRouteSnapshot,

    // Etat actuel du routeur
    state: RouterStateSnapshot
  ):
  // Types de retours flexibles permettant l'implémentation dans plusieurs scénarios
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const targetUrl = state.url;
    console.log(`PublicGuard: Checking access for public URL: ${targetUrl}`);

    if (this.authService.isLoggedIn()) {
      console.log(
        'PublicGuard: User is logged in. Preventing access to public route.'
      );
      this.notification.displayNotification(
        'Vous êtes déjà connecté.',
        'info',
        'Fermer'
      );

      const currentUser = this.userService.currentUserProfileData();

      let redirectUrl: string;

      if (currentUser?.role === UserRole.STRUCTURE_ADMINISTRATOR) {
        redirectUrl = '/admin';
        console.log(`PublicGuard: Redirecting to ${redirectUrl} (admin).`);
      } else {
        redirectUrl = '';
        console.log(
          `PublicGuard: Redirecting to last url (default/spectator).`
        );
      }
      return this.router.createUrlTree([redirectUrl]);
    } else {
      // Non connecté, autoriser l'accès
      console.log('PublicGuard: User not logged in. Access GRANTED.');
      return true;
    }
  }
}
