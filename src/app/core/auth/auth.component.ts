import { jwtInterceptor } from './../interceptors/jwt.interceptor';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  formBuilder = inject(FormBuilder);
  http = inject(HttpClient);
  router: Router = inject(Router);
  authService = inject(AuthService);

  formulaire = this.formBuilder.group({
    email: ['admin@example.com', [Validators.required, Validators.email]],
    password: ['rootroot', Validators.required],
  });

  ngOnInit() {
    if (this.authService.isLoggedIn) {
      this.router.navigateByUrl(this.authService.getRedirectionUrl(this.authService.role));
    }
  }

  onLogin() {
    if (this.formulaire.valid) {
      const credentials = {
        email: this.formulaire.value.email || null,
        password: this.formulaire.value.password || null,
      };

      this.authService.login(credentials);
    }
  }

  onLogout() {
    this.authService.logout();
  }
}
