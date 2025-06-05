import { Component, Input, OnInit, ViewChild, ElementRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { EventStatsModel } from '../../../../core/models/stats/event-stats-model.model';
import { StatsFormatterService } from '../../../../core/services/domain/stats/stats-formatter.service';

Chart.register(...registerables);

@Component({
  selector: 'app-event-performance-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-chart-container">
      <div class="chart-header">
        <h3>Performance de l'Événement</h3>
        <div class="performance-indicators">
          <div class="indicator" [class]="getPerformanceClass('participation')">
            <span class="label">Participation</span>
            <span class="value">{{ getParticipationRate() }}%</span>
          </div>
          <div class="indicator" [class]="getPerformanceClass('revenue')">
            <span class="label">Revenus</span>
            <span class="value">{{ getRevenueDisplay() }}</span>
          </div>
        </div>
      </div>

      <div class="chart-content" *ngIf="chartData(); else noData">
        <canvas #chartCanvas></canvas>
      </div>

      <ng-template #noData>
        <div class="no-data-state">
          <p>Aucune donnée disponible pour cet événement</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .performance-chart-container {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .chart-header h3 {
      margin: 0;
      color: #374151;
      font-size: 1.2rem;
    }
    .performance-indicators {
      display: flex;
      gap: 1rem;
    }
    .indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      min-width: 80px;
    }
    .indicator.excellent { background: #ecfdf5; color: #065f46; }
    .indicator.good { background: #fef3c7; color: #92400e; }
    .indicator.poor { background: #fef2f2; color: #991b1b; }
    .indicator .label {
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    .indicator .value {
      font-size: 1rem;
      font-weight: 600;
    }
    .chart-content {
      height: 300px;
      position: relative;
    }
    .no-data-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #6b7280;
      font-style: italic;
    }
  `]
})
export class EventPerformanceChartComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  @Input() set eventStats(stats: EventStatsModel | null) {
    this.eventStatsSig.set(stats);
  }

  private formatter = inject(StatsFormatterService);
  private chart = signal<Chart | null>(null);
  private eventStatsSig = signal<EventStatsModel | null>(null);

  // Computed pour les données du graphique
  chartData = computed(() => {
    const stats = this.eventStatsSig();
    if (!stats) return null;

    return {
      labels: ['Billets vendus', 'Capacité totale'],
      datasets: [{
        label: 'Événement',
        data: [stats.ticketsSold || 0, stats.totalCapacity || 0],
        backgroundColor: ['#3b82f6', '#e5e7eb'],
        borderWidth: 0
      }]
    };
  });

  ngOnInit() {
    // Observer les changements des données pour mettre à jour le graphique
    this.chartData(); // Trigger computed
  }

  ngAfterViewInit() {
    // Créer le graphique quand la vue est prête
    setTimeout(() => this.createChart(), 0);
  }

  ngOnDestroy() {
    const chart = this.chart();
    if (chart) {
      chart.destroy();
    }
  }

  private createChart() {
    const data = this.chartData();
    if (!data || !this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                return `${label}: ${this.formatter.formatNumber(value)}`;
              }
            }
          }
        },
        cutout: '60%'
      }
    };

    this.chart.set(new Chart(ctx, config));
  }

  getParticipationRate(): number {
    const stats = this.eventStatsSig();
    if (!stats || !stats.totalCapacity) return 0;
    return Math.round((stats.ticketsSold / stats.totalCapacity) * 100);
  }

  getRevenueDisplay(): string {
    const stats = this.eventStatsSig();
    if (!stats || !stats.totalRevenue) return '0 €';
    return this.formatter.formatCurrency(stats.totalRevenue);
  }

  getPerformanceClass(type: 'participation' | 'revenue'): string {
    if (type === 'participation') {
      const rate = this.getParticipationRate();
      if (rate >= 80) return 'excellent';
      if (rate >= 60) return 'good';
      return 'poor';
    }
    // Pour les revenus, on peut définir des seuils selon le contexte métier
    return 'good';
  }
}
