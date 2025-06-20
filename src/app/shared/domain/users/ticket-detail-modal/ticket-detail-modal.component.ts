import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { QRCodeComponent } from 'angularx-qrcode';

import {TicketModel} from '../../../../core/models/tickets/ticket.model';
import {TicketStatus} from '../../../../core/models/tickets/ticket-status.enum';
import {TicketService} from '../../../../core/services/domain/ticket/ticket.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

export interface TicketDetailModalData {
  ticket: TicketModel;
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

    // Télécharger tous les billets
    const downloadPromises = this.tickets.map(ticket =>
      this.ticketService.prepareTicketPdfData(ticket.id).toPromise()
    );

    Promise.all(downloadPromises).then((pdfDataArray) => {
      pdfDataArray.forEach((pdfData, index) => {
        if (pdfData) {
          this.generatePdfFromData(pdfData, this.tickets[index]);
        }
      });
      this.isDownloading.set(false);
    }).catch(() => {
      this.isDownloading.set(false);
    });
  }

  downloadSinglePdf(ticket: TicketModel): void {
    this.ticketService.prepareTicketPdfData(ticket.id).subscribe({
      next: (pdfData) => {
        if (pdfData) {
          this.generatePdfFromData(pdfData, ticket);
        }
      },
      error: () => {
        console.error('Erreur lors du téléchargement du PDF');
      }
    });
  }

  private generatePdfFromData(pdfData: any, ticket: TicketModel): void {
    const fileName = `billet-${this.eventInfo.name.replace(/\s+/g, '-')}-${ticket.participantInfo.firstName}-${ticket.id.slice(-6)}.pdf`;
    console.log('Génération du PDF:', fileName, pdfData);

    const link = document.createElement('a');
    link.download = fileName;
    link.click();
  }

  getStatusColor(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.VALID:
        return 'primary';
      case TicketStatus.USED:
        return 'accent';
      case TicketStatus.CANCELLED:
        return 'warn';
      case TicketStatus.EXPIRED:
        return '';
      default:
        return '';
    }
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

  formatDate(date: Date | string): string {
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

  getValidTicketsCount(): number {
    return this.tickets.filter(ticket => ticket.status === TicketStatus.VALID).length;
  }
}
