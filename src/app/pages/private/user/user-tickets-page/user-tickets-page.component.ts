import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

import {TicketService} from '../../../../core/services/domain/ticket/ticket.service';
import {TicketModel} from '../../../../core/models/tickets/ticket.model';
import {TicketStatus} from '../../../../core/models/tickets/ticket-status.enum';
import {
  TicketDetailModalComponent
} from '../../../../shared/domain/users/ticket-detail-modal/ticket-detail-modal.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs/operators';

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
  styleUrls: ['./user-tickets-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTicketsPage implements OnInit {
  private ticketService = inject(TicketService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  // État de l'application
  allTickets = computed(() => this.ticketService.myTickets());
  isLoading = signal(true);

  // Tickets groupés par événement
  groupedTickets = computed(() => {
    const tickets = this.allTickets();
    const grouped = new Map<number, TicketModel[]>();

    tickets.forEach(ticket => {
      const eventId = ticket.eventSnapshot.eventId;
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

    return events;
  });

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    window.scrollTo({ top: 0, behavior: 'instant'});
    this.isLoading.set(true);

    this.ticketService.loadMyTickets(true).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
      this.isLoading.set(false);
      this.cdRef.markForCheck();
      })
    ).subscribe();
  }

  /**
   * Télécharge le PDF pour tous les billets d'un événement
   */
  downloadAllPdfs(tickets: TicketModel[]): void {
    this.isLoading.set(true);

    const ticketIds = tickets.map(ticket => ticket.id);

    this.ticketService.downloadMultipleTicketsPdf(ticketIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.cdRef.markForCheck();
        },
        error: () => {
          this.isLoading.set(false);
          this.cdRef.markForCheck();
        }
      });
  }

  /**
   * Télécharge le PDF pour un événement spécifique depuis la carte
   */
  downloadEventPdfsFromCard(event: Event, tickets: TicketModel[]): void {
    event.stopPropagation(); // Empêche l'ouverture de la modal
    this.downloadAllPdfs(tickets);
  }

  openEventTickets(tickets: TicketModel[]): void {
    const dialogRef = this.dialog.open(TicketDetailModalComponent, {
      width: 'auto',
      maxWidth: '800px',
      data: { ticket: tickets }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
      if (result?.action === 'refresh') {
        this.loadTickets();
        this.cdRef.markForCheck();
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

  formatEventDate(date: string): string {
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

  protected readonly TicketStatus = TicketStatus;
}
