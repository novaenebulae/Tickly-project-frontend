## Conception de la Page "Tous les Événements"

L'objectif est de créer une page claire, fonctionnelle et esthétiquement agréable qui permette aux utilisateurs de parcourir, filtrer et découvrir facilement tous les événements disponibles sur la plateforme. Le design sera cohérent avec la landing page, en utilisant la palette de couleurs définie et en intégrant des éléments dynamiques et animés.

**Palette de Couleurs Principale (Rappel) :**
*   `$primary-color: #0A2A4E` (Bleu marine foncé)
*   `$accent-color: #FF8C42` (Orange corail vif)
*   `$secondary-color: #3A7CA5` (Bleu moyen)
*   `$light-text-color: #F8F9FA`
*   `$dark-text-color: #212529`
*   `$section-bg-light: #FFFFFF`
*   `$section-bg-darker: #f0f4f8`

---

**1. En-tête de Page et Titre**
*   **Objectif :** Introduire clairement la page et offrir une première accroche.
*   **Contenu :**
  *   **Titre Principal :** "Tous les Événements" ou "Explorez Nos Événements"
  *   **Sous-titre :** "Découvrez une multitude d'expériences : concerts, théâtre, festivals, et bien plus encore."
*   **Design et Ambiance :**
  *   **Arrière-plan :** Un bandeau avec un dégradé subtil de `$primary-color` à `$secondary-color`, ou une couleur unie `$primary-color` avec une texture SVG discrète (similaire au footer, mais plus légère).
  *   **Texte :** En `$light-text-color` pour un bon contraste.
  *   **Animation :** Animation d'entrée pour le titre et le sous-titre (ex: fondu et léger glissement).

**2. Barre de Filtres et de Tri (Sticky ou Fixe en haut)**
*   **Objectif :** Permettre aux utilisateurs d'affiner leur recherche facilement. Cette barre pourrait devenir "sticky" au défilement pour un accès constant.
*   **Contenu :**
  *   **Bouton "Filtres" principal (comme sur votre screenshot [1]) :**
    *   Ouvre un menu déroulant plus large avec des options de filtrage avancées.
    *   Label : "Filtres" avec une icône (ex: `filter_list`).
    *   Couleur : Bouton `mat-stroked-button` avec `$primary-color`.
  *   **Filtres rapides par Catégorie (comme sur votre screenshot [1]) :**
    *   Une série de boutons "chips" ou "tabs" pour les catégories principales (`EventCategory`).
    *   Exemples : "Voir tout", "Concerts", "Théâtre", "Festivals", "Sports", "Expositions", "Conférences", "Autres".
    *   Le bouton actif utilisera `$accent-color` comme fond et texte `$light-text-color`, les autres un fond `$section-bg-darker` et texte `$primary-color`.
  *   **Option de Tri (sur la droite, comme sur votre screenshot [1]) :**
    *   Un menu déroulant (`mat-select`) avec des options comme :
      *   "Pertinence" (par défaut)
      *   "Date (les plus proches)"
      *   "Date (les plus lointains)"
      *   "Popularité" (si cette donnée existe)
      *   "Prix (croissant)" (si applicable et facilement déterminable)
      *   "Prix (décroissant)"
  *   **Champ de Recherche par Mots-Clés :**
    *   Un champ de saisie (`mat-form-field` avec `input`) pour rechercher par nom d'événement, lieu, ou tags.
    *   Icône de loupe.
  *   **Affichage du Nombre de Résultats (comme sur votre screenshot [1]) :**
    *   Texte indiquant "X résultats trouvés" ou "Affichage de Y à Z sur X résultats".
*   **Design et Ambiance :**
  *   **Arrière-plan de la barre :** `$section-bg-light` ou `$section-bg-darker` avec une ombre subtile si elle est sticky.
  *   **Interactions :** Les filtres actifs seront clairement indiqués. Des animations discrètes au survol des boutons/chips.

**3. Panneau de Filtres Avancés (accessible via le bouton "Filtres")**
*   **Objectif :** Offrir des options de filtrage plus granulaires.
*   **Contenu :**
  *   **Date :**
    *   Sélecteur de plage de dates (`mat-date-range-input`).
    *   Options rapides : "Aujourd'hui", "Ce week-end", "Semaine prochaine", "Mois prochain".
  *   **Lieu/Ville :**
    *   Champ de saisie
  *   **Genre (si pertinent pour la catégorie sélectionnée) :**
    *   Liste de checkboxes ou de chips pour `event.genre`.
  *   **Boutons :** "Appliquer les filtres" (couleur `$accent-color`) et "Réinitialiser".
*   **Design et Ambiance :**
  *   S'ouvre comme un panneau latéral (`mat-drawer`) ou un grand menu déroulant.
  *   Utilisation des composants Angular Material pour les formulaires.

**4. Grille d'Affichage des Événements**
*   **Objectif :** Présenter les événements de manière claire et attrayante, en réutilisant `EventCardComponent`.
*   **Contenu :**
  *   Une grille responsive affichant les `app-event-card`.
  *   Le nombre de colonnes s'adaptera à la taille de l'écran (ex: 1 sur mobile, 2 sur tablette, 3 ou 4 sur desktop).
*   **Design et Ambiance :**
  *   **Arrière-plan de la section :** `$section-bg-light` ou `$section-bg-darker`.
  *   **Cartes :** Les `app-event-card` avec le design que vous avez déjà développé.
  *   **Animations :**
    *   Animation d'entrée en cascade pour les cartes lorsqu'elles se chargent ou que les filtres sont appliqués (stagger).
    *   Effet de survol sur les cartes (déjà défini dans `EventCardComponent`).
  *   **État de chargement :** Affichage de "skeletons" (cartes vides stylisées) pendant le chargement des données.
  *   **Aucun résultat :** Un message clair et engageant si aucun événement ne correspond aux filtres, avec potentiellement un bouton pour réinitialiser les filtres ou explorer d'autres catégories.

**5. Pagination (en bas de la grille d'événements)**
*   **Objectif :** Gérer un grand nombre d'événements sans surcharger la page.
*   **Contenu :**
  *   Composant de pagination standard (`mat-paginator` ou un design personnalisé comme sur votre screenshot [1] "Previous 1 2 3 ... Next").
*   **Design et Ambiance :**
  *   Boutons et numéros de page clairs.
  *   L'élément actif (page actuelle) utilisera `$accent-color`.

**6. Éléments Graphiques et Textures**
*   **Objectif :** Renforcer l'identité visuelle et le dynamisme.
*   **Utilisation :**
  *   Des textures SVG subtiles peuvent être utilisées en fond de certaines sections (comme l'en-tête ou la barre de filtres si elle n'est pas trop chargée).
  *   Des séparateurs de section avec des formes SVG légères ou des dégradés.
  *   Des icônes cohérentes (Material Icons ou un set personnalisé).

**7. Interactions et Animations Générales**
*   **Transitions fluides** lors de l'application des filtres et du chargement de nouveaux événements.
*   **Micro-interactions** sur les boutons et les éléments cliquables.
*   Le **défilement** de la page doit être fluide.

**Structure Générale de la Page (Layout) :**

1.  **Navbar (existante et fixe en haut)**
2.  **En-tête de la Page "Tous les Événements"**
3.  **Barre de Filtres et de Tri (potentiellement sticky)**
4.  **Grille des `app-event-card`**
5.  **Pagination**
6.  **Footer (existant et en bas)**


La liste d'événement doit être affichée en card de base, mais peut également l'être sous forme de liste avec un sélecteur :
*   Chaque élément de la liste est une version "horizontale" ou "compacte" de la `app-event-card`, avec l'image à gauche et les détails à droite.
*   Le bouton "Voir l'événement" serait bien visible à droite.
*   Les filtres et le tri en haut restent pertinents.

