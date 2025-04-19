import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class PublicGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private notification: NotificationService) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (localStorage.getItem('jwt') !== null) {
      this.notification.displayNotification(
        "Vous êtes déja connecté, déconnectez vous pour continuer",
        'error',
        'Fermer'
      );
      return this.router.createUrlTree([this.authService.getRedirectionUrl(this.authService.role)])
    } else {
      return true;
    }
  }
}
