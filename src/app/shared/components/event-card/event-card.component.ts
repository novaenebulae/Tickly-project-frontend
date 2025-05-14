import { Component, Input, OnInit, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { Router }
  from '@angular/router';
import {CurrencyPipe, DatePipe, SlicePipe}
  from '@angular/common';
import { Event, EventLocationConfig }
  from '../../../core/models/event.model';
import {MatRipple, MatRippleModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  providers: [DatePipe],
  imports: [
    CurrencyPipe,
    SlicePipe,
    MatRippleModule,
    MatIconModule,
    MatButtonModule
  ],
  // Fournit DatePipe localement pour ce composant
  changeDetection: ChangeDetectionStrategy.OnPush // Optimisation pour les composants basés sur les @Input
})
export class EventCardComponent implements OnInit {
  @Input() event!: Event; // L'événement à afficher, non null grâce à l'opérateur !

  constructor(private router: Router, private datePipe: DatePipe) {}

  ngOnInit(): void {
    if (!this.event) {
      console.error('EventCardComponent: Event input is missing.');
      // Vous pourriez initialiser this.event avec un objet par défaut ou lever une erreur
      // pour éviter les erreurs d'exécution si l'input n'est pas fourni.
    }
  }

  /**
   * Navigue vers la page de détail de l'événement.
   * @param eventId L'ID de l'événement.
   */
  viewEventDetails(eventId: number | undefined): void {
    if (eventId) {
      this.router.navigate(['/events', eventId]); // Assurez-vous que cette route existe
    } else {
      console.warn('Cannot navigate to event details: eventId is undefined.');
    }
  }

  /**
   * Retourne le nom du premier lieu actif de l'événement.
   * S'il y a plusieurs lieux actifs, indique "Plusieurs lieux".
   * Si aucun lieu actif, retourne "Lieu à déterminer".
   */
  get displayLocation(): string {
    if (this.event && this.event.locations && this.event.locations.length > 0) {
      const activeLocations = this.event.locations.filter(loc => loc.active);
      if (activeLocations.length > 1) {
        return 'Plusieurs lieux';
      }
      if (activeLocations.length === 1 && activeLocations[0].name) {
        return activeLocations[0].name;
      }
    }
    return 'Lieu à déterminer';
  }

  /**
   * Retourne le jour de la date de début formaté.
   */
  get formattedStartDateDay(): string {
    if (this.event && this.event.startDate) {
      return this.datePipe.transform(this.event.startDate, 'dd') || '';
    }
    return '';
  }

  /**
   * Retourne le mois de la date de début formaté (en majuscules).
   */
  get formattedStartDateMonth(): string {
    if (this.event && this.event.startDate) {
      const month = this.datePipe.transform(this.event.startDate, 'MMM');
      return month ? month.toUpperCase().replace('.', '') : ''; // Supprime le point pour certains formats de mois (ex: MAI.)
    }
    return '';
  }

  // Ajoute un HostListener pour simuler un effet de clic sur toute la carte si besoin,
  // ou gérer la navigation directement ici. Pour l'instant, le bouton gère la navigation.
  // @HostListener('click')
  // onCardClick(): void {
  //   if (this.event && this.event.id) {
  //     this.viewEventDetails(this.event.id);
  //   }
  // }
}
