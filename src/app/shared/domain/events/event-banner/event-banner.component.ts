// src/app/shared/components/event-details/event-banner/event-banner.component.ts

import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {CommonModule, DatePipe, Location} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterModule} from '@angular/router';
import {format} from 'date-fns';
import {fr} from 'date-fns/locale';

import {EventModel, EventStatus, EventSummaryModel} from '../../../../core/models/event/event.model';
import {StructureService} from '../../../../core/services/domain/structure/structure.service';

@Component({
  selector: 'app-event-banner',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './event-banner.component.html',
  styleUrls: ['./event-banner.component.scss']
})
export class EventBannerComponent implements OnChanges {
  @Input() event!: EventModel | EventSummaryModel;
  @Input() showNav: boolean = true;
  @Output() bookEvent = new EventEmitter<void>();

  private location = inject(Location);
  private structureService = inject(StructureService);

  // Propriétés calculées
  formattedDate: string = '';
  formattedTime: string = '';
  structureName: string = '';
  statusInfo: { label: string, class: string, icon: string } = {
    label: '',
    class: '',
    icon: ''
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event) {
      this.formatDateTime();
      this.setStatusInfo();
    }
  }

  /**
   * Formatte la date et l'heure de l'événement
   */
  private formatDateTime(): void {
    if (this.event.startDate) {
      // Formatter la date (ex: "Lundi 15 juin 2023")
      this.formattedDate = format(new Date(this.event.startDate), 'EEEE d MMMM yyyy', { locale: fr });

      // Formatter l'heure (ex: "20:00")
      this.formattedTime = format(new Date(this.event.startDate), 'HH:mm');
    }
  }



  /**
   * Configure les informations de statut en fonction du statut de l'événement
   */
  private setStatusInfo(): void {
    switch (this.event.status) {
      case 'PUBLISHED':
        this.statusInfo = {
          label: 'Places disponibles',
          class: 'status-available',
          icon: 'event_available'
        };
        break;
      case 'CANCELLED':
        this.statusInfo = {
          label: 'Annulé',
          class: 'status-cancelled',
          icon: 'event_busy'
        };
        break;
      case 'COMPLETED':
        this.statusInfo = {
          label: 'Terminé',
          class: 'status-completed',
          icon: 'event_available'
        };
        break;
      case 'DRAFT':
        this.statusInfo = {
          label: 'Brouillon',
          class: 'status-draft',
          icon: 'edit'
        };
        break;
      default:
        this.statusInfo = {
          label: 'Places disponibles',
          class: 'status-available',
          icon: 'event_available'
        };
    }
  }

  /**
   * Vérifie si l'événement est réservable (statut publié et date future)
   */
  get isBookable(): boolean {
    if (!this.event) return false;

    const isPublished = this.event.status === EventStatus.PUBLISHED;
    const isFutureEvent = new Date(this.event.startDate) > new Date();

    return isPublished && isFutureEvent;
  }

  /**
   * Retourne une URL d'image par défaut si aucune image principale n'est définie
   */
  getEventImageUrl(): string {
    return this.event.mainPhotoUrl || 'assets/images/event-placeholder.jpg';
  }

  /**
   * Méthode pour retourner à la page précédente
   */
  goBack(): void {
    this.location.back();
  }

  /**
   * Méthode appelée lorsque l'utilisateur clique sur le bouton "Réserver"
   */
  onBookEvent(): void {
    if (this.isBookable) {
      this.bookEvent.emit();
    }
  }
}
