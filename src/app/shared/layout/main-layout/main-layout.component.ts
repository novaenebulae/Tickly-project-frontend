import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

/**
 * Layout pour les pages publiques (non authentifiées)
 * Version simplifiée sans fonctionnalités d'authentification
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  // Composant simple - pas de logique particulière nécessaire
  // La navbar gère déjà l'état d'authentification de manière autonome
}
