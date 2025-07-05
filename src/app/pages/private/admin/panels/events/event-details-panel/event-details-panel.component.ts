import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Subscription} from 'rxjs';

// Angular Material Modules & Common Features
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {CommonModule, ViewportScroller} from '@angular/common'; // Inclut DatePipe, PercentPipe, NumberPipe, NgClass, @if, @for
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';

// Chart.js
import {ChartConfiguration, ChartData, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

// Services
import {EventService} from '../../../../../../core/services/domain/event/event.service';
import {StatisticsService} from '../../../../../../core/services/domain/statistics/statistics.service';

// Models
import {EventModel} from '../../../../../../core/models/event/event.model';
import {EventStatisticsDto} from '../../../../../../core/models/statistics/event-statistics.model';
import {ChartJsDataDto} from '../../../../../../core/models/statistics/chart-js-data.model';

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
    BaseChartDirective,
  ],
  templateUrl: './event-details-panel.component.html',
  styleUrls: ['./event-details-panel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EventDetailsPanelComponent implements OnInit, AfterViewInit, OnDestroy {

  private viewportScroller = inject(ViewportScroller);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);
  private eventService = inject(EventService);
  private statisticsService = inject(StatisticsService);

  private subscriptions: Subscription[] = [];

  event: EventDetails | null = null;

  // Suppression de 'internalNotes' des colonnes affichées
  dataSource: MatTableDataSource<Participant> = new MatTableDataSource<Participant>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('participantFilter') participantFilterInput!: ElementRef<HTMLInputElement>;

  // Chart references
  @ViewChild('zoneFillRateChart') zoneFillRateChart?: BaseChartDirective;
  @ViewChild('reservationsOverTimeChart') reservationsOverTimeChart?: BaseChartDirective;
  @ViewChild('ticketStatusChart') ticketStatusChart?: BaseChartDirective;

  // Chart data and options
  zoneFillRateChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  zoneFillRateChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  reservationsOverTimeChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  reservationsOverTimeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  ticketStatusChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  ticketStatusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  // Chart types
  zoneFillRateChartType: ChartType = 'bar';
  reservationsOverTimeChartType: ChartType = 'line';
  ticketStatusChartType: ChartType = 'doughnut';


  ngOnInit(): void {
    // Handle fragment for scrolling
    const fragmentSub = this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.viewportScroller.scrollToAnchor(fragment);
      }
    });
    this.subscriptions.push(fragmentSub);

    // Get event ID from route
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventDetails(Number(eventId));
    } else {
      console.error("ID de l'événement manquant.");
      this.snackBar.open("Erreur: ID de l'événement non trouvé.", "Fermer", { duration: 3000 });
    }
  }

  /**
   * Loads event details and statistics from the server
   * @param eventId The ID of the event to load
   */
  private loadEventDetails(eventId: number): void {
    // Load event details
    const eventSub = this.eventService.getEventById(eventId).subscribe(
      eventData => {
        if (eventData) {
          // Load event statistics
          const statsSub = this.statisticsService.getEventStatistics(eventId).subscribe(
            statsData => {
              this.mapEventData(eventData, statsData);
              this.cdr.detectChanges();
            },
            error => {
              console.error('Error loading event statistics:', error);
              this.mapEventData(eventData); // Still map event data even if stats fail
              this.cdr.detectChanges();
            }
          );
          this.subscriptions.push(statsSub);
        } else {
          this.snackBar.open(`Événement #${eventId} non trouvé.`, "Fermer", { duration: 3000 });
        }
      },
      error => {
        console.error('Error loading event details:', error);
        this.snackBar.open(`Erreur lors du chargement de l'événement #${eventId}.`, "Fermer", { duration: 3000 });
      }
    );
    this.subscriptions.push(eventSub);
  }

  /**
   * Maps event data and statistics to the component's event object
   * @param eventData The event data from the API
   * @param statsData The event statistics from the API
   */
  private mapEventData(eventData: EventModel, statsData?: EventStatisticsDto | null): void {
    // Create zones from audience zones
    const zones: Zone[] = eventData.audienceZones.map(zone => ({
      name: zone.name,
      capacity: zone.allocatedCapacity
    }));

    // Calculate total capacity
    const totalCapacity = zones.reduce((sum, zone) => sum + (zone.capacity || 0), 0);

    // Map event status
    let status: string;
    switch (eventData.status) {
      case 'DRAFT': status = 'Planifié'; break;
      case 'PUBLISHED': status = 'Inscriptions Ouvertes'; break;
      case 'CANCELLED': status = 'Annulé'; break;
      case 'COMPLETED': status = 'Terminé'; break;
      case 'ARCHIVED': status = 'Archivé'; break;
      default: status = eventData.status;
    }

    // Create event stats object
    const stats: EventStats = {};
    if (statsData) {
      // Use direct values from the updated EventStatisticsDto
      stats.fillRate = statsData.fillPercentage;
      stats.ticketsAttributed = statsData.attributedTicketsAmount;
      stats.uniqueReservations = statsData.uniqueReservationAmount;
      stats.ticketsScanned = statsData.scannedTicketsNumber;

      // Calculate no-show rate if we have the necessary data
      if (stats.ticketsAttributed > 0) {
        stats.noShowRate = (stats.ticketsAttributed - stats.ticketsScanned) / stats.ticketsAttributed * 100;
      }

      // Calculate average tickets per reservation
      if (stats.uniqueReservations && stats.uniqueReservations > 0) {
        stats.avgTicketsPerReservation = stats.ticketsAttributed / stats.uniqueReservations;
      }

      // Update chart data from DTO
      this.updateChartFromDto(statsData.zoneFillRateChart, this.zoneFillRateChartData);
      this.updateChartFromDto(statsData.reservationsOverTimeChart, this.reservationsOverTimeChartData);
      this.updateChartFromDto(statsData.ticketStatusChart, this.ticketStatusChartData);

      // Update chart types if specified in the DTO
      if (statsData.zoneFillRateChart.chartType) {
        this.zoneFillRateChartType = statsData.zoneFillRateChart.chartType as ChartType;
      }
      if (statsData.reservationsOverTimeChart.chartType) {
        this.reservationsOverTimeChartType = statsData.reservationsOverTimeChart.chartType as ChartType;
      }
      if (statsData.ticketStatusChart.chartType) {
        this.ticketStatusChartType = statsData.ticketStatusChart.chartType as ChartType;
      }
    }

    // Create event details object
    this.event = {
      id: eventData.id?.toString() || '',
      name: eventData.name,
      subtitle: eventData.shortDescription || '',
      bannerUrl: eventData.mainPhotoUrl,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      duration: this.calculateDuration(eventData.startDate, eventData.endDate),
      zones: zones,
      description: this.sanitizer.bypassSecurityTrustHtml(eventData.fullDescription),
      category: eventData.categories.map(cat => cat.name).join(', '),
      totalCapacity: totalCapacity,
      status: status,
      publicLink: `${window.location.origin}/events/${eventData.id}`,
      stats: stats
    };

    // For now, we're not loading participants as mentioned in the requirements
    this.dataSource.data = [];
  }

  get fillPercentage(): string {
    return (this.event!.stats?.fillRate ? Math.round(this.event!.stats!.fillRate) : 0) + " %";
  }

  /**
   * Calculates the duration between two dates
   * @param startDate The start date
   * @param endDate The end date
   * @returns A string representing the duration
   */
  private calculateDuration(startDate: Date, endDate: Date): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `Env. ${diffHours} heure${diffHours > 1 ? 's' : ''}${diffMinutes > 0 ? ` ${diffMinutes} min` : ''}`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    // Update charts after view initialization
    setTimeout(() => {
      this.updateCharts();
    }, 0);
  }

  /**
   * Updates chart data from DTO
   * @param chartDto The chart data from the API
   * @param chartData The chart data object to update
   */
  private updateChartFromDto(chartDto: ChartJsDataDto, chartData: ChartData): void {
    chartData.labels = chartDto.labels;
    chartData.datasets = chartDto.datasets.map(dataset => ({
      data: dataset.data,
      label: dataset.label,
      backgroundColor: dataset.backgroundColor,
      borderColor: dataset.borderColor,
      fill: dataset.fill
    }));
  }

  /**
   * Updates charts after data changes
   */
  private updateCharts(): void {
    if (this.zoneFillRateChart) {
      this.zoneFillRateChart.update();
    }

    if (this.reservationsOverTimeChart) {
      this.reservationsOverTimeChart.update();
    }

    if (this.ticketStatusChart) {
      this.ticketStatusChart.update();
    }
  }

  /**
   * Clean up subscriptions when the component is destroyed
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // --- Méthodes d'action de l'en-tête ---
  goBack(): void {
    this.router.navigate(['/admin/events']);
  }

  editEvent(): void {
    if (this.event) {
      this.router.navigate(['/admin/events', this.event.id, 'edit']);
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

}
