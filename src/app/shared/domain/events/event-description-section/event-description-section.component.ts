import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatDividerModule} from '@angular/material/divider';
import {EventModel} from '../../../../core/models/event/event.model';

@Component({
  selector: 'app-event-description-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './event-description-section.component.html',
  styleUrls: ['./event-description-section.component.scss']
})
export class EventDescriptionSectionComponent {
  @Input() event?: EventModel | null;

  // Description placeholder
  placeholderDescription = `
    <p>Rejoignez-nous pour une expérience culturelle exceptionnelle au cœur de la ville. Cet événement unique rassemble artistes et passionnés dans un cadre convivial et inspirant.</p>

    <p>Au programme :</p>
    <ul>
      <li>Performances artistiques en direct</li>
      <li>Ateliers participatifs pour tous les âges</li>
      <li>Exposition d'œuvres contemporaines</li>
      <li>Rencontres avec les artistes</li>
    </ul>

    <p>Que vous soyez amateur d'art ou simple curieux, vous trouverez votre bonheur dans cette programmation riche et variée. Chaque moment a été pensé pour créer des souvenirs inoubliables et des échanges enrichissants.</p>

    <p>Un espace restauration sera disponible sur place, proposant des produits locaux et de saison.</p>

    <p>N'attendez plus pour réserver vos billets et faire partie de cette aventure culturelle !</p>
  `;

  constructor() {}

  getDescription(): string {
    return this.event?.fullDescription || this.placeholderDescription;
  }
}
