import { Component, inject, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { EventModel, EventStatus } from '../../../../core/models/event/event.model';
import { EventService } from '../../../../core/services/domain/event/event.service';
import { AuthService } from '../../../../core/services/domain/user/auth.service';

/**
 * Modal component for displaying event details.
 * This component is used in the admin panel to view and manage event details.
 * It provides quick access to event information and actions based on user permissions.
 */
@Component({
  selector: 'app-event-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  template: `
    <div class="event-details-modal">
      <div class="dialog-header">
      <h2 mat-dialog-title>
        {{ event?.name || "Détails de l'événement" }}
      </h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Chargement des détails...</p>
        </div>

        <div *ngIf="!loading && !event" class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>Impossible de charger les détails de l'événement.</p>
        </div>

        <div *ngIf="!loading && event" class="event-content">
          <mat-tab-group>
            <!-- Informations générales -->
            <mat-tab label="Informations">
              <div class="tab-content">
                <div class="event-header">
                  <div class="event-image" *ngIf="event.mainPhotoUrl">
                    <img [src]="event.mainPhotoUrl" [alt]="event.name">
                  </div>
                  <div class="event-image placeholder" *ngIf="!event.mainPhotoUrl">
                    <mat-icon>image</mat-icon>
                  </div>

                  <div class="event-meta">
                    <div class="status-chip" [ngClass]="getStatusClass(event.status)">
                      {{ getStatusText(event.status) }}
                    </div>

                    <div class="event-dates">
                      <mat-icon>event</mat-icon>
                      <span>{{ event.startDate | date:'dd/MM/yyyy HH:mm' }}</span>
                      <span *ngIf="event.endDate"> - {{ event.endDate | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>

                    <div class="event-location" *ngIf="event.address">
                      <mat-icon>location_on</mat-icon>
                      <span>{{ event.address.street }}, {{ event.address.zipCode }} {{ event.address.city }}</span>
                    </div>

                    <div class="event-categories" *ngIf="event.categories && event.categories.length">
                      <mat-chip-set>
                        <mat-chip *ngFor="let category of event.categories">{{ category.name }}</mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="event-description">
                  <h3>Description</h3>
                  <p>{{ event.fullDescription }}</p>
                </div>

                <div class="event-tags" *ngIf="event.tags && event.tags.length">
                  <h3>Tags</h3>
                  <mat-chip-set>
                    <mat-chip *ngFor="let tag of event.tags">{{ tag }}</mat-chip>
                  </mat-chip-set>
                </div>

                <div class="event-features">
                  <h3>Caractéristiques</h3>
                  <div class="feature-item">
                    <mat-icon>{{ event.displayOnHomepage ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>{{ getHomepageDisplayText(event.displayOnHomepage) }}</span>
                  </div>
                  <div class="feature-item">
                    <mat-icon>{{ event.isFeaturedEvent ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>{{ getFeaturedEventText(event.isFeaturedEvent) }}</span>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Zones d'audience -->
            <mat-tab label="Zones d'audience" *ngIf="event.audienceZones && event.audienceZones.length">
              <div class="tab-content">
                <h3>Configuration des zones</h3>
                <div class="audience-zones">
                  <div class="zone-item" *ngFor="let zone of event.audienceZones">
                    <h4>{{ zone.name }}</h4>
                    <div class="zone-details">
                      <div class="zone-detail">
                        <mat-icon>people</mat-icon>
                        <span>Capacité: {{ zone.allocatedCapacity || 0 }} places</span>
                      </div>
                      <div class="zone-detail">
                        <mat-icon>event_seat</mat-icon>
                        <span>Type: {{ getSeatingTypeText(zone.seatingType) }}</span>
                      </div>
                      <div class="zone-detail">
                        <mat-icon>{{ zone.isActive ? 'check_circle' : 'cancel' }}</mat-icon>
                        <span>{{ getZoneStatusText(zone.isActive) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Galerie photos -->
            <mat-tab label="Galerie" *ngIf="event.eventPhotoUrls && event.eventPhotoUrls.length">
              <div class="tab-content">
                <div class="photo-gallery">
                  <div class="gallery-item" *ngFor="let photo of event.eventPhotoUrls">
                    <img [src]="photo" alt="Photo de l'événement">
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Fermer</button>

        <ng-container *ngIf="event && canManageEvent">

          <button
            mat-raised-button
            color="primary"
            *ngIf="canEditEvent"
            [routerLink]="['/admin/event', event.id, 'edit']"
            mat-dialog-close
            matTooltip="Modifier les détails de l'événement">
            Modifier
          </button>
        </ng-container>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`

    //mat-dialog-title {
    //  display: flex;
    //  justify-content: space-between;
    //  align-items: center;
    //  margin: 0 !important;
    //  padding: 0 !important;
    //  line-height: 1.2 !important;
    //  font-size: 1.25rem !important;
    //  min-height: auto !important;
    //}

    .dialog-header {
      display: flex;

      h2 {
        font-size: 2rem;
      }
    }

    mat-dialog-content {
      padding-top: 0 !important;
    }


    .close-button {
      margin-left: auto;
      height: 48px;
      width: 48px;
      transform: translate(-20%, 20%);

      .mat-icon {
        width: 48px;
        align-self: center;
      }
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    .tab-content {
      padding: 1rem 0;
    }

    .event-header {
      display: flex;
      margin-bottom: 1rem;
    }

    .event-image {
      width: 200px;
      height: 150px;
      overflow: hidden;
      border-radius: 4px;
      margin-right: 1rem;
    }

    .event-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .event-image.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
    }

    .event-image.placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .event-meta {
      flex: 1;
    }

    .status-chip {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 16px;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .status-draft {
      background-color: #e0e0e0;
      color: #616161;
    }

    .status-published {
      background-color: #c8e6c9;
      color: #2e7d32;
    }

    .status-cancelled {
      background-color: #ffcdd2;
      color: #c62828;
    }

    .event-dates, .event-location {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .event-dates mat-icon, .event-location mat-icon {
      margin-right: 0.5rem;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .event-categories {
      margin-top: 0.5rem;
    }

    .event-description, .event-tags, .event-features {
      margin: 1rem 0;
    }

    .feature-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .feature-item mat-icon {
      margin-right: 0.5rem;
    }

    .audience-zones {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .zone-item {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 1rem;
    }

    .zone-item h4 {
      margin-top: 0;
      margin-bottom: 0.5rem;
    }

    .zone-details {
      display: flex;
      flex-direction: column;
    }

    .zone-detail {
      display: flex;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .zone-detail mat-icon {
      margin-right: 0.5rem;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .photo-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .gallery-item {
      height: 150px;
      overflow: hidden;
      border-radius: 4px;
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `]
})
export class EventDetailsModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EventDetailsModalComponent>);
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  @Input() eventId!: number;

  event: EventModel | undefined;
  loading = true;

  // Permission flags
  get canManageEvent(): boolean {
    return this.eventService.hasEventManagementPermission();
  }

  get canEditEvent(): boolean {
    return this.event ? this.eventService.canEditEvent(this.event) : false;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { eventId: number }) {
    this.eventId = data.eventId;
  }

  ngOnInit(): void {
    this.loadEventDetails();
  }

  loadEventDetails(): void {
    this.loading = true;
    this.eventService.getEventById(this.eventId, true).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateStatus(status: EventStatus): void {
    if (!this.event) return;

    this.eventService.updateEventStatus(this.event.id!, status).subscribe({
      next: (updatedEvent) => {
        if (updatedEvent) {
          this.event = updatedEvent;
        }
      }
    });
  }

  getStatusClass(status: EventStatus | undefined): string {
    if (!status) return 'status-draft';

    switch (status) {
      case EventStatus.PUBLISHED:
        return 'status-published';
      case EventStatus.CANCELLED:
        return 'status-cancelled';
      case EventStatus.COMPLETED:
        return 'status-completed';
      case EventStatus.ARCHIVED:
        return 'status-archived';
      default:
        return 'status-draft';
    }
  }

  getStatusText(status: EventStatus | undefined): string {
    if (!status) return 'Brouillon';

    switch (status) {
      case EventStatus.PUBLISHED:
        return 'Publié';
      case EventStatus.DRAFT:
        return 'Brouillon';
      case EventStatus.CANCELLED:
        return 'Annulé';
      case EventStatus.COMPLETED:
        return 'Terminé';
      case EventStatus.ARCHIVED:
        return 'Archivé';
      default:
        return status;
    }
  }

  getSeatingTypeText(type: string | undefined): string {
    if (!type) return 'Non spécifié';

    switch (type) {
      case 'SEATED':
        return 'Places assises';
      case 'STANDING':
        return 'Debout';
      case 'MIXED':
        return 'Mixte';
      default:
        return type;
    }
  }

  /**
   * Méthodes d'aide pour éviter les expressions ternaires complexes dans le template
   */
  getEventTypeText(isFree: boolean): string {
    return isFree ? 'Événement gratuit' : 'Événement payant';
  }

  getHomepageDisplayText(displayOnHomepage: boolean): string {
    return displayOnHomepage ? 'Affiché sur la page d\'accueil' : 'Non affiché sur la page d\'accueil';
  }

  getFeaturedEventText(isFeatured: boolean): string {
    return isFeatured ? 'Événement mis en avant' : 'Événement standard';
  }

  getZoneStatusText(isActive: boolean): string {
    return isActive ? 'Zone active' : 'Zone inactive';
  }

  protected readonly EventStatus = EventStatus;
}
