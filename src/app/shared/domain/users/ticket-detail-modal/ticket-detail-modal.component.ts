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

  ticket: TicketModel;
  isDownloading = signal(false);

  constructor(@Inject(MAT_DIALOG_DATA) public data: TicketDetailModalData) {
    this.ticket = data.ticket;
  }

  close(): void {
    this.dialogRef.close();
  }

  downloadPdf(): void {
    this.isDownloading.set(true);

    this.ticketService.prepareTicketPdfData(this.ticket.id).subscribe({
      next: (pdfData) => {
        if (pdfData) {
          // Ici, vous pourriez intégrer une bibliothèque de génération PDF
          // comme jsPDF ou utiliser un service backend pour générer le PDF
          this.generatePdfFromData(pdfData);
        }
        this.isDownloading.set(false);
      },
      error: () => {
        this.isDownloading.set(false);
      }
    });
  }

  private generatePdfFromData(pdfData: any): void {
    // Implémentation de la génération PDF
    // Pour l'instant, on simule le téléchargement
    const fileName = `billet-${this.ticket.eventSnapshot.name.replace(/\s+/g, '-')}-${this.ticket.id}.pdf`;
    console.log('Génération du PDF:', fileName, pdfData);

    // Simuler le téléchargement
    const link = document.createElement('a');
    link.download = fileName;
    // link.href = 'data:application/pdf;base64,' + pdfBase64; // À implémenter
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
    return new Date(this.ticket.eventSnapshot.startDate) > new Date();
  }
}
