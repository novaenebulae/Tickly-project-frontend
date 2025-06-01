import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TicketService } from '../../../../core/services/domain/ticket/ticket.service';
import { TicketModel } from '../../../../core/models/tickets/ticket.model';
import { TicketStatus } from '../../../../core/models/tickets/ticket-status.enum';
import {
  TicketDetailModalComponent
} from '../../../../shared/domain/users/ticket-detail-modal/ticket-detail-modal.component';

@Component({
  selector: 'app-user-tickets-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './user-tickets-page.component.html',
  styleUrls: ['./user-tickets-page.component.scss']
})
export class UserTicketsPage implements OnInit, OnDestroy {
  private ticketService = inject(TicketService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  // État de l'application
  allTickets = computed(() => this.ticketService.myTickets());
  isLoading = signal(true);

  // Tickets filtrés par statut et date
  upcomingTickets = computed(() => {
    const now = new Date();
    return this.allTickets().filter(ticket =>
      new Date(ticket.eventSnapshot.startDate) > now &&
      (ticket.status === TicketStatus.VALID)
    );
  });

  pastTickets = computed(() => {
    const now = new Date();
    return this.allTickets().filter(ticket =>
      new Date(ticket.eventSnapshot.startDate) <= now ||
      ticket.status === TicketStatus.USED ||
      ticket.status === TicketStatus.EXPIRED
    );
  });

  cancelledTickets = computed(() => {
    return this.allTickets().filter(ticket => ticket.status === TicketStatus.CANCELLED);
  });

  ngOnInit(): void {
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTickets(): void {
    this.isLoading.set(true);

    this.ticketService.loadMyTickets(true).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openTicketDetail(ticket: TicketModel): void {
    const dialogRef = this.dialog.open(TicketDetailModalComponent, {
      width: '90vw',
      maxWidth: '600px',
      data: { ticket }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'refresh') {
        this.loadTickets();
      }
    });
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

  formatEventDate(date: Date | string): string {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isEventUpcoming(date: Date | string): boolean {
    return new Date(date) > new Date();
  }
}
