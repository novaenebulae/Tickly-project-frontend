import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Inject,
  inject,
  OnDestroy,
  signal
} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {QRCodeComponent} from 'angularx-qrcode';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {TicketModel} from '../../../../core/models/tickets/ticket.model';
import {TicketStatus} from '../../../../core/models/tickets/ticket-status.enum';
import {TicketService} from '../../../../core/services/domain/ticket/ticket.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export interface TicketDetailModalData {
  ticket: TicketModel | TicketModel[];
}

@Component({
  selector: 'app-ticket-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    QRCodeComponent,
    NgOptimizedImage
  ],
  templateUrl: './ticket-detail-modal.component.html',
  styleUrls: ['./ticket-detail-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketDetailModalComponent {
  private ticketService = inject(TicketService);
  private dialogRef = inject(MatDialogRef<TicketDetailModalComponent>);

  // Subject pour gérer les souscriptions
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  tickets: TicketModel[] = [];
  eventInfo: any;
  isDownloading = signal(false);

  constructor(@Inject(MAT_DIALOG_DATA) public data: TicketDetailModalData) {
    if (Array.isArray(data.ticket)) {
      this.tickets = data.ticket;
      this.eventInfo = this.tickets[0]?.eventSnapshot;
    } else {
      this.tickets = [data.ticket];
      this.eventInfo = data.ticket.eventSnapshot;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  downloadSinglePdf(ticket: TicketModel): void {
    this.ticketService.downloadTicketPdf(ticket.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          console.error('Erreur lors du téléchargement du PDF');
        }
      });
  }

  getStatusLabel(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.VALID:
        return 'Valide';
      case TicketStatus.USED:
        return 'Utilisé';
      case TicketStatus.CANCELLED:
        return 'Annulé';
      case TicketStatus.EXPIRED:
        return 'Expiré';
      default:
        return status;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isEventUpcoming(): boolean {
    return new Date(this.eventInfo.startDate) > new Date();
  }

  hasValidTickets(): boolean {
    return this.tickets.some(ticket => ticket.status === TicketStatus.VALID);
  }

}
