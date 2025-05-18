import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { Event } from '../../../core/models/event.model'; // Ajustez le chemin si nécessaire

@Component({
  selector: 'app-event-list-item',
  templateUrl: './event-list-item.component.html',
  styleUrls: ['./event-list-item.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule
  ],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListItemComponent implements OnInit {
  @Input() event!: Event;

  constructor(
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (!this.event) {
      console.error('EventListItemComponent: Event input is missing.');
    }
  }

  viewEventDetails(event: MouseEvent): void {
    // Empêche la propagation si l'événement vient du bouton lui-même,
    // pour éviter une double navigation si le conteneur principal a aussi un (click).
    // Cependant, ici, nous mettons le (click) uniquement sur le conteneur principal
    // et le bouton. Si le bouton est cliqué, sa propre action (si définie) prendra le dessus.
    // Pour ce design, le bouton et l'item entier naviguent au même endroit.
    if (this.event && this.event.id) {
      this.router.navigate(['/events', this.event.id]);
    } else {
      console.warn('Cannot navigate to event details: eventId is undefined.');
    }
  }

  get formattedStartDate(): string {
    if (this.event && this.event.startDate) {
      // Exemple: "10 Juil. 2025 ・ 18:00"
      return this.datePipe.transform(this.event.startDate, 'dd MMM yyyy ・ HH:mm', '', 'fr') || '';
    }
    return 'Date non spécifiée';
  }

  get displayLocation(): string {
    if (this.event && this.event.locations && this.event.locations.length > 0) {
      const activeLocations = this.event.locations.filter(loc => loc.active && loc.name);
      if (activeLocations.length > 0) {
        return activeLocations[0].name;
      }
    }
    return ''; // Retourne une chaîne vide si pas de lieu pertinent pour ne pas afficher l'icône
  }

  /**
   * Récupère le prix minimum des billets pour l'événement
   * @returns Le prix minimum des billets actifs ou 0 si aucun billet n'est disponible
   */
  getMinTicketPrice(): number {
    if (!this.event || !this.event.locations || this.event.locations.length === 0) {
      return 0;
    }

    // Filtrer les emplacements actifs avec des prix de billets valides
    const activeLocationsWithPrices = this.event.locations
      .filter(location => location.active && location.ticketPrice !== null && location.ticketPrice !== undefined);

    // S'il n'y a pas d'emplacements actifs avec des prix, retourner 0
    if (activeLocationsWithPrices.length === 0) {
      return 0;
    }

    // Trouver le prix minimum parmi les emplacements actifs
    return Math.min(...activeLocationsWithPrices.map(location => location.ticketPrice as number));
  }

  // On arrête la propagation du clic si l'utilisateur clique spécifiquement sur le bouton,
  // car l'item entier est déjà cliquable.
  onButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    this.viewEventDetails(event);
  }
}
