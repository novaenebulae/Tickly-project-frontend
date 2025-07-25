import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  ViewChild,
  effect
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

  @ViewChild('topEventsChart') topEventsChart?: BaseChartDirective;
  @ViewChild('categoryChart') categoryChart?: BaseChartDirective;

  // Utilisation directe des signaux du service
  structureName = this.userStructureService.userStructure;
  structureAreas = this.userStructureService.userStructureAreas;
  structureEvents = this.userStructureService.userStructureEvents;
  isLoadingStructure = this.userStructureService.isLoading;

  stats = this.statisticsService.structureDashboardStats;
  isLoadingStats = this.statisticsService.isLoadingStructureStats;

  // Signal combiné pour l'état de chargement général
  isLoading = computed(() => this.isLoadingStructure() || this.isLoadingStats());

  // Signaux dérivés pour les KPI
  teamCount = this.teamManagementService.teamMembers;
  eventCount = computed(() => this.structureEvents().length);
  areaCount = computed(() => this.structureAreas().length);

  // Statut de la structure
  structureStatus = computed(() => {
    const structure = this.structureName();
    if (!structure) return 'no-structure';

    const areas = this.areaCount();
    const team = this.teamCount().length;

    if (areas === 0) return 'needs-setup';
    if (team <= 1) return 'needs-team';
    return 'ready';
  });

  statusConfig = computed(() => {
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

  constructor() {
    // Effect pour charger les données complémentaires quand la structure est disponible
    effect(() => {
      const structure = this.structureName();
      const isStructureLoaded = this.userStructureService.isStructureDataLoaded();

      if (structure && isStructureLoaded) {
        // La structure est chargée, charger les données complémentaires
        this.loadDashboardData();
      }
    });

    // Effect pour mettre à jour les graphiques quand les stats changent
    effect(() => {
      const stats = this.stats();
      if (stats) {
        this.updateChartData(stats);
        // Petite temporisation pour laisser Angular mettre à jour la vue
        setTimeout(() => this.updateCharts(), 10);
      }
    });
  }

  ngOnInit(): void {
    // Plus besoin de logique complexe, les effects gèrent tout
  }

  ngAfterViewInit(): void {
    // Plus besoin de logique ici, les effects gèrent la mise à jour des graphiques
  }

  /**
   * Charge les données complémentaires du dashboard
   */
  private loadDashboardData(): void {
    // Charger les statistiques si pas encore chargées
    if (!this.stats()) {
      this.statisticsService.getStructureDashboardStats()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }

    // Charger les membres de l'équipe si pas encore chargés
    if (this.teamCount().length === 0) {
      this.teamManagementService.loadTeamMembers()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  /**
   * Actualise toutes les données du dashboard
   */
  refreshStatistics(): void {
    // Actualiser toutes les données de structure
    this.userStructureService.refreshAllStructureData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    // Actualiser les statistiques
    this.statisticsService.getStructureDashboardStats(true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    // Actualiser les membres de l'équipe
    this.teamManagementService.loadTeamMembers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  /**
   * Navigation vers la gestion d'équipe
   */
  navigateToTeam(): void {
    this.router.navigate(['/admin/structure/team']);
  }

  /**
   * Navigation vers la gestion des espaces
   */
  navigateToAreas(): void {
    this.router.navigate(['/admin/structure/areas']);
  }

  /**
   * Ouvre la page publique de la structure
   */
  openPublicPage(): void {
    const structure = this.structureName();
    if (structure?.id) {
      const publicUrl = `/structures/${structure.id}`;
      window.open(publicUrl, '_blank');
    }
  }

  /**
   * Formate l'adresse de la structure
   */
  getFormattedAddress(): string {
    const structure = this.structureName();
    if (!structure?.address) return 'Adresse non définie';

    const { street, city, zipCode, country } = structure.address;
    const parts = [street, city, country].filter(Boolean);
    return parts.join(', ');
  }

  /**
   * Met à jour les données des graphiques
   */
  private updateChartData(stats: StructureDashboardStatsDto): void {
    this.updateChartFromDto(stats.topEventsChart, this.topEventsChartData);
    this.updateChartFromDto(stats.attendanceByCategoryChart, this.categoryChartData);
  }

  /**
   * Met à jour un graphique à partir du DTO
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
   * Met à jour les graphiques après modification des données
   */
  private updateCharts(): void {
    if (this.topEventsChart?.chart) {
      this.topEventsChart.chart.update();
    }

    if (this.categoryChart?.chart) {
      this.categoryChart.chart.update();
    }
  }
}
