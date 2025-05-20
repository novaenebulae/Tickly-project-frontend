# Tickly - Frontend

Ce dépôt contient le code source de l'interface utilisateur de Tickly, une application web dédiée à la gestion de billetterie pour les structures culturelles. Le frontend est développé avec Angular Material UI et Bootstrap, offrant une expérience utilisateur moderne et réactive.

## Fonctionnalités principales

- Navigation intuitive pour les utilisateurs.
- Réservation de billets avec sélection interactive des places.
- Gestion des événements et affichage des informations des structures culturelles.
- Génération de QR codes pour les billets électroniques. 

1. **Phase 3: Développement du système de filtres**
  - Création du composant de filtres pour les structures
  - Intégration avec le composant principal

2. **Phase 4: Création des composants d'affichage**
  - Composant card pour l'affichage en liste
  - Composant mosaic pour l'affichage en mosaïque

3. **Phase 5: Implémentation de la logique de mosaïque**
  - Algorithme de détermination des tailles de tuiles
  - Disposition et équilibrage de la mosaïque

4. **Phase 6: Intégration et finitions**
  - Animations et transitions
  - Tests et optimisations des performances

## Composants à développer
1. **Page principale**
  - `all-structures-page.component.ts`
  - `all-structures-page.component.html`
  - `all-structures-page.component.scss`

2. **Composant d'affichage des structures**
  - `structures-display.component.ts`
  - `structures-display.component.html`
  - `structures-display.component.scss`

3. **Composant de filtres**
  - `structure-filters.component.ts`
  - `structure-filters.component.html`
  - `structure-filters.component.scss`

4. **Composants d'affichage des items**
  - `structure-card-item.component.ts` (pour la vue liste)
  - `structure-mosaic-item.component.ts` (pour la vue mosaïque)
