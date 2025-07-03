import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../../core/services/domain/user/auth.service';
import { EventService } from '../../../../core/services/domain/event/event.service';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';
import { EventModel } from '../../../../core/models/event/event.model';
import { UserRole } from '../../../../core/models/user/user-role.enum';

/**
 * Dialog data interface for event details modal.
 */
export interface EventDialogData {
  event: any; // CalendarEvent from angular-calendar
  action: string;
}

/**
 * Available actions in the event detail dialog.
 */
type DialogAction = 'view' | 'edit' | 'delete' | 'manage-participants';

/**
 * Event detail dialog component with role-based permissions.
 * Displays event information and available actions based on user role.
 */
@Component({
  selector: 'app-event-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './event-detail-dialog.component.html',
  styleUrl: './event-detail-dialog.component.scss'
})
export class EventDetailDialogComponent implements OnInit, OnDestroy {
  // Services injection
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private notification = inject(NotificationService);
  private dialogRef = inject(MatDialogRef<EventDetailDialogComponent>);
  private dialogData = inject<EventDialogData>(MAT_DIALOG_DATA);

  private destroy$ = new Subject<void>();

  // Component state
  private isLoadingSig = signal(false);
  private eventDetailsSig = signal<EventModel | null>(null);
  private errorStateSig = signal<string | null>(null);

  // Public readonly signals
  readonly isLoading = computed(() => this.isLoadingSig());
  readonly eventDetails = computed(() => this.eventDetailsSig());
  readonly errorState = computed(() => this.errorStateSig());
  readonly currentUserRole = this.authService.userRole;

  /**
   * Computed property for available actions based on user role.
   */
  readonly availableActions = computed(() => {
    const userRole = this.currentUserRole();
    const event = this.eventDetails();

    if (!userRole || !event) {
      return [];
    }

    const actions: DialogAction[] = [];

    switch (userRole) {
      case UserRole.STRUCTURE_ADMINISTRATOR:
        actions.push('view', 'edit', 'delete', 'manage-participants');
        break;

      case UserRole.ORGANIZATION_SERVICE:
        actions.push('view', 'edit', 'delete', 'manage-participants');
        break;

      case UserRole.RESERVATION_SERVICE:
        actions.push('view'); // Read-only access
        break;
    }

    return actions;
  });

  /**
   * Computed properties for action permissions.
   */
  readonly canEdit = computed(() => this.availableActions().includes('edit'));
  readonly canDelete = computed(() => this.availableActions().includes('delete'));
  readonly canManageParticipants = computed(() => this.availableActions().includes('manage-participants'));

  /**
   * Computed property for event display information.
   */
  readonly eventDisplayInfo = computed(() => {
    const event = this.eventDetails();
    if (!event) return null;

    return {
      title: event.name,
      category: event.categories,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.fullDescription || event.shortDescription,
      location: this.formatAddress(event.address),
      status: event.status,
      tags: event.tags || [],
      mainPhotoUrl: event.mainPhotoUrl
    };
  });

  ngOnInit(): void {
    this.loadEventDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads detailed event information from the service.
   */
  protected loadEventDetails(): void {
    const calendarEvent = this.dialogData.event;

    // Extract event ID from CalendarEvent
    const eventId = this.extractEventId(calendarEvent);

    if (!eventId) {
      this.errorStateSig.set('ID d\'événement invalide');
      return;
    }

    this.isLoadingSig.set(true);
    this.errorStateSig.set(null);

    this.eventService.getEventById(eventId, true).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (eventModel) => {
        this.isLoadingSig.set(false);
        if (eventModel) {
          this.eventDetailsSig.set(eventModel);
        } else {
          this.errorStateSig.set('Événement non trouvé');
        }
      },
      error: (error) => {
        this.isLoadingSig.set(false);
        this.errorStateSig.set('Erreur lors du chargement de l\'événement');
        console.error('Error loading event details:', error);
      }
    });
  }

  /**
   * Extracts event ID from CalendarEvent object.
   */
  private extractEventId(calendarEvent: any): number | null {
    // CalendarEvent might have the ID in different properties
    // Adapt based on your CalendarEvent structure
    if (calendarEvent?.id) {
      return typeof calendarEvent.id === 'number' ? calendarEvent.id : parseInt(calendarEvent.id, 10);
    }
    if (calendarEvent?.meta?.eventId) {
      return calendarEvent.meta.eventId;
    }
    return null;
  }

  /**
   * Formats address object to string.
   */
  private formatAddress(address: any): string {
    if (!address) return 'Adresse non spécifiée';

    const parts = [
      address.street,
      address.city,
      address.zipCode,
      address.country
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Adresse non spécifiée';
  }

  // === ACTION HANDLERS ===

  /**
   * Handles edit action.
   */
  onEdit(): void {
    if (!this.canEdit()) {
      this.notification.displayNotification('Action non autorisée', 'warning');
      return;
    }

    const event = this.eventDetails();
    if (!event) return;

    // Close current dialog and emit edit action
    this.dialogRef.close({
      action: 'edit',
      eventId: event.id,
      event: event
    });
  }

  /**
   * Handles delete action.
   */
  onDelete(): void {
    if (!this.canDelete()) {
      this.notification.displayNotification('Action non autorisée', 'warning');
      return;
    }

    const event = this.eventDetails();
    if (!event?.id) return;

    // Confirm deletion
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.name}" ?`)) {
      return;
    }

    this.isLoadingSig.set(true);

    this.eventService.deleteEvent(event.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (success) => {
        this.isLoadingSig.set(false);
        if (success) {
          this.notification.displayNotification('Événement supprimé avec succès', 'valid');
          this.dialogRef.close({
            action: 'delete',
            eventId: event.id,
            success: true
          });
        }
      },
      error: (error) => {
        this.isLoadingSig.set(false);
        console.error('Error deleting event:', error);
      }
    });
  }

  /**
   * Handles manage participants action.
   */
  onManageParticipants(): void {
    if (!this.canManageParticipants()) {
      this.notification.displayNotification('Action non autorisée', 'warning');
      return;
    }

    const event = this.eventDetails();
    if (!event) return;

    // Close current dialog and emit manage participants action
    this.dialogRef.close({
      action: 'manage-participants',
      eventId: event.id,
      event: event
    });
  }

  /**
   * Closes the dialog.
   */
  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Gets the status display color.
   */
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'primary';
      case 'cancelled': return 'warn';
      case 'completed': return 'accent';
      default: return '';
    }
  }
}
