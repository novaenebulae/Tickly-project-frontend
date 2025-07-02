import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EventDetailsModalComponent } from './event-details-modal.component';

/**
 * Service for opening the event details modal.
 * This service provides a convenient way to open the event details modal from any component.
 */
@Injectable({
  providedIn: 'root'
})
export class EventDetailsModalService {
  private dialog = inject(MatDialog);

  /**
   * Opens the event details modal for the specified event.
   * @param eventId - The ID of the event to display.
   * @returns A reference to the opened dialog.
   */
  openEventDetailsModal(eventId: number): MatDialogRef<EventDetailsModalComponent> {
    return this.dialog.open(EventDetailsModalComponent, {
      data: { eventId },
      width: '800px',
      maxHeight: '90vh',
      panelClass: 'event-details-dialog'
    });
  }
}
