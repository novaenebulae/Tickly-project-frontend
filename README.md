Parfait ! C'est une excellente idée d'intégrer ces aspects dès maintenant dans notre plan de refactorisation. Ils sont cruciaux pour une application de billetterie complète.

Voici le plan d'action mis à jour, intégrant tes nouvelles demandes et basé sur les services que tu as fournis.

## Plan de Refactorisation Étendu et Détaillé

L'objectif reste le même : une architecture composable, claire, testable et maintenable, utilisant `inject()` et les meilleures pratiques Angular.

---

### Phase 0 : Analyse Initiale et Compréhension (Terminée)

*   Nous avons passé en revue les services API et de domaine que tu as fournis.
*   Nous avons identifié la structure générale et les points forts existants (séparation API/Domaine, `ApiConfigService`).

---

### Phase 1 : Refactorisation des Modèles de Base (Priorité Haute)

*   **Objectif** : Définir des modèles clairs et précis pour toutes les entités de l'application. Éliminer les redondances, les champs inutiles (pas de prix), et définir les DTOs pour les interactions API.
*   **Actions (Domaine par Domaine)** :
  1.  **Événements (Event)** :
    *   **Statut** : Largement traité. `EventModel`, `EventAudienceZone` (ex-`EventSeatingZone`, sans `rowCount`, `seatsPerRow`), `EventCategoryModel`, `EventDataDto` (pour création/update avec `categoryId`).
    *   **Gestion de `fullDescription`** :
      *   **Frontend** : Le modèle `EventModel.fullDescription` (string) est correct. L'affichage de textes longs sera géré par des techniques UI (ex: "lire la suite", scroll, etc.).
      *   **Backend/BDD** : Pour la BDD, un type `TEXT` ou `LONGTEXT` (ou équivalent selon le SGBD, ex: MySQL) est approprié pour stocker des descriptions longues. Le backend (Spring Boot) devra utiliser une annotation `@Lob` (Large Object) ou configurer la colonne pour accepter des textes de grande taille avec JPA.
  2.  **Structure** :
    *   **Fichiers à demander (pour confirmation/adaptation)** : `structure.model.ts`, `structure-type.model.ts`, `area.model.ts` (zone physique de la structure), `address.model.ts`, `structure-search-params.model.ts`.
    *   Nous allons valider ces modèles par rapport aux besoins (pas de prix si applicable, etc.).
  3.  **Authentification (Auth) & Utilisateur (User)** :
    *   **Fichiers à demander** : `auth.model.ts` (pour `JwtPayload`, `AuthResponseDto`, `LoginCredentials`), `user.model.ts` (pour `UserModel`, `UserRegistrationDto`, `UserProfileDto`, etc.).
    *   Valider et simplifier si nécessaire.
  4.  **Amitié (Friendship)** :
    *   **Fichiers à demander** : `friendship.model.ts` (pour `FriendModel`, `FriendRequestModel`).
    *   Valider.
  5.  **Nouveau Domaine : Réservation/Billetterie (Ticketing)** :
    *   **Fichiers à CRÉER (nous allons les concevoir ensemble)** :
      *   `ticket.model.ts` :
        *   `id` (unique, string/UUID)
        *   `eventId` (number)
        *   `eventSnapshot` (objet optionnel avec nom, date de l'événement au moment de la réservation)
        *   `audienceZoneId` (number)
        *   `audienceZoneName` (string)
        *   `participantInfo` : `{ firstName: string, lastName: string, email: string }` (conformément à tes besoins)
        *   `qrCodeData` (string, les données à encoder dans le QR code, ex: URL de validation + ID ticket)
        *   `status` ('valid', 'used', 'cancelled')
        *   `createdAt` (Date)
        *   `usedAt` (Date, optionnel)
      *   `reservation.model.ts` (si on veut représenter un lot de tickets réservés en une fois) :
        *   `id` (optionnel)
        *   `userId` (number, pour l'utilisateur qui a fait la réservation)
        *   `eventId` (number)
        *   `tickets`: `TicketModel[]`
        *   `reservationDate` (Date)
      *   `TicketGenerationDto` (pour la demande de création de ticket(s))
      *   `PdfExportDataDto` (pour les données nécessaires à la génération du PDF)

---

### Phase 2 : Adaptation des Services API (`*-api.service.ts`) (Priorité Moyenne)

*   **Objectif** : S'assurer qu'ils reflètent les nouveaux DTOs définis en Phase 1 et qu'ils restent purement des couches d'accès HTTP.
*   **Actions** :
  1.  Passer en revue chaque service API (`auth-api.service.ts`[11], `event-api.service.ts`[12], `structure-api.service.ts`[14], `friendship-api.service.ts`[13]).
  2.  **Nouveau : `TicketingApiService`** :
    *   Nous allons définir les endpoints nécessaires (ex: `POST /reservations`, `GET /tickets/{ticketId}/validate`, `GET /events/{eventId}/my-tickets`).
    *   Créer le fichier `ticketing-api.service.ts` qui contiendra les appels HTTP bruts pour la réservation, la validation et la récupération des tickets. Il utilisera des DTOs spécifiques (ex: `ApiTicketDto`).
  3.  S'assurer que les mocks dans chaque service API sont mis à jour pour correspondre aux nouveaux DTOs et aux nouvelles logiques (ex: pas de `ticketPrice` dans les mocks d'audience zones).

---

### Phase 3 : Refactorisation des Services de Domaine/Métier (`*.service.ts`) (Priorité Haute)

*   **Objectif** : C'est le cœur du travail. Appliquer la composition, la transformation de données, la gestion du cache et la logique métier.
*   **Actions (par service de domaine)** :

  1.  **`EventService` [4] et `CategoryService` [3]** :
    *   **Statut** : Largement refactorisés. Ils servent de guide.
    *   **Point à vérifier pour `EventService`** : La création des `EventAudienceZone` est bien gérée par le composant qui fournit les données à `EventService.createEvent()`.

  2.  **`AuthService` [1]** :
    *   **Analyse** : Semble déjà bien structuré et utilise `inject()`. Il compose `AuthApiService`.
    *   **Revue** : Confirmer la gestion des états (`currentUserSig`, `isLoggedInSig`) et les redirections. S'assurer que les DTOs utilisés (ex: `LoginCredentials`, `UserRegistrationDto`) sont alignés avec ceux de la Phase 1.

  3.  **`StructureService` [8]** :
    *   **Modèles associés à valider (Phase 1)** : `StructureModel`, `StructureTypeModel`, `AreaModel`.
    *   **Refactorisation** :
      *   Utilisation de `inject()` pour `StructureApiService`, `NotificationService`, `AuthService`.
      *   Revoir et optimiser la gestion du cache (`currentStructureSig`, `structureAreasSig`, `structureTypesSig`) avec des signaux.
      *   Méthodes de transformation `apiStructure` -> `StructureModel`, `apiArea` -> `AreaModel`.
      *   S'assurer que `createStructure` utilise un DTO clair et que `StructureApiService` l'attend.
      *   Le CRUD pour `AreaModel` (zones physiques de la structure) reste ici.

  4.  **`UserService` [9]** :
    *   **Modèles associés à valider (Phase 1)** : `UserModel` et DTOs associés.
    *   **Refactorisation** :
      *   **Décision** : Créer un `UserApiService` pour séparer les appels HTTP de `UserService`. `UserService` composera alors `UserApiService`.
      *   `UserService` gèrera la transformation `ApiUserDto` -> `UserModel`.
      *   Gestion du cache pour les profils.

  5.  **`FriendshipService` [5]** :
    *   **Modèles associés à valider (Phase 1)** : `FriendshipModel`, `FriendRequestModel`, `FriendModel`.
    *   **Refactorisation** :
      *   Confirmer `inject()` pour `FriendshipApiService`, `NotificationService`.
      *   Cache via signaux (`friendsSig`, `pendingRequestsSig`, etc.).
      *   **Affichage des amis participants à un événement** :
        *   `FriendshipApiService` aura une méthode `getFriendsAttendingEvent(eventId: number): Observable`.
        *   `FriendshipService` aura `getFriendsAttendingEvent(eventId: number): Observable` qui appelle le service API et transforme les données. `FriendParticipantModel` pourrait inclure l'ID de l'ami, son nom, et potentiellement sa zone/place si l'API le fournit.
        *   `EventService` *pourrait* potentiellement composer `FriendshipService` pour enrichir les détails d'un événement avec cette information, ou le composant d'affichage des détails de l'événement composera les deux services.

  6.  **Nouveau : `TicketingService` (Service de Domaine)** :
    *   **Modèles associés (définis en Phase 1)** : `TicketModel`, `ReservationModel`.
    *   **Création** :
      *   Ce service sera responsable de toute la logique métier liée aux tickets et réservations.
      *   Utilisera `inject()` pour `TicketingApiService`, `NotificationService`, `EventService` (pour vérifier la dispo des zones), `UserService` (pour l'info du participant).
      *   **Méthodes principales** :
        *   `reserveTickets(eventId: number, audienceZoneId: number, participantInfo: {firstName, lastName, email}, quantity: number): Observable` :
          *   Vérifie la capacité de `EventAudienceZone` (via `EventService`).
          *   Appelle `TicketingApiService.createReservationOrTickets()`.
          *   Transforme la réponse API en `TicketModel[]` ou `ReservationModel`.
        *   `getUserTickets(userId: number): Observable` : Récupère les tickets d'un utilisateur.
        *   `getTicketDetails(ticketId: string): Observable`.
        *   `generateQrCodeData(ticket: TicketModel): string` : Crée la chaîne de données pour le QR code (pas la génération de l'image, juste les données).
        *   `getTicketPdfData(ticketId: string): Observable` : Prépare les données pour l'export PDF du ticket. La génération réelle du PDF sera probablement gérée par un composant ou une librairie dédiée côté client, ou un endpoint backend si génération serveur.
        *   Pas de gestion de cache complexe au début, sauf si nécessaire.

---

### Phase 4 : Services Utilitaires et Configuration (Vérification et Finalisation)

*   **`ApiConfigService` [10]** : Rôle central, OK.
*   **`NotificationService` [7]** : OK.
*   **`LayoutService` [6]** : OK.
*   **`BrowserCloseService` [2]** : S'assurer qu'il ne cause pas de problèmes avec la gestion des tokens par `AuthService` (ex: le `localStorage.clear()` est très agressif). Il devrait peut-être appeler `AuthService.clearTemporaryAuthData()` ou quelque chose de plus ciblé si le but est juste de vider le `sessionStorage`.

---

### Phase 5 : Intégration et Revue des Composants (Après la refactorisation des services)

*   **Objectif** : Mettre à jour les composants pour qu'ils utilisent les nouveaux services refactorisés et les modèles mis à jour.
*   **Actions** :
  1.  Identifier les composants qui consomment chaque service refactorisé.
  2.  Adapter les appels aux méthodes des services et la manière dont les données sont consommées (Observables, signaux).
  3.  S'assurer que l'injection de dépendances dans les composants utilise `inject()` là où c'est pertinent et plus propre.

Okay, je suis prêt ! Merci pour les fichiers et les clarifications.

Votre approche de refactorisation par domaine est excellente et permettra de structurer le travail de manière efficace. Le fait de vouloir une documentation en anglais pour le code et les messages utilisateur en français est une pratique standard et claire.

## Plan d'Action Détaillé pour la Refactorisation

Voici le plan détaillé que nous allons suivre, intégrant vos nouvelles demandes (service de billetterie, gestion de `fullDescription`, affichage des amis participants) et basé sur les services existants que vous avez fournis.

---

### **Phase 0 : Finalisation du Plan et Clarifications (Nous sommes ici)**

1.  **Confirmation du Plan** : Nous validons ce plan détaillé ensemble.
2.  **Gestion de `fullDescription` (Event)** :
  *   **Frontend** : Le modèle `EventModel.fullDescription: string;` est adéquat. L'affichage sera géré par l'UI.
  *   **Backend (Note pour vous)** : Pour la base de données, un type `TEXT`, `LONGTEXT` (SQL) ou équivalent est nécessaire. En Java/Spring avec JPA, l'annotation `@Lob` sur le champ de l'entité est la solution standard.
3.  **Amis Participants aux Événements** :
  *   Nous allons intégrer une méthode dans `FriendshipService` pour récupérer les amis d'un utilisateur qui participent à un événement spécifique. Cela impliquera une nouvelle méthode dans `FriendshipApiService` et un nouveau modèle simple `FriendParticipantModel`.
4.  **Service de Réservation/Billetterie (Ticketing)** :
  *   Nous allons concevoir et intégrer un nouveau domaine "Ticketing" avec ses propres modèles (`TicketModel`, `ReservationModel`), un service API (`TicketingApiService`), et un service métier (`TicketingService`). Il gérera la réservation de billets gratuits, la génération des données pour QR code, et la préparation des données pour l'export PDF.

---

### **Phase 1 : Refactorisation et Création des Modèles (`*.model.ts`)**

*   **Objectif** : Établir des modèles de données clairs, précis, et optimisés pour chaque domaine de l'application. Définir les DTOs (Data Transfer Objects) pour les communications API. Toute la documentation des modèles sera en **anglais**.
*   **Processus (pour chaque domaine, séquentiellement)** :
  1.  Je vous demanderai (ou utiliserai si déjà fournis) les fichiers `*.model.ts` existants.
  2.  Nous analyserons et affinerons ces modèles : suppression des champs inutiles (ex: `ticketPrice` partout où ce n'est pas géré), gestion cohérente des relations (ID vs objets imbriqués), renommage pour la clarté.
  3.  Nous définirons les DTOs nécessaires pour les opérations de création (Create) et de mise à jour (Update) qui seront envoyés à l'API.
  4.  Je fournirai les fichiers modèles complets et refactorisés avec leur documentation TSDoc en anglais.
*   **Ordre des Domaines pour la Phase 1** :
  1.  **Structure** (*Fichiers déjà fournis, nous commençons ici*)
  2.  **Authentification (Auth) & Utilisateur (User)**
  3.  **Amitié (Friendship)**
  4.  **Événement (Event)** (Révision basée sur les changements des autres modèles et les nouvelles exigences)
  5.  **Nouveau : Billetterie (Ticketing)** (Conception des modèles à partir de zéro)

---

### **Phase 2 : Adaptation et Création des Services API (`*-api.service.ts`)**

*   **Objectif** : S'assurer que les services API sont de pures couches d'accès HTTP (et mocks), utilisant les DTOs définis en Phase 1. Documentation en **anglais**.
*   **Processus (pour chaque domaine)** :
  1.  Revue du service `*-api.service.ts` existant ou création si manquant (ex: `TicketingApiService`, potentiellement `UserApiService`).
  2.  Mise à jour des signatures de méthodes et des implémentations des mocks pour correspondre aux DTOs.
  3.  Garantir l'utilisation de `inject()`.
  4.  Je fournirai les fichiers de services API complets avec documentation TSDoc en anglais.
*   **Services concernés** : `structure-api.service.ts`, `auth-api.service.ts`, `user-api.service.ts` (à créer/affiner), `friendship-api.service.ts`, `event-api.service.ts`, et le nouveau `ticketing-api.service.ts`.

---

### **Phase 3 : Refactorisation et Création des Services Métier/Domaine (`*.service.ts`)**

*   **Objectif** : Mettre en œuvre le pattern de composition. Les services de domaine utiliseront les services API, géreront la transformation des données (DTO API  Modèle Applicatif), la logique métier, et le cache. Documentation des méthodes en **anglais**, messages affichés à l'utilisateur (notifications) en **français**.
*   **Processus (pour chaque domaine)** :
  1.  Refactorisation du service de domaine existant ou création du nouveau (`TicketingService`).
  2.  Utilisation systématique de `inject()` pour les dépendances.
  3.  Implémentation de la composition : appel au service API correspondant, et à d'autres services de domaine si nécessaire.
  4.  Ajout/Affinement des méthodes de transformation de données.
  5.  Revue et optimisation des stratégies de cache (avec les signaux Angular).
  6.  Intégration des logiques spécifiques (ex: `getFriendsAttendingEvent` dans `FriendshipService`).
  7.  Je fournirai les fichiers de services de domaine complets.
*   **Services concernés** : `structure.service.ts`, `auth.service.ts`, `user.service.ts`, `friendship.service.ts`, `event.service.ts`, `category.service.ts` (revue légère), et le nouveau `ticketing.service.ts`.

---

### **Phase 4 : Revue des Services Utilitaires**

*   **Objectif** : Confirmer que les services utilitaires sont bien alignés et documentés.
*   **Services** : `ApiConfigService`[10], `NotificationService`[7], `LayoutService`[6], `BrowserCloseService`[2]. Pour `BrowserCloseService`, nous vérifierons si `localStorage.clear()` est la meilleure approche ou si une interaction avec `AuthService` pour vider uniquement les données de session non persistantes est préférable.

---

### **Phase 5 : Tests et Validation (Recommandation)**

*   Bien que la création des tests soit hors de notre périmètre direct ici, la refactorisation visera à rendre chaque service plus facilement testable unitairement.

---
