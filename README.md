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
