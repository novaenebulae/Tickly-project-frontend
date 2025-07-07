import {Component, DestroyRef, Inject, inject, OnDestroy, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
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
    MatProgressSpinner
  ],
  templateUrl: './ticket-detail-modal.component.html',
  styleUrls: ['./ticket-detail-modal.component.scss']
})
export class TicketDetailModalComponent {
  private ticketService = inject(TicketService);
  private dialogRef = inject(MatDialogRef<TicketDetailModalComponent>);

  // Subject pour gérer les souscriptions
  private destroyRef = inject(DestroyRef);

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

  downloadAllPdfs(): void {
    this.isDownloading.set(true);

    const ticketIds = this.tickets.map(ticket => ticket.id);

    this.ticketService.downloadMultipleTicketsPdf(ticketIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.isDownloading.set(false);
      },
      error: () => {
        this.isDownloading.set(false);
      }
    });
  }

  downloadSinglePdf(ticket: TicketModel): void {
    this.ticketService.downloadTicketPdf(ticket.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Le téléchargement est géré par le service PDF
        },
        error: () => {
          console.error('Erreur lors du téléchargement du PDF');
        }
      });
  }


  private generatePdfFromData(pdfData: any, ticket: TicketModel): void {
    const fileName = `billet-${this.eventInfo.name.replace(/\s+/g, '-')}-${ticket.participant.firstName}-${ticket.id.slice(-6)}.pdf`;
    console.log('Génération du PDF:', fileName, pdfData);

    const link = document.createElement('a');
    link.download = fileName;
    link.click();
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
