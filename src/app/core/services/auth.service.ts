import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  notification = inject(NotificationService);
  role: string | null = null;
  id: number | null = null;
  isLoggedIn = false;

  constructor(private http: HttpClient, private router: Router) {
    const jwt = localStorage.getItem('jwt');
    if (jwt !== null) {
      this.decodeJwt(jwt);
    }
  }

  decodeJwt(jwt: string) {
    const payload = jwt.split('.')[1];
    const payloadDecoded = atob(payload);
    const role = JSON.parse(payloadDecoded).role;
    return role;
  }

  getRedirectionUrl(role: string | null) {
    switch (role) {
      case 'STRUCTURE_ADMINISTRATOR':
        return '/staff';
      case 'SPECTATOR':
        return '/spectator';
      case 'PENDING_STRUCTURE_ADMINISTRATOR':
        return '/staff/create-structure';
      default:
        return '/login';
    }
  }

  // getUserInfos() {
  //   this.http.get('http://localhost:8080/api/users/' + this.id)
  //   .subscribe((user: any) => {
  //     this.name = user.role;
  //   });
  // }
  

  login(credentials: { email: string | null; password: string | null }) {
    this.http
      .post('http://localhost:8080/login', credentials, {
        responseType: 'text',
      })
      .subscribe({
        next: (jwt) => {
          localStorage.setItem('jwt', jwt);
          this.role = this.decodeJwt(jwt);
          this.id = this.decodeJwt(jwt);
          this.isLoggedIn = true;
          this.notification.displayNotification(
            'Connexion réussie',
            'valid',
            'Fermer'
          );
          this.router.navigateByUrl(this.getRedirectionUrl(this.role));
        },
        error: (error) => {
          if (error.status === 401) {
            this.notification.displayNotification(
              "Erreur d'authentification",
              'error',
              'Fermer'
            );
          }
        },
      });
  }

  logout() {
    localStorage.removeItem('jwt');
    this.role = null;
    this.isLoggedIn = false;
    this.notification.displayNotification(
      'Déconnexion réussie',
      'valid',
      'Fermer'
    );
    this.router.navigateByUrl('/login');
  }

  register(userRegistrationDto: any): Observable<any> {
    return this.http.post(
      `http://localhost:8080/register`,
      userRegistrationDto
    );
  }
}


