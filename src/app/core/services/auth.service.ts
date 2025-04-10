import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TEST_USER = {
    email: 'test@test.com',
    password: 'password',
  };

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    if (
      email === this.TEST_USER.email &&
      password === this.TEST_USER.password
    ) {
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/admin/dashboard']);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('isLoggedIn');
  }
}
