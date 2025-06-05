/**
 * Périodes temporelles pour les statistiques
 */
export type StatsTimeframe =
  | '7d'     // 7 derniers jours
  | '30d'    // 30 derniers jours
  | '3m'     // 3 derniers mois
  | '6m'     // 6 derniers mois
  | '1y'     // 1 année
  | 'custom'; // Période personnalisée

export interface StatsDateRange {
  startDate: Date;
  endDate: Date;
  timeframe: StatsTimeframe;
}
