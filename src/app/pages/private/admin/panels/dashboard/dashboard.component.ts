import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatChipsModule} from '@angular/material/chips';
import {Router} from '@angular/router';

// Chart.js
import {ChartConfiguration, ChartData, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

// Services
import {UserStructureService} from '../../../../../core/services/domain/user-structure/user-structure.service';
import {StatisticsService} from '../../../../../core/services/domain/statistics/statistics.service';
import {TeamManagementService} from '../../../../../core/services/domain/team-management/team-management.service';

// Models
import {StructureDashboardStatsDto} from '../../../../../core/models/statistics/structure-dashboard-stats.model';
import {ChartJsDataDto} from '../../../../../core/models/statistics/chart-js-data.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private statisticsService = inject(StatisticsService);
  private userStructureService = inject(UserStructureService);
  private teamManagementService = inject(TeamManagementService);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  @ViewChild('topEventsChart') topEventsChart?: BaseChartDirective;
  @ViewChild('categoryChart') categoryChart?: BaseChartDirective;

  structureName = this.userStructureService.userStructure;
  protected readonly structureAreas = this.userStructureService.userStructureAreas;

  stats = this.statisticsService.structureDashboardStats;
  isLoading = this.statisticsService.isLoadingStructureStats;

  protected readonly structureStatus = computed(() => {
    const structure = this.structureName();
    if (!structure) return 'no-structure';

    const areas = this.structureAreas().length;
    const team = this.teamCount();

    if (areas === 0) return 'needs-setup';
    if (team <= 1) return 'needs-team';
    return 'ready';
  });

  protected readonly statusConfig = computed(() => {
    const status = this.structureStatus();
    switch (status) {
      case 'no-structure':
        return {
          label: 'Aucune structure',
          color: 'warn',
          icon: 'error_outline',
          description: 'Vous devez créer une structure'
        };
      case 'needs-setup':
        return {
          label: 'Configuration requise',
          color: 'accent',
          icon: 'build',
          description: 'Ajoutez des zones à votre structure'
        };
      case 'needs-team':
        return {
          label: 'Équipe incomplète',
          color: 'primary',
          icon: 'group_add',
          description: 'Invitez des membres à votre équipe'
        };
      case 'ready':
        return {
          label: 'Opérationnelle',
          color: 'primary',
          icon: 'check_circle',
          description: 'Votre structure est prête'
        };
      default:
        return { label: 'Inconnu', color: 'warn', icon: 'help', description: '' };
    }
  });

  private teamCountSig = signal<number>(0);
  private eventCountSig = signal<number>(0);

  protected readonly teamCount = computed(() => this.teamCountSig());
  protected readonly eventCount = computed(() => this.eventCountSig());
  protected readonly areaCount = computed(() => this.structureAreas().length);

  topEventsChartType = computed<ChartType>(() => {
    const type = this.stats()?.topEventsChart?.chartType;
    return (type as ChartType) || 'bar';
  });

  attendanceByCategoryChartType = computed<ChartType>(() => {
    const type = this.stats()?.attendanceByCategoryChart?.chartType;
    return (type as ChartType) || 'doughnut';
  });

  // Chart configurations
  topEventsChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  topEventsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  categoryChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  categoryChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  ngOnInit(): void {
    console.log('Dashboard ngOnInit - Structure initiale:', this.structureName());

    this.userStructureService.refreshUserStructure()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (structure) => {
          this.cdRef.markForCheck();

          this.loadStructureData();
          this.loadKpiData();
          this.loadStatistics();
        },
        error: (err) => {
          console.error('Error loading structure data:', err);
          this.cdRef.markForCheck();
          this.loadStructureData();
          this.loadKpiData();
          this.loadStatistics();
        }
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateCharts();
    }, 10);
  }

  /**
   * Loads structure data including areas
   */
  private loadStructureData(): void {
    this.userStructureService.loadUserStructureAreas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (areas) => {
          this.cdRef.markForCheck();
        },
        error: (err) => {
          console.error('Error loading areas:', err);
          this.cdRef.markForCheck();
        }
      });
  }

  /**
   * Loads KPI data (team members and events)
   */
  private loadKpiData(): void {
    this.teamManagementService.loadTeamMembers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (members) => {
        this.teamCountSig.set(members.length);
        this.cdRef.markForCheck();

      },
      error: () => {
        this.teamCountSig.set(0);
        this.cdRef.markForCheck();
      }
    });

    this.userStructureService.getUserStructureEvents(true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (events) => {
        this.eventCountSig.set(events.length);
        this.cdRef.markForCheck();
      },
      error: () => {
        this.eventCountSig.set(0);
        this.cdRef.markForCheck();
      }
    });
  }

  /**
   * Loads statistics data from the service
   */
  loadStatistics(): void {
    this.statisticsService.getStructureDashboardStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(stats => {
      if (stats) {
        this.updateChartData(stats);
        this.cdRef.markForCheck();
      }
    });
  }

  /**
   * Refreshes the statistics data and KPI data
   */
  refreshStatistics(): void {
    this.statisticsService.getStructureDashboardStats(true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(stats => {
      if (stats) {
        this.updateChartData(stats);
        this.cdRef.markForCheck();
      }
    });

    this.loadStructureData();
    this.loadKpiData();
  }

  /**
   * Navigation to team management
   */
  navigateToTeam(): void {
    this.router.navigate(['/admin/structure/team']);
  }

  /**
   * Navigation to areas management
   */
  navigateToAreas(): void {
    this.router.navigate(['/admin/structure/areas']);
  }

  /**
   * Opens the public page of the structure
   */
  openPublicPage(): void {
    const structure = this.structureName();
    if (structure?.id) {
      const publicUrl = `/structures/${structure.id}`;
      window.open(publicUrl, '_blank');
    }
  }

  /**
   * Formats the address of the structure
   */
  getFormattedAddress(): string {
    const structure = this.structureName();
    if (!structure?.address) return 'Adresse non définie';

    const { street, city, zipCode, country } = structure.address;
    const parts = [street, city, country].filter(Boolean);
    return parts.join(', ');
  }

  /**
   * Updates chart data based on statistics
   */
  private updateChartData(stats: StructureDashboardStatsDto): void {
    this.updateChartFromDto(stats.topEventsChart, this.topEventsChartData);

    this.updateChartFromDto(stats.attendanceByCategoryChart, this.categoryChartData);

    this.updateCharts();
  }

  /**
   * Updates chart data from DTO
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
    // Vérifier que les ViewChild sont bien initialisés et que les graphiques existent
    if (this.topEventsChart?.chart) {
      this.topEventsChart.chart.update();
    }

    if (this.categoryChart?.chart) {
      this.categoryChart.chart.update();
    }
  }
}
