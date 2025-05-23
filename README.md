[//]: # (# Tickly - Frontend)

[//]: # ()
[//]: # (Ce dépôt contient le code source de l'interface utilisateur de Tickly, une application web dédiée à la gestion de billetterie pour les structures culturelles. Le frontend est développé avec Angular Material UI et Bootstrap, offrant une expérience utilisateur moderne et réactive.)

[//]: # ()
[//]: # (## Fonctionnalités principales)

[//]: # ()
[//]: # (- Navigation intuitive pour les utilisateurs.)

[//]: # (- Réservation de billets avec sélection interactive des places.)

[//]: # (- Gestion des événements et affichage des informations des structures culturelles.)

[//]: # (- Génération de QR codes pour les billets électroniques. )

# Design de page détaillée d'un événement
## Concept général
Une page moderne et immersive qui met en valeur l'événement tout en fournissant toutes les informations nécessaires pour l'utilisateur. La page sera divisée en sections distinctes pour faciliter la navigation et la compréhension.
## Structure de la page
### 1. Bannière immersive
- **Image de couverture** en grand format occupant toute la largeur (hauteur ~400px)
- **Overlay gradient** semi-transparent (dégradé du bas vers le haut) pour améliorer la lisibilité du texte
- **Titre de l'événement** en grand et en gras sur l'image
- **Date et heure** affichées de manière proéminente
- **Badge de statut** (Complet, Places disponibles, Annulé, etc.)
- **Bouton "Réserver"** mis en évidence dans le coin droit

### 2. Informations principales (juste en dessous de la bannière)
- **Structure organisatrice** avec logo, nom et lien vers sa page
- **Lieu** avec adresse complète et bouton/lien pour voir sur une carte
- **Prix** des billets (min-max ou par catégorie)
- **Nombre de places disponibles** avec pourcentage ou visualisation
- **Boutons d'actions rapides**:
  - Ajouter aux favoris
  - Ajouter au calendrier

### 3. Description et détails
- **Description complète** de l'événement (formatée avec paragraphes)
- **Catégories/tags** de l'événement (musique, théâtre, festival, etc.)
- **Artistes/intervenants** si applicable

### 4. Galerie de médias
- **Photos/vidéos** de l'événement ou d'événements passés similaires, type mosaïque simple
- Possibilité de voir en plein écran
- Possibilité de navigation carrousel si plus de 5 photos ajoutées.

### 5. Informations sur les billets
- **Types de billets disponibles**
- **Tarifs** pour chaque catégorie

### 7. Informations pratiques
- **Horaires d'ouverture des portes**

### 8. Section sociale
- **Qui y va** (si amis sur la plateforme)

### 9. Événements similaires
- **Carrousel d'événements** similaires ou du même organisateur

## Éléments de design
### Style visuel
- Palette de couleurs cohérente avec l'identité de Tickly (violet #6c63ff, accent #f72585)
- Utilisation du blanc pour les espaces de contenu principal
- Sections alternant fond blanc/fond gris clair pour marquer la séparation
- Ombres légères pour donner de la profondeur aux cartes et conteneurs

### Typographie
- Titres en police sans-serif (Manrope, Montserrat ou similaire)
- Corps de texte en police lisible et aérée
- Hiérarchie claire avec différentes tailles/poids de police

### Composants UI
- Boutons d'action principaux en couleur primaire (#6c63ff)
- Bouton "Réserver" en couleur accent (#f72585) pour attirer l'attention
- Cartes avec coins arrondis pour les sections distinctes
- Icônes Material Design pour une expérience cohérente

### Responsive
- Adaptation complète pour mobile
- Sur mobile: sections empilées verticalement
- Sur desktop: mise en page en colonnes pour certaines sections (ex: description + galerie côte à côte)
- Menu ancres fixe en haut pour naviguer entre les sections sur mobile

## Fonctionnalités interactives
- **Compteur de places disponibles** en temps réel
- **Timer de réservation** si l'utilisateur commence le processus d'achat
- **Animation de survol** sur les sections cliquables
- **Smooth scroll** entre les sections via les ancres

## Adaptations selon le type d'événement
- Pas d'adaptation notoire, il faut adapter simplement et trouver des compromis pour ne pas trop surcharger


# Plan de développement pour la page de détails d'événement

## 1. Configuration de la structure du projet

### 1.1 Création des fichiers du composant
```shell script
ng generate component pages/public/event-details-page --standalone
```

### 1.2 Création des sous-composants
```shell script
# Bannière immersive
ng generate component shared/components/event-details/event-banner --standalone

# Sections principales
ng generate component shared/components/event-details/event-info-section --standalone
ng generate component shared/components/event-details/event-description-section --standalone
ng generate component shared/components/event-details/event-gallery-section --standalone
ng generate component shared/components/event-details/event-tickets-section --standalone
ng generate component shared/components/event-details/event-practical-info-section --standalone
ng generate component shared/components/event-details/event-social-section --standalone
ng generate component shared/components/event-details/similar-events-section --standalone

# Composants de navigation
ng generate component shared/components/event-details/event-navigation --standalone
```


## 2. Configuration des routes

### 2.1 Modification du fichier de routes
Ajouter la route de détails d'événement dans `src/app/pages/public/public.routes.ts`:

```typescript
const routes: Routes = [
  // ... autres routes existantes
  {
    path: 'events/:id',
    loadComponent: () => import('./event-details-page/event-details-page.component')
      .then(c => c.EventDetailsPageComponent),
    title: 'Détails de l'événement | Tickly'
  }
];
```


## 3. Développement des composants par ordre de priorité

### 3.1 Composant principal (EventDetailsPageComponent)
- Mettre en place la structure de base
- Implémenter le chargement des données de l'événement
- Gérer les états (chargement, erreur, succès)
- Intégrer tous les sous-composants

### 3.2 Bannière immersive (EventBannerComponent)
- Développer la bannière avec l'image de couverture
- Ajouter l'overlay gradient
- Intégrer les informations principales (titre, date, heure)
- Ajouter le badge de statut et le bouton de réservation

### 3.3 Section d'informations principales (EventInfoSectionComponent)
- Afficher les informations sur l'organisateur
- Intégrer les détails du lieu
- Afficher les prix et disponibilités
- Ajouter les boutons d'actions rapides

### 3.4 Section de description (EventDescriptionSectionComponent)
- Afficher la description complète
- Intégrer les catégories/tags
- Ajouter les informations sur les artistes/intervenants

### 3.5 Galerie de médias (EventGallerySectionComponent)
- Implémenter la mosaïque d'images
- Intégrer le carrousel pour la navigation

### 3.6 Section des billets (EventTicketsSectionComponent)
- Afficher les types de billets disponibles
- Intégrer les tarifs
- Ajouter le compteur de places disponibles

### 3.7 Informations pratiques (EventPracticalInfoSectionComponent)
- Afficher les horaires d'ouverture des portes

### 3.8 Section sociale (EventSocialSectionComponent)
- Intégrer la fonctionnalité "Qui y va"

### 3.9 Événements similaires (SimilarEventsSectionComponent)
- Développer le carrousel d'événements similaires

### 3.10 Navigation (EventNavigationComponent)
- Créer une barre de navigation ancrée pour la version mobile
- Implémenter le smooth scroll entre les sections

## 4. Services et modèles

### 4.1 Amélioration du service d'événements
Ajouter des méthodes au service EventService:
```typescript
// Dans event.service.ts
getEventById(id: string): Observable<EventModel>
getSimilarEvents(eventId: string, limit: number = 4): Observable<EventModel[]>
getEventParticipants(eventId: string): Observable<UserModel[]>
```


### 4.2 Création de services auxiliaires si nécessaire
```typescript
// Services potentiels à créer ou étendre
TicketService
GalleryService
CalendarService (pour l'ajout au calendrier)
```


## 5. Styles et responsive

### 5.1 Création des fichiers SCSS
- Définir les variables globales (couleurs, espacements)
- Créer des mixins pour la responsivité
- Définir les styles communs aux sections

### 5.2 Adaptation pour mobile
- Développer la version mobile en priorité (mobile-first)
- Ajouter les media queries pour les écrans plus grands
- Tester sur différentes tailles d'écran

## 6. Fonctionnalités interactives

### 6.1 Compteur de places disponibles
- Implémenter l'affichage du nombre de places
- Ajouter l'animation de décompte

### 6.2 Timer de réservation
- Développer le minuteur pour le processus de réservation
- Intégrer les notifications

### 6.3 Animations et interactions
- Ajouter les animations au survol
- Implémenter le smooth scroll

## 7. Intégration des services d'API

### 7.1 Configuration des intercepteurs
- Gérer les erreurs API
- Ajouter les headers d'authentification si nécessaire

### 7.2 Mise en cache des données
- Implémenter le caching pour améliorer les performances
- Gérer la fraîcheur des données

## Échéancier proposé

1. **Semaine 1** : Structure du projet, routes et composant principal
2. **Semaine 2** : Bannière, section info et description
3. **Semaine 3** : Galerie, billets et infos pratiques
4. **Semaine 4** : Section sociale, événements similaires et navigation
5. **Semaine 5** : Fonctionnalités interactives et intégration API
6. **Semaine 6** : Tests, optimisations et documentation

## Diagramme de dépendances (représentation textuelle)

```
EventDetailsPageComponent
├── EventBannerComponent
├── EventInfoSectionComponent
├── EventDescriptionSectionComponent
├── EventGallerySectionComponent
├── EventTicketsSectionComponent
├── EventPracticalInfoSectionComponent
├── EventSocialSectionComponent
├── SimilarEventsSectionComponent
└── EventNavigationComponent
```


