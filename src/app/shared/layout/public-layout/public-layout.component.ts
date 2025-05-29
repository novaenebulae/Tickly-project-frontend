import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

/**
 * Layout pour les pages publiques (non authentifiées)
 * Version simplifiée sans fonctionnalités d'authentification
 */
@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet
  ],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent {
  // Composant simple - pas de logique particulière nécessaire
  // La navbar gère déjà l'état d'authentification de manière autonome
}
