import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TicketApiService} from '../../../core/services/api/ticket/ticket-api.service';
import {TicketPdfService} from '../../../core/services/domain/ticket/ticket-pdf.service';
import {TicketModel} from '../../../core/models/tickets/ticket.model';
import {TicketPdfDataDto} from '../../../core/models/tickets/reservation.model';
import {NotificationService} from '../../../core/services/domain/utilities/notification.service';

import '@angular/common/locales/global/fr';


@Component({
  selector: 'app-public-ticket',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './public-ticket.component.html',
  styleUrl: './public-ticket.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicTicketComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketApiService = inject(TicketApiService);
  private ticketPdfService = inject(TicketPdfService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  isLoading = signal(true);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);
  ticket = signal<TicketModel | null>(null);

  ngOnInit(): void {
    // Get the ticket ID from the route parameters
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const ticketId = params['ticketId'];
        if (ticketId) {
          this.fetchTicket(ticketId);
        } else {
          this.handleError('Identifiant de billet manquant dans l\'URL');
        }
        this.cdRef.markForCheck();
      });
  }

  /**
   * Fetches the ticket data from the API
   * @param ticketId - The ID of the ticket to fetch
   */
  private fetchTicket(ticketId: string): void {
    this.ticketApiService.getPublicTicketById(ticketId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ticketData) => {
          this.ticket.set(ticketData);
          this.generateTicketPdf(ticketData);
          this.cdRef.markForCheck();
        },
        error: (error) => {
          this.handleError(error.message || 'Impossible de récupérer les informations du billet.');
          this.cdRef.markForCheck();
        }
      });
  }

  /**
   * Generates a PDF for the ticket
   * @param ticketData - The ticket data
   */
  private generateTicketPdf(ticketData: TicketModel): void {
    // Create a TicketPdfDataDto from the TicketModel
    const pdfData: TicketPdfDataDto = {
      id: ticketData.id,
      qrCodeValue: ticketData.qrCodeValue,
      status: ticketData.status,
      participant: ticketData.participant,
      eventSnapshot: ticketData.eventSnapshot,
      audienceZoneSnapshot: ticketData.audienceZoneSnapshot,
      structureSnapshot: ticketData.structureSnapshot,
      structureName: ticketData.structureSnapshot?.name || '',
      organizerLogoUrl: ticketData.structureSnapshot?.logoUrl
    };

    this.ticketPdfService.generateSingleTicketPdf(pdfData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSuccess.set(true);
          this.cdRef.markForCheck();
        },
        error: (error) => {
          this.handleError('Erreur lors de la génération du PDF: ' + error);
          this.cdRef.markForCheck();
        }
      });
  }

  /**
   * Handles errors
   * @param message - The error message
   */
  private handleError(message: string): void {
    this.isLoading.set(false);
    this.isSuccess.set(false);
    this.errorMessage.set(message);
    this.notification.displayNotification(message, 'error');
  }

  /**
   * Navigates to the home page
   */
  navigateToHome(): void {
    this.router.navigate(['/home']);
  }
}
