import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
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

  // Tickets groupés par événement
  groupedTickets = computed(() => {
    const tickets = this.allTickets();
    const grouped = new Map<number, TicketModel[]>();

    tickets.forEach(ticket => {
      const eventId = ticket.eventId;
      if (!grouped.has(eventId)) {
        grouped.set(eventId, []);
      }
      grouped.get(eventId)!.push(ticket);
    });

    return grouped;
  });

  // Événements avec billets à venir
  upcomingEvents = computed(() => {
    const now = new Date();
    const events = new Map<number, TicketModel[]>();

    this.groupedTickets().forEach((tickets, eventId) => {
      const eventDate = new Date(tickets[0].eventSnapshot.startDate);
      if (eventDate > now) {
        const validTickets = tickets.filter(t => t.status === TicketStatus.VALID);
        if (validTickets.length > 0) {
          events.set(eventId, tickets);
        }
      }
    });

    // Convertir en tableau pour éviter l'erreur ExpressionChangedAfterItHasBeenCheckedError
    return events;
  });

  // Événements passés
  pastEvents = computed(() => {
    const now = new Date();
    const events = new Map<number, TicketModel[]>();

    this.groupedTickets().forEach((tickets, eventId) => {
      const eventDate = new Date(tickets[0].eventSnapshot.startDate);
      if (eventDate <= now || tickets.some(t => t.status === TicketStatus.USED || t.status === TicketStatus.EXPIRED)) {
        events.set(eventId, tickets);
      }
    });

    // Convertir en tableau pour éviter l'erreur ExpressionChangedAfterItHasBeenCheckedError
    return events;
  });

  ngOnInit(): void {
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTickets(): void {
    window.scrollTo({ top: 0, behavior: 'instant'});
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

  openEventTickets(tickets: TicketModel[]): void {
    const dialogRef = this.dialog.open(TicketDetailModalComponent, {
      width: 'auto',
      maxWidth: '800px',
      // maxHeight: '90vh',
      data: { ticket: tickets } // Passer la liste de billets
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'refresh') {
        this.loadTickets();
      }
    });
  }

  getEventTicketsSummary(tickets: TicketModel[]): string {
    const validCount = tickets.filter(t => t.status === TicketStatus.VALID).length;
    const total = tickets.length;

    if (validCount === total) {
      return `${total} billet${total > 1 ? 's' : ''}`;
    } else {
      return `${validCount}/${total} billet${total > 1 ? 's' : ''} valide${validCount > 1 ? 's' : ''}`;
    }
  }

  getMainEventStatus(tickets: TicketModel[]): TicketStatus {
    if (tickets.every(t => t.status === TicketStatus.VALID)) {
      return TicketStatus.VALID;
    } else if (tickets.some(t => t.status === TicketStatus.USED)) {
      return TicketStatus.USED;
    } else if (tickets.some(t => t.status === TicketStatus.CANCELLED)) {
      return TicketStatus.CANCELLED;
    } else {
      return TicketStatus.EXPIRED;
    }
  }

  // Méthodes utilitaires existantes...
  getStatusColor(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.VALID:
        return 'valid';
      case TicketStatus.USED:
        return 'used';
      case TicketStatus.CANCELLED:
        return 'canceled';
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
}
