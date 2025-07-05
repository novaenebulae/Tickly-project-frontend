# API Tickly v1.0
Documentation de l'API RESTful pour le backend du système de billetterie Tickly.

## Version: 1.0

**Contact information:**  
Support Tickly  
https://tickly.com  
contact@tickly.com

### /api/v1/users/me

#### GET
##### Summary:

Récupérer le profil de l'utilisateur authentifié

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

#### PUT
##### Summary:

Mettre à jour le profil de l'utilisateur authentifié

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

#### DELETE
##### Summary:

Demander la suppression de mon compte

##### Description:

Lance le processus de suppression de compte en envoyant un e-mail de confirmation. La suppression n'est pas immédiate.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/team/members/{memberId}/role

#### PUT
##### Summary:

Mettre à jour le rôle d'un membre de l'équipe

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| memberId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/friendship/requests/{friendshipId}

#### PUT
##### Summary:

Mettre à jour le statut d'une demande d'ami (accepter, refuser, annuler)

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| friendshipId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/users/me/favorites/structures

#### GET
##### Summary:

Lister les structures favorites de l'utilisateur authentifié

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

#### POST
##### Summary:

Ajouter une structure aux favoris de l'utilisateur authentifié

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/users/me/avatar

#### POST
##### Summary:

Uploader ou mettre à jour l'avatar de l'utilisateur authentifié

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/ticketing/tickets/validate

#### POST
##### Summary:

Valider un billet

##### Description:

Valide un billet en utilisant la valeur scannée de son QR code. Nécessite des rôles de service spécifiques.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/ticketing/reservations

#### POST
##### Summary:

Créer une nouvelle réservation

##### Description:

Crée une nouvelle réservation pour un ou plusieurs billets pour un événement spécifique.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/team/structure/{structureId}/invite

#### POST
##### Summary:

Inviter un nouveau membre dans l'équipe

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/team/invitations/accept

#### POST
##### Summary:

Accepter une invitation à rejoindre une équipe

##### Description:

Endpoint public pour accepter une invitation d'équipe. Le token d'invitation est passé en paramètre. L'utilisateur est automatiquement identifié via le token d'invitation. Retourne un nouveau token JWT avec les permissions mises à jour.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| token | query |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/structures

#### GET
##### Summary:

Lister toutes les structures

##### Description:

Récupère une liste paginée et potentiellement filtrée de toutes les structures. Endpoint public.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| page | query | Zero-based page index (0..N) | No | integer |
| size | query | The size of the page to be returned | No | integer |
| sort | query | Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. | No | [ string ] |
| query | query | Recherche textuelle sur le nom de la structure. | No | string |
| typeIds | query | Filtrer par type de structure (ex: 'Théâtre', 'Salle de concert'). | No | [ long ] |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Liste des structures récupérée avec succès |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### POST
##### Summary:

Créer une nouvelle structure

##### Description:

Permet à un administrateur de structure (avec 'needsStructureSetup' à true) de créer sa structure. Le token JWT de l'utilisateur sera mis à jour implicitement côté serveur pour refléter l'association.

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Structure créée avec succès |
| 400 | Données de création invalides |
| 401 | Authentification requise |
| 403 | L'utilisateur n'est pas autorisé à créer une structure ou en a déjà une |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/structures/{structureId}/logo

#### POST
##### Summary:

Mettre à jour le logo d'une structure

##### Description:

Remplace le logo actuel de la structure. Nécessite d'être le propriétaire.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### DELETE
##### Summary:

Supprimer le logo d'une structure

##### Description:

Supprime le logo actuel de la structure. Nécessite d'être le propriétaire.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 204 | Logo supprimé avec succès |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Accès refusé |
| 404 | Structure non trouvée ou logo inexistant |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/structures/{structureId}/gallery

#### POST
##### Summary:

Ajouter plusieurs images à la galerie d'une structure

##### Description:

Ajoute plusieurs nouvelles images à la galerie de la structure en une seule fois.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| files | query |  | Yes | [ binary ] |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### DELETE
##### Summary:

Supprimer une image de la galerie d'une structure

##### Description:

Supprime une image spécifique de la galerie. Nécessite d'être le propriétaire.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| imagePath | query | Chemin de l'image à supprimer, tel que retourné dans les URLs de la galerie. | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/structures/{structureId}/cover

#### POST
##### Summary:

Mettre à jour l'image de couverture d'une structure

##### Description:

Remplace l'image de couverture actuelle de la structure. Nécessite d'être le propriétaire.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### DELETE
##### Summary:

Supprimer l'image de couverture d'une structure

##### Description:

Supprime l'image de couverture actuelle de la structure. Nécessite d'être le propriétaire.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 204 | Image de couverture supprimée avec succès |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Accès refusé |
| 404 | Structure non trouvée ou image de couverture inexistante |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/structures/{structureId}/areas

#### GET
##### Summary:

Lister les espaces (Areas) d'une structure

##### Description:

Récupère tous les espaces physiques configurés pour une structure donnée. Accessible au propriétaire ou aux services d'organisation.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### POST
##### Summary:

Créer un espace (Area) pour une structure

##### Description:

Ajoute un nouvel espace physique (salle, scène...) à une structure. Nécessite d'être le propriétaire.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/structures/{structureId}/areas/{areaId}/audience-zone-templates

#### GET
##### Summary:

Lister les modèles de zones d'un espace

##### Description:

Récupère tous les modèles de zones d'audience pour un espace donné.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| areaId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### POST
##### Summary:

Créer un modèle de zone d'audience

##### Description:

Ajoute un nouveau modèle de zone (fosse, balcon...) à un espace spécifique. Nécessite d'être propriétaire de la structure.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| areaId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/friendship/requests

#### POST
##### Summary:

Envoyer une demande d'ami

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/events

#### GET
##### Summary:

Lister et rechercher des événements

##### Description:

Récupère une liste paginée d'événements, avec des options de filtrage et de tri. Accessible publiquement.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| query | query | Recherche textuelle sur le nom, la description et les tags de l'événement. | No | string |
| categoryIds | query | Liste d'IDs de catégories pour filtrer les événements. | No | [ long ] |
| startDateAfter | query | Filtrer les événements commençant après cette date (format ISO 8601 UTC). | No | dateTime |
| startDateBefore | query | Filtrer les événements commençant avant cette date (format ISO 8601 UTC). | No | dateTime |
| status | query | Filtrer par statut de l'événement. | No | string |
| displayOnHomepage | query | Filtrer les événements affichés sur la page d'accueil. | No | boolean |
| isFeatured | query | Filtrer les événements mis en avant. | No | boolean |
| structureId | query | Filtrer par ID de la structure organisatrice. | No | long |
| city | query | Filtrer par ville de l'événement. | No | string |
| tags | query | Filtrer par tags (logique ET). | No | [ string ] |
| page | query | Zero-based page index (0..N) | No | integer |
| size | query | The size of the page to be returned | No | integer |
| sort | query | Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported. | No | [ string ] |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Liste des événements récupérée |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

#### POST
##### Summary:

Créer un nouvel événement

##### Description:

Crée un nouvel événement associé à une structure. Nécessite un rôle d'administrateur de structure ou de service d'organisation.

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Événement créé avec succès |
| 400 | Données de requête invalides |
| 401 | Unauthorized |
| 403 | Accès refusé |
| 404 | Structure ou Catégorie non trouvée |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/events/{eventId}/main-photo

#### POST
##### Summary:

Uploader ou mettre à jour la photo principale d'un événement

##### Description:

Remplace la photo principale existante. Seul le propriétaire peut effectuer cette action.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| eventId | path | ID de l'événement | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Photo mise à jour |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/events/{eventId}/gallery

#### POST
##### Summary:

Ajouter des images à la galerie d'un événement

##### Description:

Ajoute de nouvelles images à la galerie.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| eventId | path |  | Yes | long |
| files | query |  | Yes | [ binary ] |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Image ajoutée |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### DELETE
##### Summary:

Supprimer une image de la galerie d'un événement

##### Description:

Supprime une image spécifique de la galerie. Seul le propriétaire peut effectuer cette action.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| eventId | path | ID de l'événement | Yes | long |
| imagePath | query | Chemin/nom du fichier image à supprimer (tel que retourné par l'API) | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 204 | Image supprimée |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/auth/reset-password

#### POST
##### Summary:

Réinitialiser le mot de passe

##### Description:

Met à jour le mot de passe de l'utilisateur en utilisant le token et le nouveau mot de passe fournis.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/auth/register

#### POST
##### Summary:

Inscrire un nouvel utilisateur et le connecter

##### Description:

Crée un nouveau compte utilisateur et retourne un token JWT si l'inscription réussit.

##### Responses

| Code | Description |
| ---- | ----------- |
| 201 | Utilisateur inscrit et connecté avec succès |
| 400 | Données d'inscription invalides |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | L'email est déjà utilisé |
| 500 | Internal Server Error |

### /api/v1/auth/refresh-token

#### POST
##### Summary:

Rafraîchir le token JWT

##### Description:

Génère un nouveau token JWT pour l'utilisateur actuellement authentifié.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Token rafraîchi avec succès |
| 400 | Bad Request |
| 401 | Authentification requise |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/auth/login

#### POST
##### Summary:

Connecter un utilisateur existant

##### Description:

Valide les identifiants de l'utilisateur et retourne un token JWT en cas de succès.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Connexion réussie |
| 400 | Données de connexion invalides |
| 401 | Identifiants incorrects |
| 403 | Email non validé |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/auth/forgot-password

#### POST
##### Summary:

Demander la réinitialisation du mot de passe

##### Description:

Envoie un e-mail avec un lien de réinitialisation si l'adresse e-mail est associée à un compte.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/structures/{structureId}

#### GET
##### Summary:

Récupérer les détails d'une structure

##### Description:

Récupère les informations détaillées d'une structure par son ID. Endpoint public.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Détails de la structure |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Structure non trouvée |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### DELETE
##### Summary:

Supprimer une structure

##### Description:

Supprime une structure et tous ses composants et fichiers associés. Accessible aux administrateurs système ou au propriétaire de la structure.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 204 | Structure supprimée avec succès |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Accès refusé |
| 404 | Structure non trouvée |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### PATCH
##### Summary:

Mettre à jour une structure (partiel)

##### Description:

Met à jour partiellement une structure existante. Seuls les champs fournis seront modifiés. Accessible aux administrateurs système ou au propriétaire de la structure.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Structure mise à jour avec succès |
| 400 | Données invalides |
| 401 | Unauthorized |
| 403 | Accès refusé |
| 404 | Structure non trouvée |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/structures/{structureId}/areas/{areaId}

#### GET
##### Summary:

Récupérer un espace (Area) spécifique

##### Description:

Récupère les détails d'un espace par son ID, dans le contexte d'une structure.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| areaId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### DELETE
##### Summary:

Supprimer un espace (Area)

##### Description:

Supprime un espace d'une structure. Nécessite d'être le propriétaire.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| areaId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### PATCH
##### Summary:

Mettre à jour un espace (Area)

##### Description:

Met à jour partiellement un espace existant. Nécessite d'être le propriétaire de la structure parente.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| areaId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/structures/{structureId}/areas/{areaId}/audience-zone-templates/{templateId}

#### GET
##### Summary:

Récupérer un modèle de zone spécifique

##### Description:

Récupère les détails d'un modèle de zone par son ID.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| areaId | path |  | Yes | long |
| templateId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### DELETE
##### Summary:

Supprimer un modèle de zone

##### Description:

Supprime un modèle de zone d'audience. Nécessite d'être propriétaire.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| areaId | path |  | Yes | long |
| templateId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### PATCH
##### Summary:

Mettre à jour un modèle de zone

##### Description:

Met à jour un modèle de zone existant. Nécessite d'être propriétaire.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |
| areaId | path |  | Yes | long |
| templateId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/events/{eventId}

#### GET
##### Summary:

Récupérer les détails d'un événement par son ID

##### Description:

Accessible publiquement.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| eventId | path | ID de l'événement à récupérer | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Détails de l'événement |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Événement non trouvé |
| 409 | Conflict |
| 500 | Internal Server Error |

#### DELETE
##### Summary:

Supprimer un événement

##### Description:

Supprime un événement et tous les fichiers associés. Opération irréversible. Seul le propriétaire peut effectuer cette action.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| eventId | path | ID de l'événement à supprimer | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 204 | Événement supprimé avec succès |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Accès refusé |
| 404 | Événement non trouvé |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

#### PATCH
##### Summary:

Mettre à jour partiellement un événement existant

##### Description:

Met à jour les informations d'un événement. Seuls les champs fournis seront modifiés. Seul le propriétaire de l'événement peut effectuer cette action.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| eventId | path | ID de l'événement à mettre à jour | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Événement mis à jour avec succès |
| 400 | Données invalides |
| 401 | Unauthorized |
| 403 | Accès refusé |
| 404 | Événement non trouvé |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/events/{eventId}/status

#### PATCH
##### Summary:

Mettre à jour le statut d'un événement

##### Description:

Permet de changer le statut d'un événement (ex: de DRAFT à PUBLISHED). Seul le propriétaire peut effectuer cette action.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| eventId | path | ID de l'événement | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Statut mis à jour |
| 400 | Statut invalide |
| 401 | Unauthorized |
| 403 | Accès refusé |
| 404 | Événement non trouvé |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/ticketing/tickets/{ticketId}

#### GET
##### Summary:

Obtenir les détails d'un billet

##### Description:

Récupère les détails d'un billet spécifique. L'utilisateur doit être le propriétaire du billet.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| ticketId | path |  | Yes | string (uuid) |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/ticketing/my-tickets

#### GET
##### Summary:

Obtenir mes billets

##### Description:

Récupère une liste de tous les billets achetés par l'utilisateur authentifié.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/team/structure/{structureId}

#### GET
##### Summary:

Récupérer les membres de l'équipe d'une structure

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/structure-types

#### GET
##### Summary:

Récupérer tous les types de structure disponibles

##### Description:

Retourne une liste de tous les types de structure que les lieux événementiels peuvent adopter.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Liste des types de structure récupérée avec succès. |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/statistics/structure/{structureId}/dashboard

#### GET
##### Summary:

Get structure dashboard statistics

##### Description:

Returns a consolidated object containing all KPIs and global charts for a structure's main dashboard.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path | ID of the structure | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Statistics retrieved successfully |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden - User is not authorized to access this structure's statistics |
| 404 | Structure not found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/statistics/event/{eventId}

#### GET
##### Summary:

Get event-specific statistics

##### Description:

Returns detailed charts and statistics for a single event.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| eventId | path | ID of the event | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Statistics retrieved successfully |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden - User is not authorized to access this event's statistics |
| 404 | Event not found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/friendship

#### GET
##### Summary:

Récupérer toutes les données d'amitié de l'utilisateur

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/events/{eventId}/friends

#### GET
##### Summary:

Récupérer les amis participant à un événement

##### Description:

Retourne la liste des amis de l'utilisateur connecté qui participent à l'événement spécifié. Nécessite une authentification.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| eventId | path | ID de l'événement | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Liste des amis participants |
| 400 | Bad Request |
| 401 | Non authentifié |
| 403 | Forbidden |
| 404 | Événement non trouvé |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/event-categories

#### GET
##### Summary:

Récupérer toutes les catégories d'événements disponibles

##### Description:

Accessible publiquement.

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Liste des catégories |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/auth/validate-email

#### GET
##### Summary:

Valider l'e-mail d'un utilisateur

##### Description:

Valide l'e-mail en utilisant le token reçu. En cas de succès, retourne un token JWT pour une connexion automatique.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| token | query |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/users/me/favorites/structures/{structureId}

#### DELETE
##### Summary:

Retirer une structure des favoris de l'utilisateur authentifié

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| structureId | path | ID de la structure à retirer des favoris | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/users/confirm-deletion

#### DELETE
##### Summary:

Confirmer la suppression du compte

##### Description:

Supprime définitivement le compte et les données associées en utilisant le token reçu par e-mail. Cette action est irréversible.

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| token | query |  | Yes | string |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### /api/v1/team/members/{memberId}

#### DELETE
##### Summary:

Supprimer un membre de l'équipe

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| memberId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |

### /api/v1/friendship/friends/{friendUserId}

#### DELETE
##### Summary:

Supprimer un ami

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| friendUserId | path |  | Yes | long |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

##### Security

| Security Schema | Scopes |
| --- | --- |
| bearerAuth | |
