# 📚 Documentation API - Gestion d'Équipe

## Vue d'ensemble

L'API de gestion d'équipe permet aux administrateurs de structure de gérer les membres de leur équipe, incluant les invitations, la modification des rôles et la suppression de membres.

**Base URL :** `/api/v1/team`
**Authentification :** Requise (Bearer Token)

---

## 🔐 Sécurité et Autorisations

- **Authentification obligatoire** pour tous les endpoints
- **Administrateur de structure** requis pour la plupart des opérations
- **Validation par token** pour l'acceptation d'invitations

---

## 📋 Endpoints

### 1. Récupérer les Membres de l'Équipe

```
GET /api/v1/team/structure/{structureId}
```


**Description :** Récupère la liste complète des membres de l'équipe d'une structure donnée.

**Paramètres :**
- `structureId` (path) : ID de la structure (Long, requis)

**Autorisation :** Administrateur de la structure

**Réponse :**
```
HTTP/1.1 200 OK
Content-Type: application/json
```


```json
[
  {
    "id": 1,
    "userId": 123,
    "firstName": "Alice",
    "lastName": "Martin",
    "email": "alice.martin@example.com",
    "avatarUrl": "https://api.tickly.app/files/avatars/avatar_123.png",
    "role": "STRUCTURE_ADMINISTRATOR",
    "status": "ACTIVE",
    "joinedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "userId": null,
    "firstName": null,
    "lastName": null,
    "email": "nouveau.membre@example.com",
    "avatarUrl": null,
    "role": "ORGANIZATION_SERVICE",
    "status": "PENDING_INVITATION",
    "joinedAt": null
  }
]
```


---

### 2. Inviter un Nouveau Membre

```
POST /api/v1/team/structure/{structureId}/invite
```


**Description :** Envoie une invitation par email à une personne pour rejoindre l'équipe de la structure.

**Paramètres :**
- `structureId` (path) : ID de la structure (Long, requis)

**Autorisation :** Administrateur de la structure

**Corps de la requête :**
```json
{
  "email": "nouveau.membre@example.com",
  "role": "ORGANIZATION_SERVICE"
}
```


**Réponse :**
```
HTTP/1.1 201 Created
```


**Erreurs possibles :**
- `400 Bad Request` : Email invalide ou rôle non autorisé
- `409 Conflict` : La personne est déjà membre de l'équipe

---

### 3. Accepter une Invitation

```
POST /api/v1/team/invitations/accept?token={invitationToken}
```


**Description :** Permet à un utilisateur authentifié d'accepter une invitation à rejoindre une équipe.

**Paramètres :**
- `token` (query) : Token d'invitation reçu par email (String, requis)

**Autorisation :** Utilisateur authentifié

**Corps de la requête :** Aucun

**Réponse :**
```
HTTP/1.1 200 OK
```


**Erreurs possibles :**
- `400 Bad Request` : Token invalide ou expiré
- `409 Conflict` : L'utilisateur a déjà un rôle incompatible

---

### 4. Mettre à Jour le Rôle d'un Membre

```
PUT /api/v1/team/members/{memberId}/role
```


**Description :** Modifie le rôle d'un membre existant de l'équipe.

**Paramètres :**
- `memberId` (path) : ID du membre à modifier (Long, requis)

**Autorisation :** Administrateur de l'équipe du membre

**Corps de la requête :**
```json
{
  "role": "RESERVATION_SERVICE"
}
```


**Réponse :**
```
HTTP/1.1 200 OK
Content-Type: application/json
```


```json
{
  "id": 2,
  "userId": 456,
  "firstName": "Baptiste",
  "lastName": "Dubois",
  "email": "baptiste.dubois@example.com",
  "avatarUrl": "https://api.tickly.app/files/avatars/avatar_456.png",
  "role": "RESERVATION_SERVICE",
  "status": "ACTIVE",
  "joinedAt": "2024-02-01T14:20:00Z"
}
```


**Erreurs possibles :**
- `400 Bad Request` : Rôle invalide
- `404 Not Found` : Membre introuvable

---

### 5. Supprimer un Membre de l'Équipe

```
DELETE /api/v1/team/members/{memberId}
```


**Description :** Retire un membre de l'équipe. Le membre redevient automatiquement un utilisateur `SPECTATOR`.

**Paramètres :**
- `memberId` (path) : ID du membre à supprimer (Long, requis)

**Autorisation :** Administrateur de l'équipe du membre

**Corps de la requête :** Aucun

**Réponse :**
```
HTTP/1.1 204 No Content
```


**Erreurs possibles :**
- `404 Not Found` : Membre introuvable
- `409 Conflict` : Impossible de supprimer le dernier administrateur

---

## 📝 DTOs de Données

### InviteMemberRequestDto

```json
{
  "email": "string",     // Email valide (requis)
  "role": "UserRole"     // Rôle à assigner (requis)
}
```


**Rôles autorisés :**
- `STRUCTURE_ADMINISTRATOR`
- `ORGANIZATION_SERVICE`
- `RESERVATION_SERVICE`

### TeamMemberDto

```json
{
  "id": "number",              // ID du membre
  "userId": "number|null",     // ID utilisateur (null si invitation en attente)
  "firstName": "string|null",  // Prénom
  "lastName": "string|null",   // Nom
  "email": "string",           // Email
  "avatarUrl": "string|null",  // URL de l'avatar
  "role": "UserRole",          // Rôle dans l'équipe
  "status": "TeamMemberStatus", // Statut du membre
  "joinedAt": "string|null"    // Date d'adhésion (ISO 8601)
}
```


**Statuts possibles :**
- `PENDING_INVITATION` : Invitation en attente
- `ACTIVE` : Membre actif
- `INACTIVE` : Membre désactivé

### UpdateMemberRoleDto

```json
{
  "role": "UserRole"     // Nouveau rôle (requis)
}
```


---

## 🚨 Codes d'Erreur Communs

| Code | Description |
|------|-------------|
| `400` | Données de requête invalides |
| `401` | Authentification requise |
| `403` | Permissions insuffisantes |
| `404` | Ressource introuvable |
| `409` | Conflit (ex: membre déjà présent) |
| `500` | Erreur serveur interne |

---

## 💡 Cas d'Usage

### Scénario 1 : Inviter un nouveau membre
1. `POST /team/structure/1/invite` avec email et rôle
2. Le système envoie un email d'invitation
3. Le destinataire clique sur le lien et fait `POST /team/invitations/accept?token=...`
4. Le membre apparaît dans l'équipe avec le statut `ACTIVE`

### Scénario 2 : Promouvoir un membre
1. `PUT /team/members/5/role` avec `{"role": "STRUCTURE_ADMINISTRATOR"}`
2. Le membre obtient les permissions d'administrateur
3. L'ancien admin peut maintenant se rétrograder ou quitter l'équipe

### Scénario 3 : Gestion de la passation de pouvoir
1. Admin actuel invite un nouveau membre avec rôle `STRUCTURE_ADMINISTRATOR`
2. Le nouveau membre accepte l'invitation
3. L'ancien admin supprime son propre compte via `DELETE /team/members/{sonId}`
4. Il redevient automatiquement `SPECTATOR`

---

## 🔄 Workflow d'Invitation

```
graph TD
    A[Admin invite un membre] --> B[Email d'invitation envoyé]
    B --> C[Destinataire reçoit le lien]
    C --> D[Clic sur le lien + authentification]
    D --> E[POST /invitations/accept]
    E --> F[Membre ajouté à l'équipe]
    F --> G[Statut: ACTIVE]
```


