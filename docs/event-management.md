Voici une analyse détaillée de l'API dédiée à la gestion d'événements par les utilisateurs Staff, incluant les endpoints, DTOs et modèles associés.

## 🎯 Vue d'ensemble de l'API

L'API de gestion d'événements est centralisée dans le contrôleur `EventController` et permet aux administrateurs de structures (`STRUCTURE_ADMINISTRATOR`) et aux services d'organisation (`ORGANIZATION_SERVICE`) de gérer complètement le cycle de vie des événements.

## 📋 Endpoints disponibles

### 1. **Création d'événement** - `POST /api/v1/events`
- **Sécurité** : Rôles requis `STRUCTURE_ADMINISTRATOR` ou `ORGANIZATION_SERVICE`
- **Validation** : Contrôle que l'utilisateur peut créer dans la structure spécifiée
- **Corps de requête** : `EventCreationDto`
- **Réponse** : `EventDetailResponseDto` (201 Created)

### 2. **Recherche et listage** - `GET /api/v1/events`
- **Accès** : Public
- **Paramètres** : `EventSearchParamsDto` + pagination
- **Réponse** : `PaginatedResponseDto<EventSummaryDto>`

### 3. **Détails d'un événement** - `GET /api/v1/events/{eventId}`
- **Accès** : Public
- **Réponse** : `EventDetailResponseDto`

### 4. **Amis participants** - `GET /api/v1/events/{eventId}/friends`
- **Sécurité** : Authentification requise
- **Réponse** : `List<FriendResponseDto>`

### 5. **Mise à jour d'événement** - `PUT /api/v1/events/{eventId}`
- **Sécurité** : Propriétaire uniquement
- **Corps de requête** : `EventUpdateDto`
- **Réponse** : `EventDetailResponseDto`

### 6. **Suppression d'événement** - `DELETE /api/v1/events/{eventId}`
- **Sécurité** : Propriétaire uniquement
- **Réponse** : 204 No Content

### 7. **Mise à jour du statut** - `PATCH /api/v1/events/{eventId}/status`
- **Sécurité** : Propriétaire uniquement
- **Corps de requête** : `EventStatusUpdateDto`
- **Réponse** : `EventDetailResponseDto`

### 8. **Gestion des photos**
- **Photo principale** - `POST /api/v1/events/{eventId}/main-photo`
- **Ajouter à la galerie** - `POST /api/v1/events/{eventId}/gallery`
- **Supprimer de la galerie** - `DELETE /api/v1/events/{eventId}/gallery`

### 9. **Catégories** - `GET /api/v1/event-categories`
- **Accès** : Public
- **Réponse** : `List<EventCategoryDto>`

## 📝 DTOs de requête (Input)

### `EventCreationDto`
DTO complet pour la création d'événements avec validation stricte :
- **Champs obligatoires** : nom, catégories, description complète, dates, adresse, structure, zones d'audience
- **Validations** : taille des textes, dates futures, au moins une catégorie et une zone d'audience
- **Configuration** : affichage homepage et événement vedette

### `EventUpdateDto`
Version flexible pour les mises à jour :
- **Tous les champs optionnels** sauf les zones d'audience et catégories
- **Remplace complètement** la configuration des zones d'audience
- **Même validation** que la création pour les champs fournis

### `EventStatusUpdateDto`
DTO simple pour changer le statut :
- **Seul champ** : `EventStatus status` (obligatoire)

### `EventSearchParamsDto`
Paramètres de recherche et filtrage :
- **Recherche textuelle** : nom, description, tags
- **Filtres** : catégories, dates, statut, structure, ville, homepage, featured
- **Support pagination** intégré

### `EventAudienceZoneConfigDto`
Configuration des zones d'audience :
- **Champs** : ID (pour mise à jour), templateId, capacité allouée
- **Validation** : capacité minimale de 1

## 📊 DTOs de réponse (Output)

### `EventDetailResponseDto`
Réponse complète avec toutes les informations :
- **Métadonnées** : ID, nom, statut, dates de création/modification
- **Contenu** : descriptions, tags, catégories
- **Localisation** : adresse, structure organisatrice
- **Médias** : photo principale, galerie d'images
- **Configuration** : zones d'audience, espaces physiques
- **Paramètres** : homepage, featured, statut

### `EventSummaryDto`
Version résumée pour les listes :
- **Informations essentielles** : nom, dates, ville, structure
- **Aperçu** : description courte, photo principale
- **État** : statut, gratuit, featured

### `EventAreaSummaryDto`
Résumé des espaces physiques :
- **Champs simples** : ID et nom de l'espace

### `EventAudienceZoneDto`
Détails des zones d'audience :
- **Configuration** : nom, capacité, type de placement
- **État** : active/inactive
- **Références** : ID de zone, template, espace physique

### `EventCategoryDto`
Catégorie d'événement :
- **Champs** : ID et nom

## 🔐 Modèle de sécurité

### Rôles autorisés
- **`STRUCTURE_ADMINISTRATOR`** : Administrateur de structure
- **`ORGANIZATION_SERVICE`** : Service d'organisation

### Contrôles d'accès
- **Création** : Vérification du droit de créer dans la structure cible
- **Modification/Suppression** : Seul le propriétaire (via sa structure) peut agir
- **Consultation** : Accès public aux événements publiés

### Service de sécurité
- **`@eventSecurityService.canCreateInStructure()`** : Validation création
- **`@eventSecurityService.isOwner()`** : Validation propriété

## 📈 Énumérations

### `EventStatus`
États du cycle de vie :
- **`DRAFT`** : Brouillon (non visible)
- **`PUBLISHED`** : Publié et visible
- **`PENDING_APPROVAL`** : En attente d'approbation
- **`CANCELLED`** : Annulé
- **`COMPLETED`** : Terminé
- **`ARCHIVED`** : Archivé

### `SeatingType`
Types de placement :
- **`SEATED`** : Places assises
- **`STANDING`** : Debout
- **`MIXED`** : Mixte ou non spécifié

## 🔄 Flux de travail typique

1. **Création** : `POST /events` avec `EventCreationDto`
2. **Mise à jour** : `PUT /events/{id}` avec `EventUpdateDto`
3. **Publication** : `PATCH /events/{id}/status` avec statut `PUBLISHED`
4. **Gestion médias** : Upload photos via endpoints dédiés
5. **Suivi** : Consultation via `GET /events/{id}`

