import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ErrorState, ExportConfig,
  FilterConfig,
  LoadingState
} from '../../../core/models/stats/dependances/ui-components-config.model';


/**
 * Layout principal pour les pages de statistiques
 * Fournit une structure consistante avec header, filtres, contenu et actions
 */
@Component({
  selector: 'app-stats-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatCardModule,
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: './stats-page-layout.component.html',
  styleUrls: ['./stats-page-layout.component.scss']
})
export class StatsPageLayoutComponent {

  // ===== INPUTS =====
  @Input() title: string = 'Statistiques';
  @Input() subtitle?: string;
  @Input() breadcrumbs: string[] = [];
  @Input() tabs: { id: string; label: string; icon?: string; badge?: number }[] = [];
  @Input() activeTab: string = '';
  @Input() filters: FilterConfig[] = [];
  @Input() loading: LoadingState = { isLoading: false };
  @Input() error: ErrorState = { hasError: false };
  @Input() showRefresh: boolean = true;
  @Input() showExport: boolean = true;
  @Input() showFullscreen: boolean = true;
  @Input() showSettings: boolean = false;
  @Input() autoRefresh: boolean = false;
  @Input() refreshInterval: number = 300000; // 5 minutes
  @Input() lastUpdated?: Date;

  // ===== OUTPUTS =====
  @Output() tabChange = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<void>();
  @Output() export = new EventEmitter<ExportConfig>();
  @Output() fullscreen = new EventEmitter<void>();
  @Output() settings = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<{ id: string; value: any }>();

  // ===== SIGNALS =====
  isFullscreen = signal(false);
  refreshTimer = signal<NodeJS.Timeout | null>(null);

  // ===== COMPUTED =====
  hasContent = computed(() => !this.loading.isLoading && !this.error.hasError);
  shouldShowFilters = computed(() => this.filters.length > 0);
  shouldShowTabs = computed(() => this.tabs.length > 0);

  // ===== LIFECYCLE =====
  ngOnInit() {
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  // ===== MÉTHODES PUBLIQUES =====

  /**
   * Change d'onglet
   */
  onTabChange(tabId: string) {
    this.tabChange.emit(tabId);
  }

  /**
   * Déclenche un rafraîchissement
   */
  onRefresh() {
    this.refresh.emit();
  }

  /**
   * Déclenche un export
   */
  onExport(format: 'pdf' | 'excel' | 'csv' = 'pdf') {
    const exportConfig: ExportConfig = {
      format,
      filename: `${this.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`,
      includeCharts: true,
      includeData: true
    };
    this.export.emit(exportConfig);
  }

  /**
   * Bascule le mode plein écran
   */
  onToggleFullscreen() {
    this.isFullscreen.set(!this.isFullscreen());
    this.fullscreen.emit();
  }

  /**
   * Ouvre les paramètres
   */
  onSettings() {
    this.settings.emit();
  }

  /**
   * Gère le changement de filtre
   */
  onFilterChange(filterId: string, value: any) {
    this.filterChange.emit({ id: filterId, value });
  }

  /**
   * Retourne le temps écoulé depuis la dernière mise à jour
   */
  getTimeSinceUpdate(): string {
    if (!this.lastUpdated) return '';

    const diff = Date.now() - this.lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes === 1) return 'Il y a 1 minute';
    if (minutes < 60) return `Il y a ${minutes} minutes`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Il y a 1 heure';
    if (hours < 24) return `Il y a ${hours} heures`;

    return 'Il y a plus de 24h';
  }

  // ===== MÉTHODES PRIVÉES =====

  /**
   * Démarre le rafraîchissement automatique
   */
  private startAutoRefresh() {
    if (this.refreshTimer()) {
      clearInterval(this.refreshTimer()!);
    }

    const timer = setInterval(() => {
      this.onRefresh();
    }, this.refreshInterval);

    this.refreshTimer.set(timer);
  }

  /**
   * Arrête le rafraîchissement automatique
   */
  private stopAutoRefresh() {
    if (this.refreshTimer()) {
      clearInterval(this.refreshTimer()!);
      this.refreshTimer.set(null);
    }
  }
}
