Je vais vous fournir une documentation complète de l'API de gestion d'événements basée sur l'analyse du contrôleur et des DTOs. Permettez-moi d'abord de rechercher les DTOs de réponse pour avoir une vue complète.# Event Management API Documentation

## Overview
The Event Management API provides comprehensive functionality for creating, managing, and searching events. This API supports event lifecycle management including creation, updates, status changes, and file uploads.

## Base URL
`/api/v1`

## Authentication
Most endpoints require authentication using Bearer tokens. Public endpoints are specifically marked.

---

## Endpoints

### 1. Create Event
**POST** `/events`

Creates a new event associated with a structure. Requires structure administrator or organization service role.

**Request Body**: `EventCreationDto`
**Response**: `EventDetailResponseDto` (201 Created)

**Security**: Requires authentication and appropriate role

---

### 2. Search Events
**GET** `/events`

Retrieves a paginated list of events with filtering and sorting options. Publicly accessible.

**Query Parameters**: Uses `EventSearchParamsDto` and `Pageable`
**Response**: `PaginatedResponseDto<EventSummaryDto>` (200 OK)

**Security**: Public access

---

### 3. Get Event by ID
**GET** `/events/{eventId}`

Retrieves detailed information about a specific event. Publicly accessible.

**Path Parameters**:
- `eventId` (Long): Event ID to retrieve

**Response**: `EventDetailResponseDto` (200 OK)

**Security**: Public access

---

### 4. Get Friends Attending Event
**GET** `/events/{eventId}/friends`

Returns list of authenticated user's friends attending the specified event.

**Path Parameters**:
- `eventId` (Long): Event ID

**Response**: `List<FriendResponseDto>` (200 OK)

**Security**: Requires authentication

---

### 5. Update Event
**PUT** `/events/{eventId}`

Updates event information. Only the event owner (via structure) can perform this action.

**Path Parameters**:
- `eventId` (Long): Event ID to update

**Request Body**: `EventUpdateDto`
**Response**: `EventDetailResponseDto` (200 OK)

**Security**: Requires authentication and ownership

---

### 6. Delete Event
**DELETE** `/events/{eventId}`

Deletes an event and all associated files. Irreversible operation.

**Path Parameters**:
- `eventId` (Long): Event ID to delete

**Response**: No content (204 No Content)

**Security**: Requires authentication and ownership

---

### 7. Update Event Status
**PATCH** `/events/{eventId}/status`

Changes event status (e.g., from DRAFT to PUBLISHED).

**Path Parameters**:
- `eventId` (Long): Event ID

**Request Body**: `EventStatusUpdateDto`
**Response**: `EventDetailResponseDto` (200 OK)

**Security**: Requires authentication and ownership

---

### 8. Upload Main Photo
**POST** `/events/{eventId}/main-photo`

Uploads or updates the main photo of an event.

**Path Parameters**:
- `eventId` (Long): Event ID

**Request**: Multipart form data with file
**Response**: `FileUploadResponseDto` (200 OK)

**Security**: Requires authentication and ownership

---

### 9. Add Gallery Image
**POST** `/events/{eventId}/gallery`

Adds a new image to the event gallery.

**Path Parameters**:
- `eventId` (Long): Event ID

**Request**: Multipart form data with file
**Response**: `FileUploadResponseDto` (200 OK)

**Security**: Requires authentication and ownership

---

### 10. Remove Gallery Image
**DELETE** `/events/{eventId}/gallery`

Removes a specific image from the event gallery.

**Path Parameters**:
- `eventId` (Long): Event ID

**Query Parameters**:
- `imagePath` (String): Path/name of image file to remove

**Response**: No content (204 No Content)

**Security**: Requires authentication and ownership

---

### 11. Get All Categories
**GET** `/event-categories`

Retrieves all available event categories. Publicly accessible.

**Response**: `List<EventCategoryDto>` (200 OK)

**Security**: Public access

---

## DTO Structures

### EventCreationDto
```json
{
  "name": "string (3-255 chars, required)",
  "categoryIds": ["array of Long (min 1, required)"],
  "shortDescription": "string (max 500 chars, optional)",
  "fullDescription": "string (required)",
  "tags": ["array of strings (optional)"],
  "startDate": "ZonedDateTime (ISO 8601 UTC, future, required)",
  "endDate": "ZonedDateTime (ISO 8601 UTC, required)",
  "address": "AddressDto (required)",
  "structureId": "Long (required)",
  "audienceZones": ["array of EventAudienceZoneConfigDto (required)"],
  "displayOnHomepage": "Boolean (required)",
  "isFeaturedEvent": "Boolean (required)"
}
```


### EventUpdateDto
```json
{
  "name": "string (3-255 chars, optional)",
  "categoryIds": ["array of Long (min 1, required)"],
  "shortDescription": "string (max 500 chars, optional)",
  "fullDescription": "string (optional)",
  "tags": ["array of strings (optional)"],
  "startDate": "ZonedDateTime (ISO 8601 UTC, future, optional)",
  "endDate": "ZonedDateTime (ISO 8601 UTC, optional)",
  "address": "AddressDto (optional)",
  "audienceZones": ["array of EventAudienceZoneConfigDto (min 1, required)"],
  "displayOnHomepage": "Boolean (optional)",
  "isFeaturedEvent": "Boolean (optional)"
}
```


### EventStatusUpdateDto
```json
{
  "status": "EventStatus (required)"
}
```


### EventDetailResponseDto
```json
{
  "id": "Long",
  "name": "string",
  "categories": ["array of EventCategoryDto"],
  "shortDescription": "string",
  "fullDescription": "string",
  "tags": ["array of strings"],
  "startDate": "ZonedDateTime",
  "endDate": "ZonedDateTime",
  "address": "AddressDto",
  "structure": "StructureSummaryDto",
  "mainPhotoUrl": "string",
  "eventPhotoUrls": ["array of strings"],
  "status": "EventStatus",
  "displayOnHomepage": "boolean",
  "isFeaturedEvent": "boolean",
  "createdAt": "ZonedDateTime",
  "updatedAt": "ZonedDateTime",
  "areas": ["array of EventAreaSummaryDto"],
  "audienceZones": ["array of EventAudienceZoneDto"]
}
```


### EventSearchParamsDto
```json
{
  "query": "string (optional)",
  "categoryIds": ["array of Long (optional)"],
  "startDateAfter": "ZonedDateTime (optional)",
  "startDateBefore": "ZonedDateTime (optional)", 
  "status": "EventStatus (optional)",
  "displayOnHomepage": "Boolean (optional)",
  "isFeatured": "Boolean (optional)",
  "structureId": "Long (optional)",
  "city": "string (optional)",
  "tags": ["array of strings (optional)"]
}
```


### EventAudienceZoneConfigDto
```json
{
  "id": "Long (optional, for updates)",
  "templateId": "Long (required)",
  "allocatedCapacity": "Integer (min 1, required)"
}
```


### EventAudienceZoneDto
```json
{
  "id": "Long (read-only)",
  "name": "string (required)",
  "allocatedCapacity": "Integer (min 0, required)",
  "seatingType": "SeatingType (required)",
  "isActive": "Boolean (required)",
  "areaId": "Long",
  "templateId": "Long"
}
```


### EventAreaSummaryDto
```json
{
  "id": "Long",
  "name": "string"
}
```


### EventCategoryDto
```json
{
  "id": "Long",
  "name": "string"
}
```


## Enums

### EventStatus
- `DRAFT`
- `PUBLISHED`
- `CANCELLED`
- `COMPLETED`

### SeatingType
- `SEATED`
- `STANDING`
- `MIXED`

## Error Responses
All endpoints may return standard HTTP error responses:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow the `ErrorResponseDto` structure.
