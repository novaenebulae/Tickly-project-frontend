import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Pour les routerLink
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Si vous utilisez des icônes Material pour le logo ou autre

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true, // Ce composant sera standalone
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  logoUrl: string = 'logos/tickly-logo.svg'; // Chemin vers votre logo (version claire pour fond sombre)

  // Liens de navigation du footer
  footerNavLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Tous les événements', path: '/events' }, // Mettez à jour avec vos routes réelles
    { label: 'Toutes les structures', path: '/structures' } // Mettez à jour avec vos routes réelles
  ];

  // Liens légaux
  legalLinks = [
    { label: 'Mentions Légales', path: '/legal-mentions' }, // Mettez à jour avec vos routes réelles
    { label: 'Politique RGPD', path: '/rgpd-policy' } // Mettez à jour avec vos routes réelles
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
