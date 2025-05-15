**Phase 0 : Prérequis (Composants et Services Existant)**

*   **`Event` Model (Interface) :** Déjà défini (`src/app/core/models/event.model.ts`).
*   **`EventService` :** Déjà défini, avec des mocks (`src/app/core/services/event.service.ts`).
*   **`EventCardComponent` :** Déjà développé (`src/app/shared/components/event-card/`). Il sera utilisé pour la vue en grille.

**Phase 1 : Développement des Composants d'Affichage Individuels (si nécessaire)**

1.  **`EventListItemComponent` (Nouveau Composant Partagé)**
  *   **Objectif :** Afficher un événement unique sous forme d'item de liste (disposition horizontale).
  *   **Fichiers :**
    *   `src/app/shared/components/event-list-item/event-list-item.component.ts`
    *   `src/app/shared/components/event-list-item/event-list-item.component.html`
    *   `src/app/shared/components/event-list-item/event-list-item.component.scss`
  *   **Description :**
    *   Sera `standalone: true`.
    *   Prendra un objet `Event` en `@Input()`.
    *   Affichera l'image de l'événement à gauche, les informations principales (titre, date, lieu, courte description) au centre/droite, et un bouton "Voir l'événement" à droite.
    *   Sera utilisé par le futur `EventsDisplayComponent` pour le mode d'affichage "liste".

**Phase 2 : Développement des Composants Fonctionnels Partagés**

2.  **`EventFiltersComponent` (Nouveau Composant Partagé)**
  *   **Objectif :** Encapsuler toute la logique et l'interface utilisateur pour le filtrage et le tri des événements.
  *   **Fichiers :**
    *   `src/app/shared/components/event-filters/event-filters.component.ts`
    *   `src/app/shared/components/event-filters/event-filters.component.html`
    *   `src/app/shared/components/event-filters/event-filters.component.scss`
  *   **Description :**
    *   Sera `standalone: true`.
    *   **`@Input()` (Optionnel) :** Pourrait recevoir des données initiales (ex: liste des catégories/genres disponibles si non récupérées en interne).
    *   **`@Output()` `filtersChanged` :** Émettra un objet contenant les critères de filtre/tri actuels chaque fois qu'un filtre ou un tri est modifié.
    *   **Interface Interne :**
      *   Champ de recherche par mots-clés.
      *   Chips/tabs pour les filtres rapides par catégorie.
      *   Menu déroulant pour le tri.
      *   Bouton "Filtres avancés" qui ouvrira un panneau/menu (ce panneau peut être géré en interne par ce composant ou être un composant enfant).
        *   **Panneau Filtres Avancés (interne ou enfant) :** contiendra les sélecteurs de date, champ lieu/ville, checkboxes/chips pour genres.
      *   Boutons "Appliquer" et "Réinitialiser" pour les filtres avancés.
    *   Gérera l'état interne des filtres.

3.  **`EventsDisplayComponent` (Nouveau Composant Partagé)**
  *   **Objectif :** Gérer l'affichage (grille ou liste) des événements fournis et la pagination.
  *   **Fichiers :**
    *   `src/app/shared/components/events-display/events-display.component.ts`
    *   `src/app/shared/components/events-display/events-display.component.html`
    *   `src/app/shared/components/events-display/events-display.component.scss`
  *   **Description :**
    *   Sera `standalone: true`.
    *   **`@Input() events: Event[]` :** La liste des événements (déjà filtrés et triés) à afficher.
    *   **`@Input() displayMode: 'grid' | 'list' = 'grid'` :** Le mode d'affichage actuel.
    *   **`@Input() isLoading: boolean = false` :** Pour afficher des skeletons ou un indicateur de chargement.
    *   **`@Input() totalItems: number = 0` :** Nombre total d'items pour la pagination.
    *   **`@Input() pageSize: number = 12` :** Nombre d'items par page.
    *   **`@Input() currentPage: number = 1` :** Page actuelle.
    *   **`@Output() pageChanged: EventEmitter` (de `MatPaginator`) :** Émettra l'événement de changement de page.
    *   **Interface Interne :**
      *   Utilisera `@if` pour basculer entre la vue grille (utilisant ``) et la vue liste (utilisant ``).
      *   Contiendra le composant de pagination (`mat-paginator` ou design personnalisé).
      *   Affichera les skeletons si `isLoading` est vrai et `events` est vide.
      *   Affichera un message "Aucun résultat" si `events` est vide et `isLoading` est faux.

**Phase 3 : Création de la Page Principale "Tous les Événements"**

4.  **`AllEventsPageComponent` (Composant de Page)**
  *   **Objectif :** Orchestrer les composants `EventFiltersComponent` et `EventsDisplayComponent`, gérer la récupération des données initiales, et appliquer la logique de filtrage/tri/pagination.
  *   **Fichiers :**
    *   `src/app/features/all-events-page/all-events-page.component.ts`
    *   `src/app/features/all-events-page/all-events-page.component.html`
    *   `src/app/features/all-events-page/all-events-page.component.scss`
  *   **Description :**
    *   Sera `standalone: true`.
    *   **Imports Standalone :** `CommonModule`, `RouterModule`, `EventFiltersComponent`, `EventsDisplayComponent`, et les modules Material nécessaires pour l'en-tête, etc.
    *   Injectera `EventService` et `Router`.
    *   **Logique :**
      *   Récupérera tous les événements depuis `EventService` dans `ngOnInit`.
      *   Maintiendra l'état de la liste complète des événements (`fullEventsList`).
      *   Maintiendra l'état des filtres/tri actuels (reçus de `EventFiltersComponent` ou initialisés).
      *   Maintiendra l'état du mode d'affichage (`displayMode`).
      *   Appliquera les filtres et le tri à `fullEventsList` pour produire une liste `processedEvents`.
      *   Gérera la pagination : calculera la tranche `displayedEvents` à partir de `processedEvents` en fonction des événements du `MatPaginator`.
      *   Passera `displayedEvents`, `displayMode`, `isLoading`, `totalItems` (longueur de `processedEvents`), etc., à ``.
      *   Passera les options initiales (si besoin) à ``.
      *   Écoutera l'événement `filtersChanged` de `` pour mettre à jour les filtres et relancer le traitement.
      *   Écoutera l'événement `pageChanged` de `` pour mettre à jour la pagination.
    *   **Template HTML :**
      *   En-tête de page (titre, sous-titre).
      *   Zone pour le sélecteur de vue Grid/List.
      *   ``.
      *   Affichage du nombre de résultats.
      *   ``.
    *   **SCSS :** Styles spécifiques à la mise en page de `AllEventsPageComponent`, styles pour l'en-tête.

**Ordre de Développement Logique :**

1.  **`EventListItemComponent`** : Créer la brique d'affichage pour la vue en liste.
2.  **`EventFiltersComponent`** : Développer l'interface et la logique de tous les filtres et du tri. S'assurer qu'il émet correctement les critères.
3.  **`EventsDisplayComponent`** : Développer l'interface qui affiche les événements (en utilisant `EventCardComponent` et le nouveau `EventListItemComponent`) et intègre la pagination. S'assurer qu'il réagit aux `@Input` et émet l'événement de page.
4.  **`AllEventsPageComponent`** : Assembler le tout. Intégrer `EventFiltersComponent` et `EventsDisplayComponent`. Gérer le flux de données depuis `EventService`, l'application des filtres/tri, et la logique de pagination.

Cette approche modulaire vous permettra de bien séparer les préoccupations et de maximiser la réutilisabilité des composants de filtre et d'affichage des événements.

