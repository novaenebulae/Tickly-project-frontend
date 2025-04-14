import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string | null; password: string | null }) {
    return this.http.post('http://localhost:8080/login', credentials, {
      responseType: 'text',
    });
  }

  logout() {
    localStorage.removeItem('jwt');
    this.router.navigateByUrl('/login');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('jwt') !== null;
  }
}
