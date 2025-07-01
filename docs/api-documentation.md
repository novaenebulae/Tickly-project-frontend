**API Tickly v1.0**

**Overview**

Documentation de l’API RESTful pour le backend du système de billetterie Tickly. 

**Tags**

**Types de Structure**

API pour la gestion des types de structure. 

**Gestion des Amitiés**

API pour gérer les relations d’amitié entre utilisateurs. 

**Gestion d’Équipe**

API pour la gestion des membres de l’équipe d’une structure. 

**API de Billetterie**

Endpoints pour la réservation, la consultation et la validation des billets. 

**Structures**

API pour la gestion des structures événementielles et de leurs composants. 

**Authentification**

Endpoints pour l’inscription et la connexion des utilisateurs **Gestion des Événements**

API pour la création, recherche et gestion des événements. 

**Gestion des Utilisateurs**

Endpoints pour gérer les profils utilisateurs et les favoris. 

**Paths**

***GET***** /api/v1/users/me Récupérer le profil de** **l’utilisateur authentifié**

*Responses*

1

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

***PUT***** /api/v1/users/me Mettre à jour le profil de** **l’utilisateur authentifié**

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

2

**Code**

**Description**

**Links**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

***DELETE***** /api/v1/users/me Demander la suppression de** **mon compte**

Lance le processus de suppression de compte en envoyant un e-mail de confirmation. La suppression n’est pas immédiate. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

3

**Code**

**Description**

**Links**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

***PUT***** /api/v1/team/members/\{memberId\}/role Mettre à jour** **le rôle d’un membre de l’équipe**

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**memberId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

4

**Code**

**Description**

**Links**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***PUT***** /api/v1/friendship/requests/\{friendshipId\} Mettre** **à jour le statut d’une demande d’ami \(accepter,** **refuser, annuler\)**

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**friendshipId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

5

**Code**

**Description**

**Links**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/events/\{eventId\} Récupérer les détails** **d’un événement par son ID**

Accessible publiquement. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**eventId**

ID de l’événement à récupérer

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Événement non trouvé

No Links

*Content*

**application/json**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

6

**Code**

**Description**

**Links**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

Détails de l’événement

No Links

*Content*

**application/json**

***PUT***** /api/v1/events/\{eventId\} Mettre à jour un** **événement existant**

Met à jour les informations d’un événement. Seul le propriétaire de l’événement \(via sa structure\) peut effectuer cette action. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**eventId**

ID de l’événement à mettre à jour

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Événement non trouvé

No Links

409

Conflict

No Links

*Content*

**/**

403

Accès refusé

No Links

401

Unauthorized

No Links

*Content*

**/**

7

**Code**

**Description**

**Links**

500

Internal Server Error

No Links

*Content*

**/**

400

Données invalides

No Links

200

Événement mis à jour avec succès

No Links

*Content*

**application/json**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***DELETE***** /api/v1/events/\{eventId\} Supprimer un** **événement**

Supprime un événement et tous les fichiers associés. Opération irréversible. Seul le propriétaire peut effectuer cette action. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**eventId**

ID de l’événement à supprimer

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Événement non trouvé

No Links

409

Conflict

No Links

*Content*

**/**

403

Accès refusé

No Links

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

8

**Code**

**Description**

**Links**

400

Bad Request

No Links

*Content*

**/**

204

Événement supprimé avec succès

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/users/me/favorites/structures Lister les** **structures favorites de l’utilisateur authentifié** *Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

9

**Code**

**Description**

**Links**

200

OK

No Links

*Content*

**/**

***POST***** /api/v1/users/me/favorites/structures Ajouter** **une structure aux favoris de l’utilisateur authentifié** *Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

201

Created

No Links

*Content*

**/**

10

***POST***** /api/v1/users/me/avatar Uploader ou mettre à** **jour l’avatar de l’utilisateur authentifié** *Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

***POST***** /api/v1/ticketing/tickets/validate Valider un** **billet**

Valide un billet en utilisant la valeur scannée de son QR code. Nécessite des rôles de service spécifiques. 

*Responses*

11

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***** /api/v1/ticketing/reservations Créer une** **nouvelle réservation**

Crée une nouvelle réservation pour un ou plusieurs billets pour un événement spécifique. 

*Responses*

12

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***** /api/v1/team/structure/\{structureId\}/invite** **Inviter un nouveau membre dans l’équipe**

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

13

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***** /api/v1/team/invitations/accept Accepter une** **invitation à rejoindre une équipe**

L’utilisateur doit être authentifié. Le token est passé en paramètre de requête. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**query**

**token**

string

*required*

*Responses*

14

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/structures Lister toutes les structures** Récupère une liste paginée et potentiellement filtrée de toutes les structures. Endpoint public. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**query**

**size**

The size of the page to be returned

integer

*optional*

**query**

**query**

Recherche textuelle sur le nom de la structure. 

string

*optional*

**query**

**typeIds**

Filtrer par type de structure \(ex: 'Théâtre', 'Salle < integer > array *optional*

de concert'\). 

15

**Type**

**Name**

**Description**

**Schema**

**query**

**page**

Zero-based page index \(0..N\)

integer

*optional*

**query**

**sort**

Sorting criteria in the format: property,\(asc desc\). Default sort

*optional*

order is ascending. 

Multiple sort criteria

are supported. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

Liste des structures récupérée avec succès

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

16

***POST***** /api/v1/structures Créer une nouvelle structure** Permet à un administrateur de structure \(avec 'needsStructureSetup' à true\) de créer sa structure. 

Le token JWT de l’utilisateur sera mis à jour implicitement côté serveur pour refléter l’association. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

L’utilisateur n’est pas autorisé à créer une structure ou en a déjà une No Links *Content*

**/**

401

Authentification requise

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Données de création invalides

No Links

*Content*

**/**

201

Structure créée avec succès

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

17

***POST***** /api/v1/structures/\{structureId\}/logo Mettre à** **jour le logo d’une structure**

Remplace le logo actuel de la structure. Nécessite d’être le propriétaire. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

18

***DELETE***** /api/v1/structures/\{structureId\}/logo** **Supprimer le logo d’une structure**

Supprime le logo actuel de la structure. Nécessite d’être le propriétaire. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Structure non trouvée ou logo inexistant

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Accès refusé

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

204

Logo supprimé avec succès

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

19

***POST***** /api/v1/structures/\{structureId\}/gallery Ajouter** **plusieurs images à la galerie d’une structure** Ajoute plusieurs nouvelles images à la galerie de la structure en une seule fois. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

**query**

**files**

< string > array

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

20

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***DELETE***** /api/v1/structures/\{structureId\}/gallery** **Supprimer une image de la galerie d’une structure** Supprime une image spécifique de la galerie. Nécessite d’être le propriétaire. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**query**

**imagePath**

Chemin de l’image à supprimer, tel que retourné string *required*

dans les URLs de la galerie. 

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

21

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***** /api/v1/structures/\{structureId\}/cover Mettre à** **jour l’image de couverture d’une structure** Remplace l’image de couverture actuelle de la structure. Nécessite d’être le propriétaire. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

22

**Code**

**Description**

**Links**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***DELETE***** /api/v1/structures/\{structureId\}/cover** **Supprimer l’image de couverture d’une structure** Supprime l’image de couverture actuelle de la structure. Nécessite d’être le propriétaire. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Structure non trouvée ou image de couverture inexistante No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Accès refusé

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

23

**Code**

**Description**

**Links**

400

Bad Request

No Links

*Content*

**/**

204

Image de couverture supprimée avec succès

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/structures/\{structureId\}/areas Lister les** **espaces \(Areas\) d’une structure**

Récupère tous les espaces physiques configurés pour une structure donnée. Accessible au propriétaire ou aux services d’organisation. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

24

**Code**

**Description**

**Links**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***** /api/v1/structures/\{structureId\}/areas Créer un** **espace \(Area\) pour une structure**

Ajoute un nouvel espace physique \(salle, scène…\) à une structure. Nécessite d’être le propriétaire. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

25

**Code**

**Description**

**Links**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***

**/api/v1/structures/\{structureId\}/areas/\{areaId\}/audienc** **e-zone-templates Lister les modèles de zones d’un** **espace**

Récupère tous les modèles de zones d’audience pour un espace donné. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**areaId**

integer \(int64\)

*required*

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

26

**Code**

**Description**

**Links**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***

**/api/v1/structures/\{structureId\}/areas/\{areaId\}/audienc** **e-zone-templates Créer un modèle de zone d’audience** Ajoute un nouveau modèle de zone \(fosse, balcon…\) à un espace spécifique. Nécessite d’être propriétaire de la structure. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**areaId**

integer \(int64\)

*required*

**path**

**structureId**

integer \(int64\)

*required*

27

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***** /api/v1/friendship/requests Envoyer une** **demande d’ami**

*Responses*

28

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/events Lister et rechercher des** **événements**

Récupère une liste paginée d’événements, avec des options de filtrage et de tri. Accessible publiquement. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**query**

**city**

Filtrer par ville de l’événement. 

string

*optional*

**query**

**query**

Recherche textuelle sur le nom, la description et string *optional*

les tags de l’événement. 

29

**Type**

**Name**

**Description**

**Schema**

**query**

**structureId **Filtrer par ID de la structure organisatrice. 

integer \(int64\)

*optional*

**query**

**sort**

Sorting criteria in the format: property,\(asc desc\). Default sort

*optional*

order is ascending. 

Multiple sort criteria

are supported. 

< string **query**

**tags**

Filtrer par tags \(logique

> array

*optional*

ET\). 

< string **query**

**startDateBefore**

Filtrer les événements

> array

*optional*

commençant avant

cette date \(format ISO

8601 UTC\). 

string

**query**

**categoryIds**

Liste d’IDs de

\(date-

*optional*

catégories pour filtrer

time\)

les événements. 

< 

**query**

**startDateAfter**

Filtrer les événements

integer

*optional*

commençant après

> array

cette date \(format ISO

8601 UTC\). 

string

**query**

**size**

The size of the page to

\(date-

*optional*

be returned

time\)

integer

**query**

**displayOnHomepage**

Filtrer les événements

*optional*

affichés sur la page

d’accueil. 

boolean **query**

**page**

Zero-based page index

*optional*

\(0..N\)

integer

**query**

**isFeatured**

Filtrer les événements

*optional*

mis en avant. 

boolean **query**

**status**

Filtrer par statut de

*optional*

l’événement. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

30

**Code**

**Description**

**Links**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

Liste des événements récupérée

No Links

*Content*

**application/json**

***POST***** /api/v1/events Créer un nouvel événement** Crée un nouvel événement associé à une structure. Nécessite un rôle d’administrateur de structure ou de service d’organisation. 

*Responses*

**Code**

**Description**

**Links**

404

Structure ou Catégorie non trouvée

No Links

*Content*

**application/json**

409

Conflict

No Links

*Content*

**/**

31

**Code**

**Description**

**Links**

403

Accès refusé

No Links

*Content*

**application/json**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Données de requête invalides

No Links

*Content*

**application/json**

201

Événement créé avec succès

No Links

*Content*

**application/json**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***** /api/v1/events/\{eventId\}/main-photo Uploader ou** **mettre à jour la photo principale d’un événement** Remplace la photo principale existante. Seul le propriétaire peut effectuer cette action. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**eventId**

ID de l’événement

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

32

**Code**

**Description**

**Links**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

Photo mise à jour

No Links

*Content*

**application/json**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***** /api/v1/events/\{eventId\}/gallery Ajouter une** **image à la galerie d’un événement**

Ajoute une nouvelle image à la galerie. Seul le propriétaire peut effectuer cette action. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**eventId**

ID de l’événement

integer \(int64\)

*required*

*Responses*

33

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

Image ajoutée

No Links

*Content*

**application/json**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***DELETE***** /api/v1/events/\{eventId\}/gallery Supprimer** **une image de la galerie d’un événement**

Supprime une image spécifique de la galerie. Seul le propriétaire peut effectuer cette action. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**eventId**

ID de l’événement

integer \(int64\)

*required*

34

**Type**

**Name**

**Description**

**Schema**

**query**

**imagePath**

Chemin/nom du fichier image à supprimer \(tel string *required*

que retourné par l’API\)

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

204

Image supprimée

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***POST***** /api/v1/auth/reset-password Réinitialiser le mot** **de passe**

Met à jour le mot de passe de l’utilisateur en utilisant le token et le nouveau mot de passe fournis. 

*Responses*

35

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

***POST***** /api/v1/auth/register Inscrire un nouvel** **utilisateur et le connecter**

Crée un nouveau compte utilisateur et retourne un token JWT si l’inscription réussit. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

L’email est déjà utilisé

No Links

*Content*

**/**

36

**Code**

**Description**

**Links**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Données d’inscription invalides

No Links

*Content*

**/**

201

Utilisateur inscrit et connecté avec succès No Links

*Content*

**application/json**

***POST***** /api/v1/auth/login Connecter un utilisateur** **existant**

Valide les identifiants de l’utilisateur et retourne un token JWT en cas de succès. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Email non validé

No Links

*Content*

**/**

37

**Code**

**Description**

**Links**

401

Identifiants incorrects

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Données de connexion invalides

No Links

*Content*

**/**

200

Connexion réussie

No Links

*Content*

**application/json**

***POST***** /api/v1/auth/forgot-password Demander la** **réinitialisation du mot de passe**

Envoie un e-mail avec un lien de réinitialisation si l’adresse e-mail est associée à un compte. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

38

**Code**

**Description**

**Links**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

***GET***** /api/v1/structures/\{structureId\} Récupérer les** **détails d’une structure**

Récupère les informations détaillées d’une structure par son ID. Endpoint public. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Structure non trouvée

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

39

**Code**

**Description**

**Links**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

Détails de la structure

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***DELETE***** /api/v1/structures/\{structureId\} Supprimer** **une structure**

Supprime une structure et tous ses composants et fichiers associés. Accessible aux administrateurs système ou au propriétaire de la structure. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Structure non trouvée

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Accès refusé

No Links

*Content*

**/**

40

**Code**

**Description**

**Links**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

204

Structure supprimée avec succès

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***PATCH***** /api/v1/structures/\{structureId\} Mettre à jour** **une structure \(partiel\)**

Met à jour partiellement une structure existante. Seuls les champs fournis seront modifiés. 

Accessible aux administrateurs système ou au propriétaire de la structure. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Structure non trouvée

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

41

**Code**

**Description**

**Links**

403

Accès refusé

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Données invalides

No Links

*Content*

**/**

200

Structure mise à jour avec succès

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/structures/\{structureId\}/areas/\{areaId\}**

**Récupérer un espace \(Area\) spécifique**

Récupère les détails d’un espace par son ID, dans le contexte d’une structure. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**areaId**

integer \(int64\)

*required*

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

42

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***DELETE***

**/api/v1/structures/\{structureId\}/areas/\{areaId\}**

**Supprimer un espace \(Area\)**

Supprime un espace d’une structure. Nécessite d’être le propriétaire. 

*Parameters*

43

**Type**

**Name**

**Description**

**Schema**

**path**

**areaId**

integer \(int64\)

*required*

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***PATCH***** /api/v1/structures/\{structureId\}/areas/\{areaId\}**

**Mettre à jour un espace \(Area\)**

Met à jour partiellement un espace existant. Nécessite d’être le propriétaire de la structure parente. 

*Parameters*

44

**Type**

**Name**

**Description**

**Schema**

**path**

**areaId**

integer \(int64\)

*required*

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

45

***GET***

**/api/v1/structures/\{structureId\}/areas/\{areaId\}/audienc** **e-zone-templates/\{templateId\} Récupérer un modèle de** **zone spécifique**

Récupère les détails d’un modèle de zone par son ID. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**areaId**

integer \(int64\)

*required*

**path**

**structureId**

integer \(int64\)

*required*

**path**

**templateId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

46

**Code**

**Description**

**Links**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***DELETE***

**/api/v1/structures/\{structureId\}/areas/\{areaId\}/audienc** **e-zone-templates/\{templateId\} Supprimer un modèle de** **zone**

Supprime un modèle de zone d’audience. Nécessite d’être propriétaire. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**areaId**

integer \(int64\)

*required*

**path**

**structureId**

integer \(int64\)

*required*

**path**

**templateId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

47

**Code**

**Description**

**Links**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***PATCH***

**/api/v1/structures/\{structureId\}/areas/\{areaId\}/audienc** **e-zone-templates/\{templateId\} Mettre à jour un modèle** **de zone**

Met à jour un modèle de zone existant. Nécessite d’être propriétaire. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**areaId**

integer \(int64\)

*required*

**path**

**structureId**

integer \(int64\)

*required*

**path**

**templateId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

48

**Code**

**Description**

**Links**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***PATCH***** /api/v1/events/\{eventId\}/status Mettre à jour le** **statut d’un événement**

Permet de changer le statut d’un événement \(ex: de DRAFT à PUBLISHED\). Seul le propriétaire peut effectuer cette action. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**eventId**

ID de l’événement

integer \(int64\)

*required*

*Responses*

49

**Code**

**Description**

**Links**

404

Événement non trouvé

No Links

409

Conflict

No Links

*Content*

**/**

403

Accès refusé

No Links

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Statut invalide

No Links

200

Statut mis à jour

No Links

*Content*

**application/json**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/ticketing/tickets/\{ticketId\} Obtenir les** **détails d’un billet**

Récupère les détails d’un billet spécifique. L’utilisateur doit être le propriétaire du billet. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**ticketId**

string \(uuid\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

50

**Code**

**Description**

**Links**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/ticketing/my-tickets Obtenir mes billets** Récupère une liste de tous les billets achetés par l’utilisateur authentifié. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

51

**Code**

**Description**

**Links**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/team/structure/\{structureId\} Récupérer les** **membres de l’équipe d’une structure**

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

52

**Code**

**Description**

**Links**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/structure-types Récupérer tous les types** **de structure disponibles**

Retourne une liste de tous les types de structure que les lieux événementiels peuvent adopter. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

53

**Code**

**Description**

**Links**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

Liste des types de structure récupérée avec succès. 

No Links

*Content*

**application/json**

***GET***** /api/v1/friendship Récupérer toutes les données** **d’amitié de l’utilisateur**

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

54

**Code**

**Description**

**Links**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/events/\{eventId\}/friends Récupérer les** **amis participant à un événement**

Retourne la liste des amis de l’utilisateur connecté qui participent à l’événement spécifié. Nécessite une authentification. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**eventId**

ID de l’événement

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Événement non trouvé

No Links

*Content*

**application/json**

409

Conflict

No Links

*Content*

**/**

55

**Code**

**Description**

**Links**

403

Forbidden

No Links

*Content*

**/**

401

Non authentifié

No Links

*Content*

**application/json**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

Liste des amis participants

No Links

*Content*

**application/json**

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***GET***** /api/v1/event-categories Récupérer toutes les** **catégories d’événements disponibles**

Accessible publiquement. 

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

56

**Code**

**Description**

**Links**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

Liste des catégories

No Links

*Content*

**application/json**

***GET***** /api/v1/auth/validate-email Valider l’e-mail d’un** **utilisateur**

Valide l’e-mail en utilisant le token reçu. En cas de succès, retourne un token JWT pour une connexion automatique. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**query**

**token**

string

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

57

**Code**

**Description**

**Links**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

*Content*

**/**

***DELETE***

**/api/v1/users/me/favorites/structures/\{structureId\}**

**Retirer une structure des favoris de l’utilisateur** **authentifié**

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**structureId **ID de la structure à retirer des favoris integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

58

**Code**

**Description**

**Links**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

204

No Content

No Links

***DELETE***** /api/v1/users/confirm-deletion Confirmer la** **suppression du compte**

Supprime définitivement le compte et les données associées en utilisant le token reçu par e-mail. 

Cette action est irréversible. 

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**query**

**token**

string

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

59

**Code**

**Description**

**Links**

409

Conflict

No Links

*Content*

**/**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

***DELETE***** /api/v1/team/members/\{memberId\} Supprimer un** **membre de l’équipe**

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**memberId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

60

**Code**

**Description**

**Links**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

***DELETE***** /api/v1/friendship/friends/\{friendUserId\}**

**Supprimer un ami**

*Parameters*

**Type**

**Name**

**Description**

**Schema**

**path**

**friendUserId**

integer \(int64\)

*required*

*Responses*

**Code**

**Description**

**Links**

404

Not Found

No Links

*Content*

**/**

409

Conflict

No Links

*Content*

**/**

61

**Code**

**Description**

**Links**

403

Forbidden

No Links

*Content*

**/**

401

Unauthorized

No Links

*Content*

**/**

500

Internal Server Error

No Links

*Content*

**/**

400

Bad Request

No Links

*Content*

**/**

200

OK

No Links

**Type**

**Name**

**Scopes**

**apiKey**

bearerAuth

**Components**

**Schemas**

**ErrorResponseDto**

*Properties*

**Name**

**Description**

**Schema**

statusCode

integer \(int32\)

*optional*

message

string

*optional*

timestamp

string \(date-

*optional*

time\)

path *optional*

string

errors *optional*

< object > 

array

62

**UserProfileUpdateDto**

*Properties*

**Name**

**Description**

**Schema**

firstName

**Maximum Length**: 2147483647

string

*optional*

**Minimum Length**: 2

lastName

**Maximum Length**: 2147483647

string

*optional*

**Minimum Length**: 2

email *optional*

string

**UserProfileResponseDto**

*Properties*

**Name**

**Description**

**Schema**

id *optional*

integer \(int64\)

firstName

string

*optional*

lastName

string

*optional*

email *optional*

string

role *optional*

enum

\(SPECTATOR,S

TRUCTURE\_AD

MINISTRATOR, 

ORGANIZATIO

N\_SERVICE,RE

SERVATION\_SE

RVICE\)

structureId

integer \(int64\)

*optional*

avatarUrl

string

*optional*

createdAt

string \(date-

*optional*

time\)

updatedAt

string \(date-

*optional*

time\)

needsStructure

boolean

Setup *optional*

**UpdateMemberRoleDto**

DTO pour mettre à jour le rôle d’un membre de l’équipe. 

63

*Properties*

**Name**

**Description**

**Schema**

role *required*

Le nouveau rôle à assigner au membre. 

enum

\(SPECTATOR,S

TRUCTURE\_AD

MINISTRATOR, 

ORGANIZATIO

N\_SERVICE,RE

SERVATION\_SE

RVICE\)

**TeamMemberDto**

DTO représentant un membre d’une équipe. 

*Properties*

**Name**

**Description**

**Schema**

id *optional*

ID de l’enregistrement de l’adhésion. 

integer \(int64\)

userId *optional * ID de l’utilisateur \(si le compte est lié\). 

integer \(int64\)

firstName

Prénom de l’utilisateur. 

string

*optional*

lastName

Nom de l’utilisateur. 

string

*optional*

email *optional * Email du membre. 

string

avatarUrl

URL de l’avatar de l’utilisateur. 

string

*optional*

role *optional*

Rôle du membre dans l’équipe. 

enum

\(SPECTATOR,S

TRUCTURE\_AD

MINISTRATOR, 

ORGANIZATIO

N\_SERVICE,RE

SERVATION\_SE

RVICE\)

status *optional * Statut d’un membre au sein d’une équipe. 

enum

\(PENDING\_INV

ITATION,ACTI

VE\)

joinedAt

Date à laquelle le membre a rejoint l’équipe. 

string \(date-

*optional*

time\)

64

**UpdateFriendshipStatusDto** DTO pour mettre à jour le statut d’une demande d’ami. 

*Properties*

**Name**

**Description**

**Schema**

status *required * Statut d’une relation d’amitié. 

enum

\(PENDING,ACC

EPTED,REJECT

ED,BLOCKED,C

ANCELLED\_BY

\_SENDER\)

**AddressDto**

DTO pour les informations d’adresse. 

*Properties*

**Name**

**Description**

**Schema**

street *required * Numéro et nom de la rue. 

string

**Maximum Length**: 255

**Minimum Length**: 0

city *required*

Ville. 

string

**Maximum Length**: 100

**Minimum Length**: 0

zipCode

Code postal. 

string

*required*

**Maximum Length**: 20

**Minimum Length**: 0

country

Pays. 

string

*required*

**Maximum Length**: 100

**Minimum Length**: 0

**EventAreaSummaryDto**

*Properties*

**Name**

**Description**

**Schema**

id *optional*

integer \(int64\)

name *optional*

string

65

**EventAudienceZoneDto**

*Properties*

**Name**

**Description**

**Schema**

id *optional*

ID de la configuration de la zone \(uniquement en réponse\). 

integer \(int64\)

*read only*

name *required * Nom de la zone pour cet événement. 

string

allocatedCapac Capacité maximale de la zone pour cet événement. 

integer \(int32\)

ity *required*

**Minimum**: 0

seatingType

Type de placement pour une zone d’audience. 

enum

*required*

\(SEATED,STAN

DING,MIXED\)

isActive

Indique si la zone est active pour la vente de billets. 

boolean

*required*

areaId *optional*

integer \(int64\)

templateId

integer \(int64\)

*optional*

**EventCategoryDto**

*Properties*

**Name**

**Description**

**Schema**

id *optional*

integer \(int64\)

name *optional*

string

**EventDetailResponseDto**

*Properties*

**Name**

**Description**

**Schema**

id *optional*

integer \(int64\)

name *optional*

string

categories

< 

*optional*

EventCategory

Dto > array

shortDescriptio

string

n *optional*

fullDescription

string

*optional*

tags *optional*

< string > array

66

**Name**

**Description**

**Schema**

startDate

string \(date-

*optional*

time\)

endDate

string \(date-

*optional*

time\)

address

AddressDto

*optional*

structure

StructureSum

*optional*

maryDto

mainPhotoUrl

string

*optional*

eventPhotoUrls

< string > array

*optional*

status *optional*

enum

\(DRAFT,PUBLI

SHED,PENDIN

G\_APPROVAL,C

ANCELLED,CO

MPLETED,ARC

HIVED\)

displayOnHom

boolean

epage *optional*

createdAt

string \(date-

*optional*

time\)

updatedAt

string \(date-

*optional*

time\)

areas *optional*

< 

EventAreaSum

maryDto > 

array

audienceZones

< 

*optional*

EventAudience

ZoneDto > 

array

featuredEvent

boolean

*optional*

**StructureSummaryDto**

DTO pour un résumé de structure, utilisé dans les listes. 

*Properties*

67

**Name**

**Description**

**Schema**

id *optional*

ID unique de la structure. 

integer \(int64\)

name *optional * Nom de la structure. 

string

types *optional * Liste des types auxquels la structure appartient. 

< 

StructureType

Dto > array

city *optional*

Ville où se situe la structure. 

string

logoUrl

URL complète du logo de la structure \(optionnel\). 

string

*optional*

coverUrl

URL complète de l’image de couverture de la structure string *optional*

\(optionnel\). 

eventCount

Nombre d’événements actifs ou à venir associés à cette structure integer \(int32\) *optional*

\(optionnel\). 

active *optional*

boolean

**StructureTypeDto**

DTO pour un type de structure. 

*Properties*

**Name**

**Description**

**Schema**

id *optional*

ID unique du type de structure. 

integer \(int64\)

name *required * Nom du type de structure. 

string

icon *optional*

Nom ou chemin d’une icône associée \(optionnel\). 

string

**EventAudienceZoneConfigDto**

Nouvelle configuration des zones d’audience \(remplace l’ancienne\). 

*Properties*

**Name**

**Description**

**Schema**

id *optional*

integer \(int64\)

templateId

integer \(int64\)

*required*

allocatedCapac **Minimum**: 1

integer \(int32\)

ity *required*

**EventUpdateDto**

*Properties*

68

**Name**

**Description**

**Schema**

name *optional * Nouveau nom de l’événement. 

string

**Maximum Length**: 255

**Minimum Length**: 3

categoryIds

Liste des IDs des catégories de l’événement. 

< integer > 

*required*

array

**Maximum Items**: 2147483647

**Minimum Items**: 1

shortDescriptio Nouvelle description courte. 

string

n *optional*

**Maximum Length**: 500

**Minimum Length**: 0

fullDescription Nouvelle description complète. 

string

*optional*

tags *optional*

Nouvelle liste de mots-clés. 

< string > array

startDate

Nouvelle date de début \(format ISO 8601 UTC\). 

string \(date-

*optional*

time\)

endDate

Nouvelle date de fin \(format ISO 8601 UTC\). 

string \(date-

*optional*

time\)

address

AddressDto

*optional*

audienceZones Nouvelle configuration des zones d’audience \(remplace < *required*

l’ancienne\). 

EventAudience

ZoneConfigDto

**Maximum Items**: 2147483647

> array

**Minimum Items**: 1

displayOnHom Mettre à jour l’affichage sur la page d’accueil. 

boolean

epage *optional*

isFeaturedEve Mettre à jour la mise en avant de l’événement. 

boolean

nt *optional*

**FavoriteStructureRequestDto**

*Properties*

**Name**

**Description**

**Schema**

structureId

integer \(int64\)

*required*

**UserFavoriteStructureDto**

*Properties*

69

**Name**

**Description**

**Schema**

id *optional*

integer \(int64\)

userId *optional*

integer \(int64\)

structure

StructureSum

*optional*

maryDto

addedAt

string \(date-

*optional*

time\)

**FileUploadResponseDto**

DTO pour la réponse suite à un upload de fichier. 

*Properties*

**Name**

**Description**

**Schema**

fileName

Nom original du fichier uploadé. 

string

*optional*

fileUrl *optional * URL publique complète pour accéder au fichier uploadé. 

string

message

Message confirmant le succès de l’upload. 

string

*optional*

**TicketValidationRequestDto**

Requête pour valider un billet en utilisant la valeur de son QR code. 

*Properties*

**Name**

**Description**

**Schema**

scannedQrCod La valeur unique scannée depuis le QR code du billet. 

string

eValue

*required*

**ParticipantInfoDto**

Informations sur le détenteur du billet. 

*Properties*

**Name**

**Description**

**Schema**

firstName

Prénom du participant. 

string

*required*

**Maximum Length**: 255

**Minimum Length**: 1

70

**Name**

**Description**

**Schema**

lastName

Nom de famille du participant. 

string

*required*

**Maximum Length**: 255

**Minimum Length**: 1

email *required * Email du participant. 

string

sendTicketByE Email du participant. 

boolean

mail *optional*

**TicketValidationResponseDto**

Réponse après une tentative de validation de billet. 

*Properties*

**Name**

**Description**

**Schema**

ticketId

ID du billet qui a été validé. 

string \(uuid\)

*optional*

status *optional * Le statut du billet après la tentative de validation. 

enum

\(VALID,USED,C

ANCELLED,EX

PIRED\)

message

Un message lisible par l’homme confirmant le résultat. 

string

*optional*

participant

ParticipantInfo

*optional*

Dto

**ReservationRequestDto**

Requête pour créer une nouvelle réservation pour un ou plusieurs billets. 

*Properties*

**Name**

**Description**

**Schema**

eventId

ID de l’événement pour lequel les billets sont réservés. 

integer \(int64\)

*required*

audienceZoneI ID de la zone d’audience spécifique au sein de l’événement. 

integer \(int64\)

d *required*

participants

Liste des participants pour lesquels les billets sont réservés. 

< 

*required*

ParticipantInfo

**Maximum Items**: 10

Dto > array

**Minimum Items**: 1

71

**AudienceZoneTicketSnapshot** Instantané des informations clés de la zone d’audience. 

*Properties*

**Name**

**Description**

**Schema**

audienceZoneI

integer \(int64\)

d *optional*

name *optional*

string

seatingType

Type de placement pour une zone d’audience. 

enum

*optional*

\(SEATED,STAN

DING,MIXED\)

**EventTicketSnapshot**

Instantané des informations clés de l’événement. 

*Properties*

**Name**

**Description**

**Schema**

eventId

integer \(int64\)

*optional*

name *optional*

string

startDate

string \(date-

*optional*

time\)

address

AddressDto

*optional*

mainPhotoUrl

string

*optional*

**ReservationConfirmationDto**

Réponse de confirmation après une réservation réussie. 

*Properties*

**Name**

**Description**

**Schema**

reservationId

ID de la réservation qui groupe les billets. 

integer \(int64\)

*optional*

tickets *optional * Liste de tous les billets créés dans cette réservation. 

< 

TicketRespons

eDto > array

reservationDat Date et heure de la réservation. 

string \(date-

e *optional*

time\)

72

**TicketResponseDto**

Réponse détaillée pour un billet unique. 

*Properties*

**Name**

**Description**

**Schema**

id *optional*

ID unique du billet. 

string \(uuid\)

qrCodeValue

Valeur à encoder dans le QR code. 

string

*optional*

status *optional * Statut actuel du billet. 

enum

\(VALID,USED,C

ANCELLED,EX

PIRED\)

participant

ParticipantInfo

*optional*

Dto

eventSnapshot

EventTicketSn

*optional*

apshot

audienceZoneS

AudienceZone

napshot

TicketSnapshot

*optional*

reservation\_da Date et heure de la réservation. 

string \(date-

te\_time

time\)

*optional*

**InviteMemberRequestDto**

DTO pour inviter un nouveau membre dans une équipe. 

*Properties*

**Name**

**Description**

**Schema**

email *required * Email de la personne à inviter. 

string

role *required*

Rôle à assigner au nouveau membre. 

enum

\(SPECTATOR,S

TRUCTURE\_AD

MINISTRATOR, 

ORGANIZATIO

N\_SERVICE,RE

SERVATION\_SE

RVICE\)

**StructureCreationDto**

DTO pour la création de la structure

73

*Properties*

**Name**

**Description**

**Schema**

name *required * Nom de la structure. 

string

**Maximum Length**: 255

**Minimum Length**: 0

typeIds

Liste des IDs des types de structure auxquels cette structure < integer > *required*

appartient. 

array

description

Description textuelle détaillée de la structure \(optionnel\). 

string

*optional*

address

AddressDto

*required*

phone *optional * Numéro de téléphone de contact de la structure \(optionnel\). 

string

**Maximum Length**: 30

**Minimum Length**: 0

email *optional * Adresse e-mail de contact de la structure \(optionnel\). 

string

**Maximum Length**: 255

**Minimum Length**: 0

websiteUrl

URL du site web officiel de la structure \(optionnel\). 

string

*optional*

**Maximum Length**: 2048

**Minimum Length**: 0

socialMediaLin Liste des URLs pointant vers les profils de la structure sur les < string > array ks *optional*

réseaux sociaux \(optionnel\). 

**StructureCreationResponseDto**

DTO de réponse après la création réussie d’une structure. 

*Properties*

**Name**

**Description**

**Schema**

id *optional*

ID de la structure nouvellement créée. 

integer \(int64\)

name *optional * Nom de la structure nouvellement créée. 

string

message

Message confirmant la création. 

string

*optional*

needsReAuth

Indique si le client \(administrateur de structure\) doit se boolean *optional*

réauthentifier pour mettre à jour son token JWT avec le nouveau structureId associé. 

74

**AreaCreationDto**

DTO pour la création d’un espace physique \(StructureArea\). 

*Properties*

**Name**

**Description**

**Schema**

name *required * Nom de l’espace physique. 

string

**Maximum Length**: 255

**Minimum Length**: 0

description

Description de cet espace \(optionnel\). 

string

*optional*

maxCapacity

Capacité maximale de l’espace. 

integer \(int32\)

*required*

**Minimum**: 0

isActive

Statut d’activité de l’espace. Par défaut à true si non fourni. 

boolean

*optional*

**AreaResponseDto**

DTO pour la réponse d’un espace physique \(StructureArea\). 

*Properties*

**Name**

**Description**

**Schema**

id *optional*

ID unique de l’espace physique. 

integer \(int64\)

name *optional * Nom de l’espace physique. 

string

description

Description de cet espace \(optionnel\). 

string

*optional*

maxCapacity

Capacité maximale de l’espace. 

integer \(int32\)

*optional*

structureId

ID de la structure parente. 

integer \(int64\)

*optional*

audienceZoneT Liste des modèles de zones d’audience associés à cet espace. 

< 

emplates

AudienceZone

*optional*

TemplateRespo

nseDto > array

active *optional*

boolean

**AudienceZoneTemplateResponseDto**

DTO pour la réponse d’un modèle de zone d’audience. 

*Properties*

75

**Name**

**Description**

**Schema**

id *optional*

ID unique du modèle de zone d’audience. 

integer \(int64\)

name *optional * Nom du modèle de zone. 

string

maxCapacity

Capacité maximale de cette zone modèle. 

integer \(int32\)

*optional*

seatingType

Type de placement pour une zone d’audience. 

enum

*optional*

\(SEATED,STAN

DING,MIXED\)

areaId *optional * ID de l’espace physique \(StructureArea\) parent. 

integer \(int64\)

active *optional*

boolean

**AudienceZoneTemplateCreationDto**

DTO pour la création d’un modèle de zone d’audience. 

*Properties*

**Name**

**Description**

**Schema**

name *required * Nom du modèle de zone. 

string

**Maximum Length**: 255

**Minimum Length**: 0

maxCapacity

Capacité maximale de cette zone modèle. 

integer \(int32\)

*required*

**Minimum**: 0

seatingType

Type de placement pour une zone d’audience. 

enum

*optional*

\(SEATED,STAN

DING,MIXED\)

isActive

Statut d’activité de ce modèle de zone. Par défaut à true si non boolean *optional*

fourni. 

**SendFriendRequestDto**

DTO pour envoyer une demande d’ami via l’email de l’utilisateur. 

*Properties*

**Name**

**Description**

**Schema**

email *required * Email de l’utilisateur à qui envoyer la demande. 

string

**EventCreationDto**

*Properties*

76

**Name**

**Description**

**Schema**

name *required * Nom de l’événement. 

string

**Maximum Length**: 255

**Minimum Length**: 3

categoryIds

Liste des IDs des catégories de l’événement. 

< integer > 

*required*

array

**Maximum Items**: 2147483647

**Minimum Items**: 1

shortDescriptio Description courte de l’événement pour les aperçus. 

string

n *optional*

**Maximum Length**: 500

**Minimum Length**: 0

fullDescription Description complète et détaillée de l’événement. 

string

*required*

tags *optional*

Liste de mots-clés pour la recherche. 

< string > array

startDate

Date et heure de début de l’événement \(format ISO 8601 UTC\). 

string \(date-

*required*

time\)

endDate

Date et heure de fin de l’événement \(format ISO 8601 UTC\). 

string \(date-

*required*

time\)

address

AddressDto

*required*

structureId

ID de la structure organisatrice. 

integer \(int64\)

*required*

audienceZones Configuration des zones d’audience pour l’événement. 

< 

*required*

EventAudience

ZoneConfigDto

> array

displayOnHom Indique si l’événement doit être affiché sur la page d’accueil. 

boolean

epage *required*

isFeaturedEve Indique si l’événement doit être mis en avant. 

boolean

nt *required*

**PasswordResetDto**

*Properties*

**Name**

**Description**

**Schema**

token *required*

string

newPassword **Maximum Length**: 2147483647

string

*required*

**Minimum Length**: 8

77

**UserRegistrationDto**

*Properties*

**Name**

**Description**

**Schema**

firstName

**Maximum Length**: 50

string

*required*

**Minimum Length**: 2

lastName

**Maximum Length**: 50

string

*required*

**Minimum Length**: 2

email *required*

string

password

**Maximum Length**: 2147483647

string

*required*

**Minimum Length**: 8

createStructur Indique si l’utilisateur s’inscrit en tant qu’administrateur et doit boolean e *optional*

créer une structure. Si non fourni, la valeur par défaut est false. 

invitationToke Token d’invitation optionnel pour rejoindre une équipe lors de string n *optional*

l’inscription. 

**AuthResponseDto**

*Properties*

**Name**

**Description**

**Schema**

accessToken

string

*optional*

tokenType

string

*optional*

expiresIn

integer \(int64\)

*optional*

userId *optional*

integer \(int64\)

email *optional*

string

firstName

string

*optional*

lastName

string

*optional*

role *optional*

enum

\(SPECTATOR,S

TRUCTURE\_AD

MINISTRATOR, 

ORGANIZATIO

N\_SERVICE,RE

SERVATION\_SE

RVICE\)

78

**Name**

**Description**

**Schema**

needsStructure

boolean

Setup *optional*

structureId

integer \(int64\)

*optional*

avatarUrl

string

*optional*

**UserLoginDto**

*Properties*

**Name**

**Description**

**Schema**

email *required*

string

password

string

*required*

**PasswordResetRequestDto**

*Properties*

**Name**

**Description**

**Schema**

email *required*

string

**StructureUpdateDto**

DTO pour la mise à jour \(PATCH\) d’une structure existante. 

*Properties*

**Name**

**Description**

**Schema**

name *optional * Nouveau nom de la structure \(optionnel\). 

string

**Maximum Length**: 255

**Minimum Length**: 0

typeIds

Nouvelle liste des IDs des types de structure \(optionnel\). Si < integer > *optional*

fournie, remplace l’existante. 

array

description

Nouvelle description textuelle de la structure \(optionnel\). 

string

*optional*

address

AddressDto

*optional*

phone *optional * Nouveau numéro de téléphone de contact \(optionnel\). 

string

**Maximum Length**: 30

**Minimum Length**: 0

79

**Name**

**Description**

**Schema**

email *optional * Nouvelle adresse e-mail de contact \(optionnel\). 

string

**Maximum Length**: 255

**Minimum Length**: 0

websiteUrl

Nouvelle URL du site web officiel \(optionnel\). 

string

*optional*

**Maximum Length**: 2048

**Minimum Length**: 0

socialMediaLin Nouvelle liste des URLs des réseaux sociaux \(optionnel\). Si < string > array ks *optional*

fournie, remplace l’existante. 

isActive

Nouveau statut d’activité de la structure \(optionnel\). 

boolean

*optional*

**StructureDetailResponseDto**

DTO pour les détails complets d’une structure. 

*Properties*

**Name**

**Description**

**Schema**

id *optional*

ID unique de la structure. 

integer \(int64\)

name *optional * Nom de la structure. 

string

types *optional * Liste des types auxquels la structure appartient. 

< 

StructureType

Dto > array

description

Description textuelle détaillée de la structure. 

string

*optional*

address

AddressDto

*optional*

phone *optional * Numéro de téléphone de contact de la structure. 

string

email *optional * Adresse e-mail de contact de la structure. 

string

websiteUrl

URL du site web officiel de la structure. 

string

*optional*

socialMediaLin Liste des URLs pointant vers les profils de la structure sur les < string > array ks *optional*

réseaux sociaux. 

logoUrl

URL complète du logo de la structure. 

string

*optional*

coverUrl

URL complète de l’image de couverture de la structure. 

string

*optional*

galleryImageU Liste des URLs complètes des images composant la galerie de la < string > array rls *optional*

structure. 

80

**Name**

**Description**

**Schema**

createdAt

Date et heure de création de l’enregistrement de la structure. 

string \(date-

*optional*

time\)

updatedAt

Date et heure de la dernière modification de l’enregistrement de string \(date-optional

la structure. 

time\)

active *optional*

boolean

**AreaUpdateDto**

DTO pour la mise à jour d’un espace physique \(StructureArea\). 

*Properties*

**Name**

**Description**

**Schema**

name *optional * Nouveau nom de l’espace physique. 

string

**Maximum Length**: 255

**Minimum Length**: 0

description

Nouvelle description de cet espace. 

string

*optional*

maxCapacity

Nouvelle capacité maximale de l’espace. 

integer \(int32\)

*optional*

**Minimum**: 0

isActive

Nouveau statut d’activité de l’espace. 

boolean

*optional*

**AudienceZoneTemplateUpdateDto**

DTO pour la création d’un modèle de zone d’audience. 

*Properties*

**Name**

**Description**

**Schema**

name *required * Nom du modèle de zone. 

string

**Maximum Length**: 255

**Minimum Length**: 0

maxCapacity

Capacité maximale de cette zone modèle. 

integer \(int32\)

*required*

**Minimum**: 0

seatingType

Type de placement pour une zone d’audience. 

enum

*optional*

\(SEATED,STAN

DING,MIXED\)

isActive

Statut d’activité de ce modèle de zone. Par défaut à true si non boolean *optional*

fourni. 

81

**EventStatusUpdateDto**

*Properties*

**Name**

**Description**

**Schema**

status *required * Le nouveau statut de l’événement. 

enum

\(DRAFT,PUBLI

SHED,PENDIN

G\_APPROVAL,C

ANCELLED,CO

MPLETED,ARC

HIVED\)

**Page**

*Properties*

**Name**

**Description**

**Schema**

totalPages

integer \(int32\)

*optional*

totalElements

integer \(int64\)

*optional*

pageable

PageableObject

*optional*

size *optional*

integer \(int32\)

content

< object > 

*optional*

array

number

integer \(int32\)

*optional*

sort *optional*

< SortObject > 

array

numberOfEle

integer \(int32\)

ments *optional*

first *optional*

boolean

last *optional*

boolean

empty *optional*

boolean

**PageableObject**

*Properties*

**Name**

**Description**

**Schema**

paged *optional*

boolean

82

**Name**

**Description**

**Schema**

pageNumber

integer \(int32\)

*optional*

pageSize

integer \(int32\)

*optional*

offset *optional*

integer \(int64\)

sort *optional*

< SortObject > 

array

unpaged

boolean

*optional*

**SortObject**

*Properties*

**Name**

**Description**

**Schema**

direction

string

*optional*

nullHandling

string

*optional*

ascending

boolean

*optional*

property

string

*optional*

ignoreCase

boolean

*optional*

**FriendResponseDto**

DTO représentant un ami accepté. 

*Properties*

**Name**

**Description**

**Schema**

friendshipId

ID de la relation d’amitié. 

integer \(int64\)

*optional*

friend *optional*

UserSummary

Dto

since *optional * Date à laquelle l’amitié a été acceptée \(devenue effective\). 

string \(date-

time\)

**FriendsDataResponseDto**

DTO complet contenant toutes les informations d’amitié d’un utilisateur. 

83

*Properties*

**Name**

**Description**

**Schema**

friends

Liste des amis acceptés. 

< 

*optional*

FriendRespons

eDto > array

pendingReques Liste des demandes d’ami reçues et en attente. 

< 

ts *optional*

ReceivedFrien

dRequestRespo

nseDto > array

sentRequests

Liste des demandes d’ami envoyées et en attente. 

< 

*optional*

SentFriendReq

uestResponseD

to > array

**ReceivedFriendRequestResponseDto**

DTO représentant une demande d’ami reçue. 

*Properties*

**Name**

**Description**

**Schema**

friendshipId

ID de la demande d’amitié. 

integer \(int64\)

*optional*

sender

UserSummary

*optional*

Dto

requestedAt

Date à laquelle la demande a été envoyée. 

string \(date-

*optional*

time\)

**SentFriendRequestResponseDto**

DTO représentant une demande d’ami envoyée. 

*Properties*

**Name**

**Description**

**Schema**

friendshipId

ID de la demande d’amitié. 

integer \(int64\)

*optional*

receiver

UserSummary

*optional*

Dto

sentAt *optional * Date à laquelle la demande a été envoyée. 

string \(date-

time\)

**UserSummaryDto**

DTO résumé d’un utilisateur. 

84

*Properties*

**Name**

**Description**

**Schema**

id *optional*

ID de l’utilisateur. 

integer \(int64\)

firstName

Prénom de l’utilisateur. 

string

*optional*

lastName

Nom de l’utilisateur. 

string

*optional*

avatarUrl

URL complète de l’avatar de l’utilisateur. 

string

*optional*

**PaginatedResponseDto**

*Properties*

**Name**

**Description**

**Schema**

items *optional*

< object > 

array

totalItems

integer \(int64\)

*optional*

currentPage

integer \(int32\)

*optional*

pageSize

integer \(int32\)

*optional*

totalPages

integer \(int32\)

*optional*

85



# Document Outline

+ API Tickly v1.0 
+ Overview 
+ Tags 
+ Paths  
	+ GET /api/v1/users/me Récupérer le profil de l’utilisateur authentifié 
	+ PUT /api/v1/users/me Mettre à jour le profil de l’utilisateur authentifié 
	+ DELETE /api/v1/users/me Demander la suppression de mon compte 
	+ PUT /api/v1/team/members/\{memberId\}/role Mettre à jour le rôle d’un membre de l’équipe 
	+ PUT /api/v1/friendship/requests/\{friendshipId\} Mettre à jour le statut d’une demande d’ami \(accepter, refuser, annuler\) 
	+ GET /api/v1/events/\{eventId\} Récupérer les détails d’un événement par son ID 
	+ PUT /api/v1/events/\{eventId\} Mettre à jour un événement existant 
	+ DELETE /api/v1/events/\{eventId\} Supprimer un événement 
	+ GET /api/v1/users/me/favorites/structures Lister les structures favorites de l’utilisateur authentifié 
	+ POST /api/v1/users/me/favorites/structures Ajouter une structure aux favoris de l’utilisateur authentifié 
	+ POST /api/v1/users/me/avatar Uploader ou mettre à jour l’avatar de l’utilisateur authentifié 
	+ POST /api/v1/ticketing/tickets/validate Valider un billet 
	+ POST /api/v1/ticketing/reservations Créer une nouvelle réservation 
	+ POST /api/v1/team/structure/\{structureId\}/invite Inviter un nouveau membre dans l’équipe 
	+ POST /api/v1/team/invitations/accept Accepter une invitation à rejoindre une équipe 
	+ GET /api/v1/structures Lister toutes les structures 
	+ POST /api/v1/structures Créer une nouvelle structure 
	+ POST /api/v1/structures/\{structureId\}/logo Mettre à jour le logo d’une structure 
	+ DELETE /api/v1/structures/\{structureId\}/logo Supprimer le logo d’une structure 
	+ POST /api/v1/structures/\{structureId\}/gallery Ajouter plusieurs images à la galerie d’une structure 
	+ DELETE /api/v1/structures/\{structureId\}/gallery Supprimer une image de la galerie d’une structure 
	+ POST /api/v1/structures/\{structureId\}/cover Mettre à jour l’image de couverture d’une structure 
	+ DELETE /api/v1/structures/\{structureId\}/cover Supprimer l’image de couverture d’une structure 
	+ GET /api/v1/structures/\{structureId\}/areas Lister les espaces \(Areas\) d’une structure 
	+ POST /api/v1/structures/\{structureId\}/areas Créer un espace \(Area\) pour une structure 
	+ GET /api/v1/structures/\{structureId\}/areas/\{areaId\}/audience-zone-templates Lister les modèles de zones d’un espace 
	+ POST /api/v1/structures/\{structureId\}/areas/\{areaId\}/audience-zone-templates Créer un modèle de zone d’audience 
	+ POST /api/v1/friendship/requests Envoyer une demande d’ami 
	+ GET /api/v1/events Lister et rechercher des événements 
	+ POST /api/v1/events Créer un nouvel événement 
	+ POST /api/v1/events/\{eventId\}/main-photo Uploader ou mettre à jour la photo principale d’un événement 
	+ POST /api/v1/events/\{eventId\}/gallery Ajouter une image à la galerie d’un événement 
	+ DELETE /api/v1/events/\{eventId\}/gallery Supprimer une image de la galerie d’un événement 
	+ POST /api/v1/auth/reset-password Réinitialiser le mot de passe 
	+ POST /api/v1/auth/register Inscrire un nouvel utilisateur et le connecter 
	+ POST /api/v1/auth/login Connecter un utilisateur existant 
	+ POST /api/v1/auth/forgot-password Demander la réinitialisation du mot de passe 
	+ GET /api/v1/structures/\{structureId\} Récupérer les détails d’une structure 
	+ DELETE /api/v1/structures/\{structureId\} Supprimer une structure 
	+ PATCH /api/v1/structures/\{structureId\} Mettre à jour une structure \(partiel\) 
	+ GET /api/v1/structures/\{structureId\}/areas/\{areaId\} Récupérer un espace \(Area\) spécifique 
	+ DELETE /api/v1/structures/\{structureId\}/areas/\{areaId\} Supprimer un espace \(Area\) 
	+ PATCH /api/v1/structures/\{structureId\}/areas/\{areaId\} Mettre à jour un espace \(Area\) 
	+ GET /api/v1/structures/\{structureId\}/areas/\{areaId\}/audience-zone-templates/\{templateId\} Récupérer un modèle de zone spécifique 
	+ DELETE /api/v1/structures/\{structureId\}/areas/\{areaId\}/audience-zone-templates/\{templateId\} Supprimer un modèle de zone 
	+ PATCH /api/v1/structures/\{structureId\}/areas/\{areaId\}/audience-zone-templates/\{templateId\} Mettre à jour un modèle de zone 
	+ PATCH /api/v1/events/\{eventId\}/status Mettre à jour le statut d’un événement 
	+ GET /api/v1/ticketing/tickets/\{ticketId\} Obtenir les détails d’un billet 
	+ GET /api/v1/ticketing/my-tickets Obtenir mes billets 
	+ GET /api/v1/team/structure/\{structureId\} Récupérer les membres de l’équipe d’une structure 
	+ GET /api/v1/structure-types Récupérer tous les types de structure disponibles 
	+ GET /api/v1/friendship Récupérer toutes les données d’amitié de l’utilisateur 
	+ GET /api/v1/events/\{eventId\}/friends Récupérer les amis participant à un événement 
	+ GET /api/v1/event-categories Récupérer toutes les catégories d’événements disponibles 
	+ GET /api/v1/auth/validate-email Valider l’e-mail d’un utilisateur 
	+ DELETE /api/v1/users/me/favorites/structures/\{structureId\} Retirer une structure des favoris de l’utilisateur authentifié 
	+ DELETE /api/v1/users/confirm-deletion Confirmer la suppression du compte 
	+ DELETE /api/v1/team/members/\{memberId\} Supprimer un membre de l’équipe 
	+ DELETE /api/v1/friendship/friends/\{friendUserId\} Supprimer un ami 

+ Components  
	+ Schemas



