import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
  ViewEncapsulation, inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Angular Material Modules & Common Features
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {CommonModule, ViewportScroller} from '@angular/common'; // Inclut DatePipe, PercentPipe, NumberPipe, NgClass, @if, @for
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatMenu, MatMenuModule, MatMenuTrigger} from '@angular/material/menu';

// --- INTERFACES POUR LES DONNÉES (Alignées avec le HTML) ---

interface Zone {
  name?: string;
  capacity?: number;
}

interface EventStats {
  fillRate?: number; // Pourcentage 0-100
  ticketsAttributed?: number;
  fillRateComparison?: string;
  uniqueReservations?: number;
  avgTicketsPerReservation?: number;
  newReservationsTrend?: string;
  ticketsAttributedComparison?: string;
  ticketsScanned?: number;
  noShowRate?: number; // Pourcentage 0-100
}

interface EventDetails {
  id: string;
  name?: string;
  subtitle?: string;
  bannerUrl?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  duration?: string;
  zones?: Zone[];
  description?: SafeHtml | string;
  category?: string;
  totalCapacity?: number;
  status?: 'Planifié' | 'Inscriptions Ouvertes' | 'Complet' | 'En Cours' | 'Terminé' | 'Annulé' | 'Reporté' | string;
  publicLink?: string;
  stats?: EventStats;
}

interface TicketInReservation {
  type: string;
  holderName?: string;
  reference: string; // Important pour le `track` dans @for
}

interface Participant {
  orderId: string;
  name: string;
  email: string;
  reservationDate: Date | string;
  ticketCount: number;
  tickets: TicketInReservation[];
  reservationStatus: 'Confirmée' | 'En attente de validation' | 'Modifiée' | 'Annulée par l\'organisateur' | string;
  scanStatus: 'Non scanné' | 'Scanné' | 'Entrée multiple refusée' | string;
  // internalNotes a été supprimé
}

@Component({
  selector: 'app-event-details-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatProgressBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatMenuModule,
  ],
  templateUrl: './event-details-panel.component.html',
  styleUrls: ['./event-details-panel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventDetailsPanelComponent implements OnInit, AfterViewInit {

  private viewportScroller = inject(ViewportScroller);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  event: EventDetails | null = null;

  // Suppression de 'internalNotes' des colonnes affichées
  displayedColumns: string[] = [
    'orderId',
    'name',
    'email',
    'reservationDate',
    'ticketCount',
    'ticketDetails',
    'reservationStatus',
    'scanStatus',
    'actions'
  ];
  dataSource: MatTableDataSource<Participant> = new MatTableDataSource<Participant>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('participantFilter') participantFilterInput!: ElementRef<HTMLInputElement>;


  ngOnInit(): void {
    // Exemple de chargement basé sur l'ID de la route
    // const eventId = this.route.snapshot.paramMap.get('id');
    // if (eventId) {
    //   this.loadEventDetailsFromServer(eventId);
    // } else {
    //   console.error("ID de l'événement manquant.");
    //   this.snackBar.open("Erreur: ID de l'événement non trouvé.", "Fermer", { duration: 3000 });
    // }
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.viewportScroller.scrollToAnchor(fragment);
      }
    });

    this.loadMockEventDetails(); // Pour la démo
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadMockEventDetails(): void {
    setTimeout(() => {
      const mockDescriptionHtml = `
        <p>Préparez-vous pour <strong>Rock The Night 2025</strong>, une soirée explosive avec les meilleurs groupes de rock du moment !</p>
        <ul>
          <li>Line-up incluant "The Electric Waves", "Crimson Haze", et "Nova Pulse".</li>
          <li>Son et lumières spectaculaires pour une immersion totale.</li>
          <li>Stands de merchandising et rafraîchissements sur place.</li>
        </ul>
        <p>Une nuit de pure énergie rock à ne pas manquer. Réservez vos places dès maintenant !</p>
      `;

      this.event = {
        id: 'evt-rockthenight-2025',
        name: 'Rock The Night 2025',
        subtitle: 'Le concert rock de l\'année !',
        bannerUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y29uY2VydCUyMHJvY2t8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
        startDate: new Date('2025-11-15T20:00:00'),
        endDate: new Date('2025-11-15T23:59:00'),
        duration: 'Env. 4 heures',
        zones: [
          { name: 'Fosse Debout', capacity: 1500 },
          { name: 'Gradins Assis - Bloc A', capacity: 500 },
          { name: 'Gradins Assis - Bloc B', capacity: 500 },
          { name: 'Espace VIP Balcon', capacity: 100 }
        ],
        description: this.sanitizer.bypassSecurityTrustHtml(mockDescriptionHtml),
        category: 'Concert Rock',
        totalCapacity: 2600,
        status: 'Inscriptions Ouvertes',
        publicLink: 'https://example.com/events/rockthenight-2025',
        stats: {
          fillRate: 72, // 72%
          ticketsAttributed: 1872,
          fillRateComparison: '+18% vs J-7',
          uniqueReservations: 1250,
          avgTicketsPerReservation: 1.50,
          newReservationsTrend: '+80 réservations hier',
          ticketsAttributedComparison: '+200 vs J-7',
          ticketsScanned: 0, // Événement pas encore commencé
          noShowRate: 0,
        }
      };

      const mockParticipants: Participant[] = [
        { orderId: 'RTN001', name: 'Alexandre Petit', email: 'alex.p@email.com', reservationDate: new Date('2025-09-01T10:00:00'), ticketCount: 2, tickets: [{ type: 'Fosse Debout', holderName: 'Alexandre Petit', reference: 'TKT-RTN01A' }, { type: 'Fosse Debout', holderName: 'Sophie Durand', reference: 'TKT-RTN01B' }], reservationStatus: 'Confirmée', scanStatus: 'Non scanné' },
        { orderId: 'RTN002', name: 'Chloé Dubois', email: 'chloe.d@email.net', reservationDate: new Date('2025-09-05T15:30:00'), ticketCount: 1, tickets: [{ type: 'Espace VIP Balcon', holderName: 'Chloé Dubois', reference: 'TKT-RTN02A' }], reservationStatus: 'Confirmée', scanStatus: 'Non scanné' },
        { orderId: 'RTN003', name: 'Mohammed Ali', email: 'm.ali@email.org', reservationDate: new Date('2025-09-10T09:45:00'), ticketCount: 4, tickets: [{ type: 'Gradins Assis - Bloc A', holderName: 'Mohammed Ali', reference: 'TKT-RTN03A' }, { type: 'Gradins Assis - Bloc A', reference: 'TKT-RTN03B' }, { type: 'Gradins Assis - Bloc A', reference: 'TKT-RTN03C' }, { type: 'Gradins Assis - Bloc A', reference: 'TKT-RTN03D' }], reservationStatus: 'En attente de validation', scanStatus: 'Non scanné' },
      ];
      this.dataSource.data = mockParticipants;

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  // --- Méthodes d'action de l'en-tête ---
  goBack(): void {
    this.router.navigate(['admin/events']);
  }

  editEvent(): void {
    if (this.event) {
      this.router.navigate(['/events/edit', this.event.id]);
    } else {
      this.snackBar.open('Impossible de modifier : événement non chargé.', 'Fermer', { duration: 3000 });
    }
  }

  // --- Méthodes d'action de la section panoramique ---
  previewPublicPage(): void {
    if (this.event?.publicLink) {
      window.open(this.event.publicLink, '_blank');
    } else {
      this.snackBar.open('Lien public non disponible pour cet événement.', 'Fermer', { duration: 3000 });
    }
  }

  // --- Méthodes pour le tableau des participants ---
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportParticipants(): void {
    this.snackBar.open('Fonctionnalité d\'exportation bientôt disponible.', 'Fermer', { duration: 3000 });
  }

  viewParticipantDetails(participant: Participant): void {
    console.log('Voir détails du participant:', participant);
    this.snackBar.open(`Affichage des détails pour ${participant.name}. (Simulation)`, 'Fermer', { duration: 2000 });
  }

  resendConfirmationEmail(participant: Participant): void {
    console.log('Renvoyer email de confirmation à:', participant.email);
    this.snackBar.open(`Email de confirmation renvoyé à ${participant.email}. (Simulation)`, 'Fermer', { duration: 3000 });
  }

  downloadTickets(participant: Participant): void {
    console.log('Télécharger PDF des billets pour:', participant.orderId);
    this.snackBar.open(`Téléchargement des billets pour ${participant.orderId}. (Simulation)`, 'Fermer', { duration: 3000 });
  }

  // --- Méthodes pour les outils de communication ---
  openEmailComposer(): void {
    console.log('Ouverture du compositeur d\'email...');
    this.snackBar.open('Ouverture du module d\'emailing. (Simulation)', 'Fermer', { duration: 3000 });
  }

  copyLink(inputElement: HTMLInputElement): void {
    if (inputElement.value && inputElement.value !== 'Lien non disponible') {
      navigator.clipboard.writeText(inputElement.value).then(() => {
        this.snackBar.open('Lien public copié dans le presse-papiers !', 'Fermer', { duration: 2000 });
      }).catch(err => {
        console.error('Erreur lors de la copie du lien : ', err);
        this.snackBar.open('Erreur lors de la copie du lien.', 'Fermer', { duration: 3000 });
      });
    } else {
      this.snackBar.open('Aucun lien public à copier.', 'Fermer', { duration: 3000 });
    }
  }

  // --- Méthodes utilitaires pour les classes CSS des badges ---
  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-secondary text-white';
    switch (status.toLowerCase().trim()) {
      case 'planifié': return 'bg-info text-dark';
      case 'inscriptions ouvertes': return 'bg-success text-white';
      case 'complet': return 'bg-warning text-dark';
      case 'en cours': return 'custom-blue-bg text-white';
      case 'terminé': return 'bg-dark text-white';
      case 'annulé': return 'bg-danger text-white';
      case 'reporté': return 'bg-light text-dark border';
      default: return 'bg-secondary text-white';
    }
  }

  getReservationStatusClass(status: string | undefined): string {
    if (!status) return 'badge-light-grey';
    switch (status.toLowerCase().trim()) {
      case 'confirmée': return 'badge-success-light';
      case 'en attente de validation': return 'badge-warning-light';
      case 'modifiée': return 'badge-info-light';
      case 'annulée par l\'organisateur': return 'badge-danger-light';
      default: return 'badge-light-grey';
    }
  }

  getScanStatusClass(status: string | undefined): string {
    if (!status) return 'badge-light-grey';
    switch (status.toLowerCase().trim()) {
      case 'non scanné': return 'badge-light-grey';
      case 'scanné': return 'badge-success-light';
      case 'entrée multiple refusée': return 'badge-danger-light';
      default: return 'badge-light-grey';
    }
  }
}
