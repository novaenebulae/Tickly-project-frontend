import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, ViewChild, AfterViewInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Chart.js
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

// Services
import { UserStructureService } from '../../../../../core/services/domain/user-structure/user-structure.service';
import { StatisticsService } from '../../../../../core/services/domain/statistics/statistics.service';

// Models
import { StructureDashboardStatsDto } from '../../../../../core/models/statistics/structure-dashboard-stats.model';
import { ChartJsDataDto } from '../../../../../core/models/statistics/chart-js-data.model';

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
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private statisticsService = inject(StatisticsService);
  private userStructureService = inject(UserStructureService);

  // Charts references
  @ViewChild('topEventsChart') topEventsChart?: BaseChartDirective;
  @ViewChild('categoryChart') categoryChart?: BaseChartDirective;

  // Structure info
  structureName = this.userStructureService.userStructure;

  // Statistics data
  stats = this.statisticsService.structureDashboardStats;
  isLoading = this.statisticsService.isLoadingStructureStats;

  // Computed chart types with proper typing
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
    // Load statistics data
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
    // Update charts after view initialization
    setTimeout(() => {
      this.updateCharts();
    }, 0);
  }

  /**
   * Loads statistics data from the service
   */
  loadStatistics(): void {
    this.statisticsService.getStructureDashboardStats().subscribe(stats => {
      if (stats) {
        this.updateChartData(stats);
      }
    });
  }

  /**
   * Refreshes the statistics data
   */
  refreshStatistics(): void {
    this.statisticsService.getStructureDashboardStats(true).subscribe(stats => {
      if (stats) {
        this.updateChartData(stats);
      }
    });
  }

  /**
   * Updates chart data based on statistics
   */
  private updateChartData(stats: StructureDashboardStatsDto): void {
    // Update top events chart
    this.updateChartFromDto(stats.topEventsChart, this.topEventsChartData);

    // Update category chart
    this.updateChartFromDto(stats.attendanceByCategoryChart, this.categoryChartData);

    // Update charts
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
    if (this.topEventsChart) {
      this.topEventsChart.update();
    }

    if (this.categoryChart) {
      this.categoryChart.update();
    }
  }
}
