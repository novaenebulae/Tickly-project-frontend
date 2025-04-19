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
  username: string | null = null;
  isLoggedIn = false;

  constructor(private http: HttpClient, private router: Router) {
    const jwt = localStorage.getItem('jwt');
    if (jwt !== null) {
      this.role = this.decodeJwt(jwt);
      if (this.isLoggedIn) {
          this.router.navigateByUrl(this.getRedirectionUrl(this.role));
      }
    }
  }

  decodeJwt(jwt: string) {
    const payload = jwt.split('.')[1];
    const payloadDecoded = atob(payload);
    const role = JSON.parse(payloadDecoded).role;
    return role;
  }

  getRedirectionUrl(role: string | null) {
    console.log(role);
    switch (role) {
      case 'STRUCTURE_ADMINISTRATOR':
        return '/admin';
      case 'SPECTATOR':
        return '/user';
      case 'PENDING_STRUCTURE_ADMINISTRATOR':
        return '/admin/create-structure';
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
          const payloadDecoded = JSON.parse(atob(jwt.split('.')[1]));
          this.role = payloadDecoded.role;
          this.username = payloadDecoded.user;
          
          localStorage.setItem('role', this.role ? this.role : '');
          localStorage.setItem('username', this.username ? this.username : '');

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
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.role = null;
    this.username = null;
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


