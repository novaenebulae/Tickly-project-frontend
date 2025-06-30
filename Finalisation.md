### **Étape 1 : Finalisation de la Connexion à l'API**

Formulaire structure à finaliser (design)
Créer un onglet pour la gestion des médias.

Vérifier les mises à jour en temps réel des données

Areas et zones (finaliser)
Team Management (finaliser)
Événement Panel (finaliser)
Calendrier (vérifier)

Statistiques (supprimer) -> intégration sur le dashboard + dans les détails backoffice des événements, mais intégrer service stats dans backend


#### **1.1. `StructureAPI` (Détails et Gestion Admin)**

* [cite_start]**Connexion (Affichage des détails) :** Le service `StructureService` (`structure.service.ts`) contient déjà les méthodes pour récupérer les détails d'une structure (`getStructureById`)[cite: 204]. Assurez-vous que le composant `structure-details-page.component.ts` utilise bien ce service pour afficher toutes les informations, y compris la description, les types, les contacts, et les URLs des réseaux sociaux.
* **Gestion Admin (Création, Areas, Zones d'audience) :**
  * [cite_start]**Création de Structure :** Le `StructureCreationComponent` (`structure-creation.component.ts`) doit envoyer un DTO conforme au `StructureCreationDto` de l'API[cite: 397]. Le formulaire semble collecter les bonnes informations (nom, types, adresse, description). La méthode `createStructure` du service doit être utilisée à la soumission.
  * **Gestion des Espaces (Areas) :** Le composant `areas-management.component.ts` doit utiliser `StructureService` pour :
    * [cite_start]Lister les espaces via `loadStructureAreas`, qui appelle `GET /api/v1/structures/{structureId}/areas`[cite: 115].
    * [cite_start]Créer un nouvel espace via `createArea`, qui appelle `POST /api/v1/structures/{structureId}/areas` [cite: 122] [cite_start]avec un `AreaCreationDto`[cite: 402].
    * [cite_start]Mettre à jour un espace via `updateArea`, qui appelle `PATCH /api/v1/structures/{structureId}/areas/{areaId}` [cite: 238] [cite_start]avec un `AreaUpdateDto`[cite: 438].
    * [cite_start]Supprimer un espace via `deleteArea`, qui appelle `DELETE /api/v1/structures/{structureId}/areas/{areaId}`[cite: 231].
  * **Gestion des Zones d'Audience :** Le même composant `areas-management.component.ts` doit permettre de gérer les zones d'audience pour un espace sélectionné.
    * La logique de chargement et de création semble présente (`loadAudienceZones`, `createAudienceZone`). [cite_start]Il faut s'assurer que les DTOs `AudienceZoneCreationDto` [cite: 410] [cite_start]et `AudienceZoneUpdateDto` [cite: 440] sont correctement formatés avant l'envoi à l'API.

#### **1.2. `EventAPI` (Gestion Admin et Détails)**

* **Gestion Admin :** Le composant `events-panel.component.ts` liste les événements. Il faut s'assurer que les actions (suppression, modification de statut) sont bien connectées.
  * Le `EventFormComponent` (`event-form.component.ts`) est central. [cite_start]Lors de la soumission, il doit construire un `EventCreationDto` [cite: 415] [cite_start]ou `EventUpdateDto` [cite: 364] valide. [cite_start]Une attention particulière doit être portée à la construction du tableau `audienceZones` pour qu'il corresponde aux attentes de l'API[cite: 348].
  * [cite_start]La gestion des statuts (Brouillon, Publié, etc.) doit utiliser l'endpoint `PATCH /api/v1/events/{eventId}/status` [cite: 264] via le service `EventService`.

#### **1.4. `TeamManagementAPI` (Gestion Admin)**

* Le service `TeamManagementService` est bien structuré. Le composant `team-management.component.ts` doit l'utiliser pour :
  * [cite_start]Lister les membres de l'équipe de la structure via `GET /api/v1/team/structure/{structureId}`[cite: 283].
  * [cite_start]Inviter un membre via `POST /api/v1/team/structure/{structureId}/invite` [cite: 68][cite_start], en utilisant le `InviteMemberRequestDto`[cite: 393].
  * [cite_start]Mettre à jour le rôle d'un membre via `PUT /api/v1/team/members/{memberId}/role`[cite: 18].
  * [cite_start]Supprimer un membre via `DELETE /api/v1/team/members/{memberId}`[cite: 310].
  * Le composant doit aussi gérer les permissions en se basant sur les méthodes `canEditMember` et `canRemoveMember` du service, qui s'appuient sur le rôle de l'utilisateur connecté.

---

### **Étape 2 : Uniformisation et Qualité du Code**

Cette étape est cruciale pour la maintenabilité et la scalabilité du projet.

#### **2.1. Uniformisation TypeScript (Modèles, Services, Composants)**

* [cite_start]**Modèles de Données :** Assurez-vous que tous les modèles (fichiers `.model.ts`) dans le dossier `/core/models` correspondent exactement aux DTOs définis dans la documentation de l'API[cite: 324]. [cite_start]Par exemple, `EventModel` [cite: 416] [cite_start]doit correspondre à `EventDetailResponseDto` [cite: 351][cite_start], et `StructureModel` [cite: 397] [cite_start]à `StructureDetailResponseDto`[cite: 434].
* **Gestion de l'état :** Le projet utilise à la fois les `signals` et les `Observables` (RxJS). Pour une meilleure cohérence, choisissez une approche principale. Les signaux sont modernes et souvent plus simples pour la gestion de l'état local des composants. Gardez les Observables pour les flux de données complexes et les appels API. Par exemple, dans `EventService`, les listes d'événements pourraient être des signaux (`WritableSignal`) mis à jour par les appels API.
* **Suppression des redondances :**
  * Vérifiez si des méthodes dupliquées existent dans différents services. Par exemple, si plusieurs services chargent les détails d'une structure, cette logique devrait être centralisée dans `StructureService`.
  * Les "mappers" (ex: `mapApiEventToEventModel` dans `event.service.ts`) sont une bonne pratique. Assurez-vous que chaque service qui communique avec l'API en possède pour transformer les DTOs en modèles applicatifs, ce qui isole le reste de l'application des changements de l'API.
* **Nettoyage du code :**
  * Parcourez le projet à la recherche des commentaires `// TODO :`. [cite_start]Le fichier `auth.service.ts` en contient un concernant une page de validation d'email, qui semble déjà implémentée dans `validate-email.component.ts`[cite: 296]. Résolvez ou supprimez ces commentaires.
  * Supprimez les méthodes et variables inutilisées.

#### **2.2. Gestion des Erreurs Centralisée**

* Les services API (`auth-api.service.ts`, `event-api.service.ts`, etc.) ont une méthode `handleError`. C'est une bonne base. Pour centraliser davantage, vous pourriez créer un `HttpInterceptor` qui intercepte toutes les erreurs HTTP (4xx, 5xx) et utilise le `NotificationService` pour afficher un message standard, tout en laissant la possibilité aux services de surcharger ce comportement pour des erreurs spécifiques.

#### **2.3. Uniformisation SCSS et Styling Global**

* **Variables de Thème :** Définissez les couleurs primaires, secondaires, de succès, d'erreur, etc., dans un fichier central (ex: `src/styles/_variables.scss`) et importez-le dans les autres fichiers SCSS. Cela garantira une cohérence visuelle.
* **Mixins :** Créez des mixins pour les styles récurrents comme les ombres de boîtes (`box-shadow`), les `flexbox`, ou les transitions pour réduire la duplication de code.
* **Composants Communs :** Pour des éléments comme les cartes (`mat-card`) ou les boutons (`mat-button`), définissez des styles globaux dans `src/styles/styles.scss` pour assurer une apparence uniforme à travers toute l'application.

---

### **Étape 3 : Tests, Environnements et Déploiement**

#### **3.1. Mise en Place des Tests**

* **Tests Unitaires :** Pour chaque service, écrivez des tests unitaires (fichiers `.spec.ts`) pour vérifier la logique métier. Utilisez des mocks des services API pour isoler le service testé. Pour les composants, testez la logique de présentation et l'interaction avec les services.
* **Tests d'Intégration :** Testez les flux utilisateur critiques, comme le processus de réservation (`event-ticket-reservation-page.component.ts`) ou la création d'un événement, pour vous assurer que les composants et services fonctionnent correctement ensemble.

#### **3.2. Gestion des Environnements et Déploiement**

* **Profils de Développement / Production :**
  * Utilisez les fichiers `environment.ts` et `environment.prod.ts` pour gérer les configurations spécifiques à chaque environnement (URL de l'API, activation des logs, etc.).
  * **Suppression des Mocks :** Dans `environment.prod.ts`, assurez-vous que la variable `useMocks` ou `APP_CONFIG.mock.enabled` est à `false` pour que l'application utilise la véritable API en production.
  * **Logs en Console :** La méthode `logApiRequest` dans `ApiConfigService` est conditionnée par `environment.enableDebugLogs`. Mettez cette variable à `false` dans `environment.prod.ts` pour désactiver les logs en production.
* **Préparation CI/CD :**
  * Le fichier `deploy.sh` est un bon début pour un déploiement manuel. Pour une CI/CD, intégrez ces étapes dans un pipeline (ex: GitHub Actions, GitLab CI).
  * Le pipeline devrait :
    1.  Installer les dépendances (`npm install`).
    2.  Exécuter les tests (`npm test`).
    3.  Construire l'application pour la production (`npm run build`).
    4.  Construire l'image Docker à partir du `Dockerfile` existant.
    5.  Pousser l'image vers un registre (Docker Hub, etc.).
    6.  Déployer l'image sur le serveur de production.
