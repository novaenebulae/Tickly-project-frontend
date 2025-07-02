# Analyse complète des permissions par rôle Staff User

Voici une analyse détaillée des permissions accordées à chaque rôle de Staff User dans l'application, basée sur les contrôleurs fournis.

## 🎭 Rôles Staff Users identifiés

D'après l'énumération `UserRole`, les rôles Staff sont :
- **`STRUCTURE_ADMINISTRATOR`** : Administrateur de structure
- **`ORGANIZATION_SERVICE`** : Service d'organisation d'événements
- **`RESERVATION_SERVICE`** : Service de réservation/validation

## 🏢 STRUCTURE_ADMINISTRATOR - Administrateur de Structure

### 📋 Permissions sur les **Événements** (EventController)
- ✅ **Créer un événement** - `POST /events`
  - Condition : Doit pouvoir créer dans la structure cible
- ✅ **Modifier un événement** - `PUT /events/{id}`
  - Condition : Doit être propriétaire de l'événement
- ✅ **Supprimer un événement** - `DELETE /events/{id}`
  - Condition : Propriétaire uniquement
- ✅ **Modifier le statut** - `PATCH /events/{id}/status`
  - Condition : Propriétaire uniquement
- ✅ **Gestion des médias** (photos)
  - Upload photo principale, ajout/suppression galerie
  - Condition : Propriétaire uniquement

### 🏗️ Permissions sur les **Structures** (StructureController)
- ✅ **Créer sa structure** - `POST /structures`
  - Condition : `needsStructureSetup == true`
- ✅ **Modifier sa structure** - `PATCH /structures/{id}`
  - Condition : Être propriétaire
- ✅ **Supprimer sa structure** - `DELETE /structures/{id}`
  - Condition : Être propriétaire
- ✅ **Gestion complète des fichiers**
  - Logo, couverture, galerie d'images
- ✅ **Gestion des espaces (Areas)**
  - CRUD complet sur les espaces de sa structure
- ✅ **Gestion des modèles de zones**
  - CRUD complet sur les templates de zones d'audience

### 👥 Permissions sur les **Équipes** (TeamController)
- ✅ **Consulter les membres** - `GET /team/structure/{id}`
  - Condition : Être admin de la structure
- ✅ **Inviter des membres** - `POST /team/structure/{id}/invite`
  - Condition : Être admin de la structure
- ✅ **Modifier les rôles** - `PUT /team/members/{id}/role`
  - Condition : Être admin de l'équipe du membre
- ✅ **Supprimer des membres** - `DELETE /team/members/{id}`
  - Condition : Être admin de l'équipe du membre

### 🎫 Permissions sur les **Billets** (TicketController)
- ✅ **Valider des billets** - `POST /tickets/validate`
  - Validation des QR codes pour les événements de sa structure

## 🎯 ORGANIZATION_SERVICE - Service d'Organisation

### 📋 Permissions sur les **Événements** (EventController)
- ✅ **Créer un événement** - `POST /events`
  - Condition : Doit pouvoir créer dans la structure cible
- ✅ **Modifier un événement** - `PUT /events/{id}`
  - Condition : Doit être propriétaire de l'événement
- ✅ **Supprimer un événement** - `DELETE /events/{id}`
  - Condition : Propriétaire uniquement
- ✅ **Modifier le statut** - `PATCH /events/{id}/status`
  - Condition : Propriétaire uniquement
- ✅ **Gestion des médias** (photos)
  - Upload et gestion complète des images d'événements

### 🏗️ Permissions sur les **Structures** (StructureController)
- ✅ **Consulter les espaces** - `GET /structures/{id}/areas`
  - Accès en lecture aux espaces de toutes les structures
- ✅ **Consulter un espace** - `GET /structures/{id}/areas/{areaId}`
  - Détails des espaces pour l'organisation d'événements
- ✅ **Consulter les templates** - `GET /structures/{id}/areas/{areaId}/audience-zone-templates`
  - Accès aux modèles de zones pour configuration d'événements
- ❌ **Modification des structures** : Pas d'autorisation

### 👥 Permissions sur les **Équipes** (TeamController)
- ❌ **Gestion d'équipe** : Pas d'autorisation directe

### 🎫 Permissions sur les **Billets** (TicketController)
- ✅ **Valider des billets** - `POST /tickets/validate`
  - Validation des QR codes pour tous les événements

## 🎫 RESERVATION_SERVICE - Service de Réservation

### 📋 Permissions sur les **Événements** (EventController)
- ❌ **Gestion d'événements** : Pas d'autorisation

### 🏗️ Permissions sur les **Structures** (StructureController)
- ❌ **Gestion de structures** : Pas d'autorisation

### 👥 Permissions sur les **Équipes** (TeamController)
- ❌ **Gestion d'équipe** : Pas d'autorisation

### 🎫 Permissions sur les **Billets** (TicketController)
- ✅ **Valider des billets** - `POST /tickets/validate`
  - Validation des QR codes (rôle principal)

## 📊 Matrice des permissions

| Fonctionnalité | STRUCTURE_ADMIN | ORGANIZATION_SERVICE | RESERVATION_SERVICE |
|---|:---:|:---:|:---:|
| **Gestion événements** | ✅ (Sa structure) | ✅ (Toutes structures) | ❌ |
| **Gestion structures** | ✅ (Sa structure) | 👁️ (Lecture seule) | ❌ |
| **Gestion équipes** | ✅ (Son équipe) | ❌ | ❌ |
| **Validation billets** | ✅ (Ses événements) | ✅ (Tous événements) | ✅ (Tous événements) |

## 🔐 Services de sécurité utilisés

Les contrôleurs utilisent plusieurs services de sécurité spécialisés :

- **`@eventSecurityService`** : Validation des droits sur les événements
- **`@structureSecurityService`** : Validation des droits sur les structures
- **`@teamSecurityService`** : Validation des droits sur les équipes
- **`@ticketSecurityService`** : Validation des droits sur les billets

## 🎯 Logique de permissions

### Hiérarchie des permissions
1. **STRUCTURE_ADMINISTRATOR** : Contrôle total sur sa structure et ses événements
2. **ORGANIZATION_SERVICE** : Création et gestion d'événements, lecture des structures
3. **RESERVATION_SERVICE** : Validation de billets uniquement

### Contraintes contextuelles
- **Propriété** : Beaucoup d'actions nécessitent d'être propriétaire de la ressource
- **Structure** : Les droits sont souvent limités à la structure de rattachement
- **Événement** : La gestion est liée à la propriété via la structure organisatrice

Cette architecture offre une séparation claire des responsabilités tout en maintenant une sécurité granulaire basée sur le contexte et la propriété des ressources.
