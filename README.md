## Architecture du Service de Statistiques
### 1. EventStatsService - Service Principal
Le service principal gérera plusieurs types de données statistiques :
**Données instantanées** :
- Taux de remplissage actuel
- Nombre de billets attribués
- Réservations uniques
- Statut de scan

**Données historiques** :
- Évolution du taux de remplissage dans le temps
- Points de données quotidiens/hebdomadaires
- Courbes de progression des réservations

**Données comparatives** :
- Comparaison avec la même période de l'année précédente
- Comparaison avec d'autres événements similaires
- Benchmarks par catégorie d'événement

### 2. Gestion des Charts d'Évolution
#### Structure des Données Temporelles
Le service gérera des **séries temporelles** pour chaque événement :
``` 
EventTimeSeriesData = {
  eventId: number,
  dataPoints: [
    {
      timestamp: Date,
      fillRate: number,
      ticketsAttributed: number,
      cumulativeReservations: number
    }
  ]
}
```
#### Types de Charts Supportés
**Chart Principal - Évolution du Taux de Remplissage** :
- Axe X : Timeline (jours/semaines avant l'événement)
- Axe Y : Pourcentage de remplissage (0-100%)
- Points clés : dates de lancement, pics de réservation, plateaux

**Chart Secondaire - Réservations Cumulatives** :
- Courbe de croissance des réservations
- Comparaison avec les objectifs
- Identification des périodes de forte/faible activité

### 3. Mécanisme de Cache et Actualisation
#### Cache Hiérarchique
**Niveau 1 - Cache Composant** :
- Données utilisées directement par les composants
- TTL court (5-10 minutes)
- Invalidation manuelle possible

**Niveau 2 - Cache Service** :
- Données agrégées et pré-calculées
- TTL moyen (30 minutes)
- Mise à jour automatique en arrière-plan

**Niveau 3 - Cache API** :
- Données brutes de l'API
- TTL long (1-2 heures)
- Synchronisation avec le backend

#### Stratégie de Rafraîchissement
**Actualisation en Temps Réel** :
- WebSocket ou Server-Sent Events pour les événements en cours
- Mise à jour immédiate lors de nouvelles réservations
- Notifications push pour les changements critiques

**Actualisation Programmée** :
- Tâches cron pour les données historiques
- Calcul nocturne des métriques comparatives
- Pré-génération des charts fréquemment consultés

### 4. Intégration avec Chart.js
#### Configuration des Charts
Le service fournira des **configurations Chart.js pré-formatées** :
``` 
ChartConfiguration = {
  type: 'line',
  data: formattedTimeSeriesData,
  options: {
    responsive: true,
    scales: configuredScales,
    plugins: configuredPlugins
  }
}
```
#### Formatage des Données
**Transformation API → Chart** :
- Conversion des timestamps en labels lisibles
- Normalisation des valeurs (pourcentages, nombres)
- Application des couleurs et styles selon les seuils

**Gestion des Périodes** :
- Adaptation automatique de la granularité (jour/semaine/mois)
- Interpolation des données manquantes
- Lissage des courbes pour une meilleure lisibilité

### 5. Architecture Multi-Niveaux
#### EventStatsService (Service Principal)
**Responsabilités** :
- Orchestration des appels API
- Gestion du cache et de la synchronisation
- Formatage des données pour les composants
- Calcul des métriques dérivées

**Méthodes Principales** :
- `getEventStats(eventId)` → Données instantanées
- `getEventTimeSeries(eventId, period)` → Données temporelles
- `getEventStatsChart(eventId, chartType)` → Configuration Chart.js
- `refreshEventStats(eventId)` → Force la mise à jour

#### EventStatsApiService (Couche API)
**Responsabilités** :
- Communication directe avec les endpoints backend
- Gestion des erreurs et retry automatique
- Transformation des DTOs en modèles métier

**Endpoints Ciblés** :
- `GET /api/events/{id}/stats` → Stats instantanées
- `GET /api/events/{id}/stats/timeseries` → Données temporelles
- `GET /api/events/{id}/stats/comparison` → Données comparatives

### 6. Gestion des États et Réactivité
#### Signals pour la Réactivité
**EventStatsSignals** :
- `currentStats$` → Stats en temps réel
- `timeSeriesData$` → Données pour charts
- `isLoading$` → État de chargement
- `hasError$` → Gestion d'erreurs

#### Pattern de Mise à Jour
**Approche Push** :
1. Composant demande les stats
2. Service vérifie le cache
3. Si nécessaire, appel API
4. Mise à jour des signals
5. Composants réagissent automatiquement

**Approche Pull** :
1. Service poll régulièrement l'API
2. Détection des changements
3. Mise à jour proactive du cache
4. Notification aux composants abonnés

### 7. Optimisations Performance
#### Lazy Loading des Charts
**Chargement Progressif** :
- Données de base chargées en premier
- Charts complexes chargés à la demande
- Pagination pour les données historiques étendues

#### Compression et Agrégation
**Réduction de Volume** :
- Agrégation des données anciennes (journalier → hebdomadaire)
- Compression des séries temporelles longues
- Cache des calculs coûteux (moyennes mobiles, tendances)

### 8. Intégration dans les Composants
#### EventDetailsPanelComponent
**Utilisation** :
- Injection du `EventStatsService`
- Souscription aux signals de stats
- Affichage des KPIs + chart d'évolution
- Actions de rafraîchissement manuel

#### EventsPanelComponent
**Utilisation** :
- Stats agrégées pour la vue d'ensemble
- Mini-charts dans les cartes d'événements
- Comparaisons rapides entre événements

#### StatsComponent
**Utilisation** :
- Dashboard complet avec charts multiples
- Analyses comparatives inter-événements
- Exports et rapports détaillés

### **1. Composants Charts (Graphiques)**
**Base commune** :
- `base-chart.component.ts` - Composant de base avec Chart.js
- `chart-loading.component.ts` - Skeleton loader pour graphiques
- `chart-error.component.ts` - Affichage d'erreur

**Graphiques spécialisés** :
- `line-chart.component.ts` - Courbes temporelles (fill rate, attendance)
- `bar-chart.component.ts` - Barres (événements par mois)
- `doughnut-chart.component.ts` - Camemberts (répartition par catégorie)
- `area-chart.component.ts` - Aires empilées (comparaisons)
- `mixed-chart.component.ts` - Graphiques mixtes (barres + lignes)

### 📈 **2. Composants Widgets**
**KPI Cards** :
- `kpi-card.component.ts` - Carte KPI avec tendance
- `kpi-grid.component.ts` - Grille de KPIs
- `comparison-card.component.ts` - Carte de comparaison

**Stats Cards** :
- `event-stats-card.component.ts` - Carte stats événement
- `structure-stats-card.component.ts` - Carte stats structure
- `performance-widget.component.ts` - Widget performance

**Insights** :
- `audience-insights.component.ts` - Insights audience
- `growth-trends.component.ts` - Tendances de croissance
- `alerts-widget.component.ts` - Widget alertes

### 🎛️ **3. Composants Dashboards**
**Dashboards complets** :
- `event-dashboard.component.ts` - Dashboard événement complet
- `structure-dashboard.component.ts` - Dashboard structure complet
- `global-dashboard.component.ts` - Dashboard global admin

**Sections spécialisées** :
- `performance-section.component.ts` - Section performance
- `analytics-section.component.ts` - Section analytics
- `overview-section.component.ts` - Section overview

### 🔍 **4. Composants Filters**
- `stats-timeframe-filter.component.ts` - Sélecteur période
- `stats-granularity-filter.component.ts` - Sélecteur granularité
- `event-filter.component.ts` - Filtres événements
- `category-filter.component.ts` - Filtres catégories
- `advanced-filters.component.ts` - Filtres avancés

### 📤 **5. Composants Exports**
- `export-button.component.ts` - Bouton export avec menu
- `export-modal.component.ts` - Modal configuration export
- `download-progress.component.ts` - Progression téléchargement

### 🎯 **6. Composants Indicators**
- `status-indicator.component.ts` - Indicateur statut
- `trend-indicator.component.ts` - Indicateur tendance
- `threshold-indicator.component.ts` - Indicateur seuil
- `progress-ring.component.ts` - Anneau de progression

### 📱 **7. Composants Layout/Container**
- `stats-page-layout.component.ts` - Layout page stats
- `stats-grid.component.ts` - Grille responsive
- `stats-tabs.component.ts` - Onglets stats

## 🎯 **Stratégie de Développement**
### **Phase 1 : Fondations (Priorité 1)**
1. **Base Chart Component** - Infrastructure graphiques
2. **KPI Card** - Affichage métriques de base
3. **Stats Page Layout** - Structure des pages

### **Phase 2 : Graphiques (Priorité 1)**
1. **Line Chart** - Pour les courbes temporelles
2. **Bar Chart** - Pour les histogrammes
3. **Doughnut Chart** - Pour les répartitions

### **Phase 3 : Widgets (Priorité 2)**
1. **Event Stats Card** - Carte statistiques événement
2. **Performance Widget** - Widget performance
3. **Audience Insights** - Insights audience

### **Phase 4 : Dashboards (Priorité 2)**
1. **Event Dashboard** - Dashboard événement
2. **Structure Dashboard** - Dashboard structure

### **Phase 5 : Fonctionnalités Avancées (Priorité 3)**
1. **Filters** - Système de filtrage
2. **Exports** - Export des données
3. **Comparisons** - Composants de comparaison

## 🔧 **Composants Communs Requis**
### **Interfaces TypeScript** :
``` typescript
interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'area' | 'mixed';
  data: any;
  options?: any;
  loading?: boolean;
  error?: string;
}

interface KPIData {
  label: string;
  value: number;
  unit?: string;
  trend?: TrendData;
  color?: string;
  icon?: string;
}

interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  period: string;
}
```
### **Services Utilitaires** :
- `ChartService` - Gestion configuration Chart.js
- `StatsFormatterService` - Formatage des données
- `ExportService` - Gestion des exports

## 🎨 **Design System**
### **Couleurs Stats** (basées sur app-config) :
- **Primary** : `#3B82F6` - Données principales
- **Success** : `#10B981` - Tendances positives
- **Warning** : `#F59E0B` - Alertes moyennes
- **Danger** : `#EF4444` - Alertes critiques
- **Info** : `#06B6D4` - Informations

### **Spacing & Layout** :
- **Grid** : 12 colonnes responsive
- **Gaps** : 16px, 24px, 32px
- **Cards** : Border radius 8px, ombre légère
