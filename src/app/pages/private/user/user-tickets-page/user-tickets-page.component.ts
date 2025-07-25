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
import {UserReservationModel} from '../../../../core/models/tickets/reservation.model';
import {
  TicketDetailModalComponent
} from '../../../../shared/domain/users/ticket-detail-modal/ticket-detail-modal.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs/operators';
import {
  ConfirmationDialogComponent
} from '../../../../shared/ui/dialogs/confirmation-dialog/confirmation-dialog.component';

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
  allReservations = computed(() => this.ticketService.myReservations());
  allTickets = computed(() => this.ticketService.myTickets());
  isLoading = signal(true);

  // Tickets groupés par réservation
  groupedReservations = computed(() => {
    return this.allReservations();
  });

  // Pour la compatibilité avec le code existant, on garde une version groupée par événement
  groupedTickets = computed(() => {
    const reservations = this.allReservations();
    const grouped = new Map<number, TicketModel[]>();

    reservations.forEach(reservation => {
      reservation.tickets.forEach(ticket => {
        const eventId = ticket.eventSnapshot.eventId;
        if (!grouped.has(eventId)) {
          grouped.set(eventId, []);
        }
        grouped.get(eventId)!.push(ticket);
      });
    });

    return grouped;
  });

  // Réservations avec billets à venir
  upcomingReservations = computed(() => {
    const now = new Date();
    const reservations = new Map<number, UserReservationModel>();

    this.groupedReservations().forEach(reservation => {
      // Vérifier si au moins un billet est valide
      const hasValidTickets = reservation.tickets.some(t => t.status === TicketStatus.VALID);

      // Vérifier si l'événement est dans le futur
      const eventDate = new Date(reservation.tickets[0].eventSnapshot.startDate);

      if (eventDate > now && hasValidTickets) {
        reservations.set(reservation.reservationId, reservation);
      }
    });

    return reservations;
  });

  // Réservations pour événements passés
  pastReservations = computed(() => {
    const now = new Date();
    const reservations = new Map<number, UserReservationModel>();

    this.groupedReservations().forEach(reservation => {
      // Vérifier si l'événement est passé ou si au moins un billet est utilisé ou expiré
      const eventDate = new Date(reservation.tickets[0].eventSnapshot.startDate);
      const isUsedOrExpired = reservation.tickets.some(t =>
        t.status === TicketStatus.USED || t.status === TicketStatus.EXPIRED
      );

      if ((eventDate <= now || isUsedOrExpired) &&
          !reservation.tickets.some(t => t.status === TicketStatus.CANCELLED)) {
        reservations.set(reservation.reservationId, reservation);
      }
    });

    return reservations;
  });

  // Réservations annulées
  cancelledReservations = computed(() => {
    const reservations = new Map<number, UserReservationModel>();

    this.groupedReservations().forEach(reservation => {
      // Une réservation est considérée comme annulée si tous ses billets sont annulés
      if (reservation.tickets.some(t => t.status === TicketStatus.CANCELLED)) {
        reservations.set(reservation.reservationId, reservation);
      }
    });

    return reservations;
  });

  // Pour la compatibilité avec le code existant
  upcomingEvents = computed(() => this.upcomingReservations());
  pastEvents = computed(() => this.pastReservations());
  cancelledEvents = computed(() => this.cancelledReservations());

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
   * Télécharge le PDF pour tous les billets d'une réservation
   */
  downloadAllPdfs(reservation: UserReservationModel): void {
    this.isLoading.set(true);

    const ticketIds = reservation.tickets.map(ticket => ticket.id);

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
   * Télécharge le PDF pour une réservation spécifique depuis la carte
   */
  downloadReservationPdfsFromCard(event: Event, reservation: UserReservationModel): void {
    event.stopPropagation(); // Empêche l'ouverture de la modal
    this.downloadAllPdfs(reservation);
  }

  /**
   * Pour la compatibilité avec le code existant
   */
  downloadEventPdfsFromCard(event: Event, tickets: TicketModel[]): void {
    event.stopPropagation();
    // Trouver la réservation correspondante
    const reservationId = this.getReservationIdForTicket(tickets[0]);
    if (reservationId) {
      const reservation = this.allReservations().find(r => r.reservationId === reservationId);
      if (reservation) {
        this.downloadAllPdfs(reservation);
      }
    }
  }

  openReservationTickets(reservation: UserReservationModel): void {
    const dialogRef = this.dialog.open(TicketDetailModalComponent, {
      width: 'auto',
      maxWidth: '800px',
      data: { ticket: reservation.tickets }
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

  /**
   * Pour la compatibilité avec le code existant
   */
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

  /**
   * Cancels a reservation
   * @param event The click event
   * @param reservationId The ID of the reservation to cancel
   */
  cancelTicket(event: Event, reservationId: number): void {
    event.stopPropagation(); // Prevent opening the ticket details modal

    this.showConfirmationDialog().then(confirmed => {
      if (confirmed) {
        this.isLoading.set(true);

        this.ticketService.cancelTicket(reservationId)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => {
              this.isLoading.set(false);
              this.cdRef.markForCheck();
            })
          )
          .subscribe({
            next: () => {
              this.loadTickets();
              // Reservation is already updated in the service
              this.cdRef.markForCheck();
            }
          });
      }
    })
  }

  /**
   * Gets the reservation ID for a ticket
   * @param ticket The ticket to find the reservation ID for
   * @returns The reservation ID, or undefined if not found
   */
  getReservationIdForTicket(ticket: TicketModel): number | undefined {
    const reservations = this.allReservations();
    const reservation = reservations.find(r =>
      r.tickets.some(t => t.id === ticket.id)
    );
    return reservation?.reservationId;
  }

  /**
   * Obtient un résumé des billets pour une réservation
   */
  getReservationTicketsSummary(reservation: UserReservationModel): string {
    const tickets = reservation.tickets;
    const validCount = tickets.filter(t => t.status === TicketStatus.VALID).length;
    const total = tickets.length;

    if (validCount === total) {
      return `${total} billet${total > 1 ? 's' : ''}`;
    } else {
      return `${validCount}/${total} billet${total > 1 ? 's' : ''} valide${validCount > 1 ? 's' : ''}`;
    }
  }

  /**
   * Pour la compatibilité avec le code existant
   */
  getEventTicketsSummary(tickets: TicketModel[]): string {
    const validCount = tickets.filter(t => t.status === TicketStatus.VALID).length;
    const total = tickets.length;

    if (validCount === total) {
      return `${total} billet${total > 1 ? 's' : ''}`;
    } else {
      return `${validCount}/${total} billet${total > 1 ? 's' : ''} valide${validCount > 1 ? 's' : ''}`;
    }
  }

  /**
   * Obtient le statut principal d'une réservation
   */
  getReservationMainStatus(reservation: UserReservationModel): TicketStatus {
    const tickets = reservation.tickets;
    if (tickets.every(t => t.status === TicketStatus.VALID)) {
      return TicketStatus.VALID;
    } else if (tickets.some(t => t.status === TicketStatus.CANCELLED)) {
      return TicketStatus.CANCELLED;
    } else if (tickets.some(t => t.status === TicketStatus.USED)) {
      return TicketStatus.USED;
    } else {
      return TicketStatus.EXPIRED;
    }
  }

  /**
   * Pour la compatibilité avec le code existant
   */
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

  /**
   * Vérifie si une réservation a des billets valides
   */
  hasValidReservationTickets(reservation: UserReservationModel): boolean {
    return reservation.tickets.some(ticket => ticket.status === TicketStatus.VALID);
  }

  /**
   * Pour la compatibilité avec le code existant
   */
  hasValidTickets(tickets: TicketModel[]): boolean {
    return tickets.some(ticket => ticket.status === TicketStatus.VALID);
  }

  /**
   * Gets the reservation ID for the first valid ticket in a group of tickets
   * @param tickets The tickets to check
   * @returns The reservation ID, or undefined if no valid ticket is found
   */
  getReservationIdForValidTicket(tickets: TicketModel[]): number | undefined {
    const validTicket = tickets.find(ticket => ticket.status === TicketStatus.VALID);
    if (!validTicket) return undefined;

    return this.getReservationIdForTicket(validTicket);
  }

  /**
   * Shows a confirmation dialog for cancelling a reservation
   * @returns A promise that resolves to true if confirmed, false otherwise
   */
  private showConfirmationDialog(): Promise<boolean> {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Annuler la réservation',
        message: 'Êtes vous sûrs de vouloir supprimer cette réservation ?',
        confirmButtonText: 'Supprimer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: 'danger'
      }
    });

    return dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).toPromise();
  }

  protected readonly TicketStatus = TicketStatus;
}
