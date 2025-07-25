import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Inject, OnInit, signal} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatChipsModule} from '@angular/material/chips';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterModule} from '@angular/router';

import {EventModel, EventStatus} from '../../../../core/models/event/event.model';
import {EventService} from '../../../../core/services/domain/event/event.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
    NgOptimizedImage,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Le template HTML reste le même, mais il faudra appeler les signaux comme des fonctions
  // Ex: *ngIf="loading()" et {{ event()?.name }}
  template: `
    <div class="event-details-modal">
      <div class="dialog-header">
      <h2 mat-dialog-title>
        {{ event()?.name || "Détails de l'événement" }}
      </h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div *ngIf="loading()" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Chargement des détails...</p>
        </div>

        <div *ngIf="!loading() && !event()" class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>Impossible de charger les détails de l'événement.</p>
        </div>

        <div *ngIf="!loading() && event() as currentEvent" class="event-content">
          <mat-tab-group>
            <mat-tab label="Informations">
              <div class="tab-content">
                <div class="event-header">
                  <div class="event-image" *ngIf="currentEvent.mainPhotoUrl">
                    <img ngSrc="{{currentEvent.mainPhotoUrl}}" [alt]="currentEvent.name" width="200" height="150" priority>
                  </div>
                  <div class="event-image placeholder" *ngIf="!currentEvent.mainPhotoUrl">
                    <mat-icon>image</mat-icon>
                  </div>

                  <div class="event-meta">
                    <div class="status-chip" [ngClass]="getStatusClass(currentEvent.status)">
                      {{ getStatusText(currentEvent.status) }}
                    </div>

                    <div class="event-dates">
                      <mat-icon>event</mat-icon>
                      <span>{{ currentEvent.startDate | date:'dd/MM/yyyy HH:mm' }}</span>
                      <span *ngIf="currentEvent.endDate"> - {{ currentEvent.endDate | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>

                    <div class="event-location" *ngIf="currentEvent.address">
                      <mat-icon>location_on</mat-icon>
                      <span>{{ currentEvent.address.street }}, {{ currentEvent.address.zipCode }} {{ currentEvent.address.city }}</span>
                    </div>

                    <div class="event-categories" *ngIf="currentEvent.categories && currentEvent.categories.length">
                      <mat-chip-set>
                        <mat-chip *ngFor="let category of currentEvent.categories">{{ category.name }}</mat-chip>
                      </mat-chip-set>
                    </div>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="event-description">
                  <h3>Description</h3>
                  <p>{{ currentEvent.fullDescription }}</p>
                </div>

                <div class="event-tags" *ngIf="currentEvent.tags && currentEvent.tags.length">
                  <h3>Tags</h3>
                  <mat-chip-set>
                    <mat-chip *ngFor="let tag of currentEvent.tags">{{ tag }}</mat-chip>
                  </mat-chip-set>
                </div>

                <div class="event-features">
                  <h3>Caractéristiques</h3>
                  <div class="feature-item">
                    <mat-icon>{{ currentEvent.displayOnHomepage ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>{{ getHomepageDisplayText(currentEvent.displayOnHomepage) }}</span>
                  </div>
                  <div class="feature-item">
                    <mat-icon>{{ currentEvent.isFeaturedEvent ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>{{ getFeaturedEventText(currentEvent.isFeaturedEvent) }}</span>
                  </div>
                </div>
              </div>
            </mat-tab>

            <mat-tab label="Zones d'audience" *ngIf="currentEvent.audienceZones && currentEvent.audienceZones.length">
              <div class="tab-content">
                <h3>Configuration des zones</h3>
                <div class="audience-zones">
                  <div class="zone-item" *ngFor="let zone of currentEvent.audienceZones">
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

            <mat-tab label="Galerie" *ngIf="currentEvent.eventPhotoUrls && currentEvent.eventPhotoUrls.length">
              <div class="tab-content">
                <div class="photo-gallery">
                  <div class="gallery-item" *ngFor="let photo of currentEvent.eventPhotoUrls">
                    <img ngSrc="{{photo}}" alt="Photo de l'événement" width="150" height="150">
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Fermer</button>

        <ng-container *ngIf="event() as currentEvent">
          <button
            mat-raised-button
            color="primary"
            *ngIf="canEditEvent()"
            [routerLink]="['/admin/event', currentEvent.id, 'edit']"
            mat-dialog-close
            matTooltip="Modifier les détails de l'événement">
            Modifier
          </button>
        </ng-container>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-header {
      display: flex;

      h2 {
        font-size: 32px; // Heading 1 size
        font-weight: 700; // Bold
        letter-spacing: -0.25px; // From design guidelines
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
      transition: var(--transition-fast);

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

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
      padding: var(--spacing-xl);
      text-align: center;
      color: var(--text-secondary);

      mat-icon {
        margin-bottom: var(--spacing-md);
        font-size: 48px;
        height: 48px;
        width: 48px;
      }

      p {
        font-size: 16px; // Body Default size
        letter-spacing: 0px; // From design guidelines
      }
    }

    .tab-content {
      padding: var(--spacing-md) 0;
    }

    .event-header {
      display: flex;
      margin-bottom: var(--spacing-md);

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    .event-image {
      width: 200px;
      height: 150px;
      overflow: hidden;
      border-radius: var(--border-radius-small);
      margin-right: var(--spacing-md);
      box-shadow: var(--shadow-sm);

      @media (max-width: 768px) {
        margin-bottom: var(--spacing-md);
        margin-right: 0;
        width: 100%;
        height: 180px;
      }
    }

    .event-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: var(--transition-medium);

      &:hover {
        transform: scale(1.05);
      }
    }

    .event-image.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--background);
    }

    .event-image.placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--border);
    }

    .event-meta {
      flex: 1;
    }

    .status-chip {
      display: inline-block;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-large);
      font-size: 14px; // Body Small size
      font-weight: 500; // Medium
      margin-bottom: var(--spacing-sm);
      letter-spacing: 0.1px; // From design guidelines
    }

    .status-draft {
      background-color: var(--background);
      color: var(--text-secondary);
    }

    .status-published {
      background-color: var(--success);
      color: white;
    }

    .status-cancelled {
      background-color: var(--error);
      color: white;
    }

    .event-dates, .event-location {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-sm);
      color: var(--text-secondary);
      font-size: 14px; // Body Small size
      letter-spacing: 0.1px; // From design guidelines
    }

    .event-dates mat-icon, .event-location mat-icon {
      margin-right: var(--spacing-sm);
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--primary);
    }

    .event-categories {
      margin-top: var(--spacing-sm);
    }

    .event-description, .event-tags, .event-features {
      margin: var(--spacing-md) 0;
    }

    .event-description h3, .event-tags h3, .event-features h3 {
      font-size: 20px; // Heading 3 size
      font-weight: 600; // SemiBold
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
      letter-spacing: 0px; // From design guidelines
    }

    .event-description p {
      color: var(--text-secondary);
      line-height: 1.5;
      font-size: 16px; // Body Default size
      letter-spacing: 0px; // From design guidelines
    }

    .feature-item {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-sm);
      color: var(--text-secondary);
      font-size: 14px; // Body Small size
      letter-spacing: 0.1px; // From design guidelines
    }

    .feature-item mat-icon {
      margin-right: var(--spacing-sm);
      color: var(--primary);
    }

    .audience-zones {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--spacing-md);

      @media (max-width: 576px) {
        grid-template-columns: 1fr;
      }
    }

    .zone-item {
      border: var(--border-width) solid var(--border);
      border-radius: var(--border-radius-small);
      padding: var(--spacing-md);
      background-color: var(--surface);
      box-shadow: var(--shadow-sm);
      transition: var(--transition-fast);

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
    }

    .zone-item h4 {
      margin-top: 0;
      margin-bottom: var(--spacing-sm);
      font-size: 16px; // Body Default size
      font-weight: 600; // SemiBold
      color: var(--text-primary);
      letter-spacing: 0px; // From design guidelines
    }

    .zone-details {
      display: flex;
      flex-direction: column;
    }

    .zone-detail {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-xs);
      color: var(--text-secondary);
      font-size: 14px; // Body Small size
      letter-spacing: 0.1px; // From design guidelines
    }

    .zone-detail mat-icon {
      margin-right: var(--spacing-sm);
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary);
    }

    .photo-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--spacing-md);
    }

    .gallery-item {
      height: 150px;
      overflow: hidden;
      border-radius: var(--border-radius-small);
      box-shadow: var(--shadow-sm);
      transition: var(--transition-fast);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: var(--transition-medium);

      &:hover {
        transform: scale(1.05);
      }
    }
  `]
})
export class EventDetailsModalComponent implements OnInit {
  private eventService = inject(EventService);
  private destroyRef = inject(DestroyRef);

  // Propriétés de classe remplacées par des signaux
  eventId = signal(0);
  event = signal<EventModel | undefined>(undefined);
  loading = signal(true);

  // Flags de permission transformés en signaux "computed"
  canManageEvent = computed(() => this.eventService.hasEventManagementPermission());
  canEditEvent = computed(() => {
    const currentEvent = this.event();
    return currentEvent ? this.eventService.canEditEvent(currentEvent) : false;
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { eventId: number }) {
    this.eventId.set(data.eventId);
  }

  ngOnInit(): void {
    this.loadEventDetails();
  }

  loadEventDetails(): void {
    this.loading.set(true);
    this.eventService.getEventById(this.eventId(), true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          this.event.set(event);
          this.loading.set(false);
        },
        error: () => {
          this.event.set(undefined);
          this.loading.set(false);
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

  getHomepageDisplayText(displayOnHomepage: boolean): string {
    return displayOnHomepage ? 'Affiché sur la page d\'accueil' : 'Non affiché sur la page d\'accueil';
  }

  getFeaturedEventText(isFeatured: boolean): string {
    return isFeatured ? 'Événement mis en avant' : 'Événement standard';
  }

  getZoneStatusText(isActive: boolean): string {
    return isActive ? 'Zone active' : 'Zone inactive';
  }
}
