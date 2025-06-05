import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../../../../core/config/app-config';

export interface FormattedValue {
  raw: number;
  formatted: string;
  unit?: string;
  color?: string;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
  formatted: string;
  color: string;
  icon: string;
}

// Interfaces pour les types de seuils
interface FillRateThresholds {
  excellent: number;
  good: number;
  average: number;
  poor: number;
}

interface AttendanceThresholds {
  high: number;
  medium: number;
  low: number;
}

interface PerformanceThresholds {
  growth: {
    excellent: number;
    good: number;
    stable: number;
    declining: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StatsFormatterService {

  /**
   * Formate un nombre pour l'affichage
   */
  formatNumber(value: number, decimals: number = 0): string {
    if (value === null || value === undefined) return '--';

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(decimals)}k`;
    }

    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Formate un pourcentage
   */
  formatPercentage(value: number, decimals: number = 1): string {
    if (value === null || value === undefined) return '--';
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Formate une valeur monétaire
   */
  formatCurrency(value: number, currency: string = '€'): string {
    if (value === null || value === undefined) return '--';
    return `${this.formatNumber(value, 2)} ${currency}`;
  }

  /**
   * Formate une tendance avec couleur et icône
   */
  formatTrend(percentage: number, period: string = 'vs mois précédent'): TrendData {
    const absPercentage = Math.abs(percentage);
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable';

    const colors = {
      up: APP_CONFIG.stats.charts.colors.success,
      down: APP_CONFIG.stats.charts.colors.danger,
      stable: APP_CONFIG.stats.charts.colors.secondary
    };

    const icons = {
      up: 'trending-up',
      down: 'trending-down',
      stable: 'minus'
    };

    const signs = {
      up: '+',
      down: '-',
      stable: ''
    };

    return {
      direction,
      percentage: absPercentage,
      period,
      formatted: `${signs[direction]}${this.formatPercentage(absPercentage)} ${period}`,
      color: colors[direction],
      icon: icons[direction]
    };
  }

  /**
   * Détermine la couleur selon un seuil
   */
  getThresholdColor(value: number, thresholds: any, type: 'fillRate' | 'performance' = 'fillRate'): string {
    const colors = APP_CONFIG.stats.charts.colors;

    if (type === 'fillRate') {
      const fillRateThresholds = APP_CONFIG.stats.thresholds.fillRate as FillRateThresholds;
      if (value >= fillRateThresholds.excellent) return colors.success;
      if (value >= fillRateThresholds.good) return colors.primary;
      if (value >= fillRateThresholds.average) return colors.warning;
      return colors.danger;
    }

    if (type === 'performance') {
      const performanceThresholds = APP_CONFIG.stats.thresholds.performance as PerformanceThresholds;
      if (value >= performanceThresholds.growth.excellent) return colors.success;
      if (value >= performanceThresholds.growth.good) return colors.primary;
      if (value >= performanceThresholds.growth.stable) return colors.warning;
      return colors.danger;
    }

    return colors.primary;
  }

  /**
   * Formate une valeur avec unité et couleur
   */
  formatKPI(value: number, unit: string = '', type?: 'fillRate' | 'performance'): FormattedValue {
    const formatted = unit === '%' ? this.formatPercentage(value) : this.formatNumber(value);

    return {
      raw: value,
      formatted: `${formatted}${unit === '%' ? '' : ` ${unit}`}`,
      unit,
      color: type ? this.getThresholdColor(value, null, type) : undefined
    };
  }

  /**
   * Formate une date pour les graphiques
   */
  formatChartDate(date: Date | string, granularity: 'hour' | 'day' | 'week' | 'month' = 'day'): string {
    const d = new Date(date);

    switch (granularity) {
      case 'hour':
        return d.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      case 'day':
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      case 'week':
        return `S${this.getWeekNumber(d)}`;
      case 'month':
        return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      default:
        return d.toLocaleDateString('fr-FR');
    }
  }

  /**
   * Calcule le numéro de semaine
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  /**
   * Génère un statut textuel basé sur un seuil
   */
  getStatusLabel(value: number, type: 'fillRate' | 'attendance' | 'performance' = 'fillRate'): string {
    const thresholds = APP_CONFIG.stats.thresholds;

    switch (type) {
      case 'fillRate':
        const fillRateThresholds = thresholds.fillRate as FillRateThresholds;
        if (value >= fillRateThresholds.excellent) return 'Excellent';
        if (value >= fillRateThresholds.good) return 'Bon';
        if (value >= fillRateThresholds.average) return 'Moyen';
        return 'Faible';

      case 'attendance':
        const attendanceThresholds = thresholds.attendance as AttendanceThresholds;
        if (value >= attendanceThresholds.high) return 'Forte affluence';
        if (value >= attendanceThresholds.medium) return 'Affluence modérée';
        return 'Faible affluence';

      case 'performance':
        const performanceThresholds = thresholds.performance as PerformanceThresholds;
        if (value >= performanceThresholds.growth.excellent) return 'Excellent';
        if (value >= performanceThresholds.growth.good) return 'Bon';
        if (value >= performanceThresholds.growth.stable) return 'Stable';
        return 'En déclin';

      default:
        return 'N/A';
    }
  }

  /**
   * Calcule la différence entre deux valeurs
   */
  calculateChange(current: number, previous: number): { percentage: number; absolute: number } {
    if (previous === 0) return { percentage: 0, absolute: current };

    const absolute = current - previous;
    const percentage = (absolute / previous) * 100;

    return { percentage, absolute };
  }

  /**
   * Formate une durée en millisecondes
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}j ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}min`;
    if (minutes > 0) return `${minutes}min ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Génère des couleurs pour un dataset
   */
  generateColors(count: number, baseColor?: string): string[] {
    const colors = Object.values(APP_CONFIG.stats.charts.colors);
    const result: string[] = [];

    for (let i = 0; i < count; i++) {
      if (baseColor) {
        // Variations du couleur de base
        result.push(this.adjustColorOpacity(baseColor, 1 - (i * 0.1)));
      } else {
        // Utilise les couleurs configurées en rotation
        result.push(colors[i % colors.length]);
      }
    }

    return result;
  }

  /**
   * Ajuste l'opacité d'une couleur
   */
  private adjustColorOpacity(color: string, opacity: number): string {
    // Simple implementation pour les couleurs hex
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return color.length === 7 ? `${color}${alpha}` : color;
  }

  /**
   * Formate les étiquettes pour les graphiques temporels
   */
  formatTimeSeriesLabels(timestamps: (string | Date)[], granularity: 'hour' | 'day' | 'week' | 'month'): string[] {
    return timestamps.map(ts => this.formatChartDate(ts, granularity));
  }

  /**
   * Calcule les statistiques de base d'un dataset
   */
  calculateBasicStats(values: number[]): { min: number; max: number; avg: number; sum: number } {
    if (values.length === 0) return { min: 0, max: 0, avg: 0, sum: 0 };

    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { min, max, avg, sum };
  }
}
