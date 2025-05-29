import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../../core/services/domain/user/auth.service';

/**
 * Layout principal pour les utilisateurs connectés
 * Inclut la navbar, le contenu principal et le footer
 */
@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet
  ],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {
  // ✅ Injection moderne du service d'authentification
  private authService = inject(AuthService);

  // ✅ Accès direct aux signaux du service
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;

  constructor() {
    // ✅ Effect pour surveiller l'état d'authentification
    effect(() => {
      const isLoggedIn = this.isLoggedIn();
      if (!isLoggedIn) {
        // L'utilisateur n'est plus connecté - le guard de route s'occupera de la redirection
        console.log('UserLayout: Utilisateur déconnecté détecté');
      }
    });
  }
}
