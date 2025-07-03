# Complete Event Management API Integration Guide

This comprehensive guide covers all event creation and update sequences with error handling, status management, and image uploads for frontend integration.

## 🔄 **Event Status Management Rules**

### **Status Transition Matrix**

| **From Status** | **To Status** | **Allowed** | **Notes** |
|----------------|---------------|-------------|-----------|
| `DRAFT` | `PUBLISHED` | ✅ | Standard workflow |
| `DRAFT` | `PENDING_APPROVAL` | ✅ | If approval workflow enabled |
| `DRAFT` | `CANCELLED` | ✅ | Cancel before publishing |
| `PUBLISHED` | `CANCELLED` | ✅ | Cancel published event |
| `PUBLISHED` | `COMPLETED` | ✅ | After event ends |
| `PENDING_APPROVAL` | `PUBLISHED` | ✅ | After approval |
| `PENDING_APPROVAL` | `CANCELLED` | ✅ | Reject approval |
| `CANCELLED` | Any | ❌ | Cannot reactivate |
| `COMPLETED` | `ARCHIVED` | ✅ | Archive old events |
| `ARCHIVED` | Any | ❌ | Cannot reactivate |

### **Field Modification Matrix by Status**

| **Field** | **DRAFT** | **PUBLISHED** | **CANCELLED** | **COMPLETED** | **ARCHIVED** |
|-----------|-----------|---------------|---------------|---------------|--------------|
| `name` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `categoryIds` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `shortDescription` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `fullDescription` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `tags` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `startDate` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `endDate` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `address` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `audienceZones` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `displayOnHomepage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `isFeaturedEvent` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Images** | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🎯 **SCENARIO 1: Complete Event Creation Flow**

### **Step 1: Fetch Prerequisites**

#### 1.1 Get Available Categories
```
GET /api/v1/event-categories
Authorization: Bearer {token}
```


**Response (200 OK):**
```json
[
  { "id": 1, "name": "Concert", "description": "Musical performances" },
  { "id": 2, "name": "Theater", "description": "Theatrical shows" },
  { "id": 3, "name": "Conference", "description": "Professional meetings" },
  { "id": 9, "name": "Dance", "description": "Dance performances" },
  { "id": 15, "name": "Sports", "description": "Sporting events" }
]
```


#### 1.2 Get Structure Details with Audience Zone Templates
```
GET /api/v1/structures/{structureId}
Authorization: Bearer {token}
```


**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Palais des Congrès de Metz",
  "type": { "id": 2, "name": "Convention Center" },
  "address": {
    "street": "2 Place de France",
    "city": "Metz",
    "zipCode": "57000",
    "country": "France"
  },
  "areas": [
    {
      "id": 10,
      "name": "Main Hall",
      "description": "Primary performance space",
      "audienceZoneTemplates": [
        {
          "id": 1,
          "name": "Orchestra Pit",
          "maxCapacity": 1000,
          "seatingType": "STANDING",
          "isActive": true,
          "description": "Standing area close to stage"
        },
        {
          "id": 2,
          "name": "Balcony",
          "maxCapacity": 500,
          "seatingType": "SEATED",
          "isActive": true,
          "description": "Upper level seating"
        },
        {
          "id": 3,
          "name": "VIP Section",
          "maxCapacity": 100,
          "seatingType": "SEATED",
          "isActive": true,
          "description": "Premium seating area"
        }
      ]
    },
    {
      "id": 11,
      "name": "Conference Room A",
      "description": "Secondary meeting space",
      "audienceZoneTemplates": [
        {
          "id": 4,
          "name": "Standard Seating",
          "maxCapacity": 200,
          "seatingType": "SEATED",
          "isActive": true,
          "description": "Regular conference seating"
        }
      ]
    }
  ]
}
```


### **Step 2: Create Event (DRAFT Status)**

```
POST /api/v1/events
Authorization: Bearer {token}
Content-Type: application/json
```


**EventCreationDto Payload:**
```json
{
  "name": "International Contemporary Dance Festival 2025",
  "categoryIds": [9, 2],
  "shortDescription": "Four exceptional days of contemporary dance featuring international companies from around the world.",
  "fullDescription": "The Movements Festival returns with an ambitious program mixing contemporary dance, performance, and digital arts. Join us for 8 international companies, 15 unique performances, and masterclasses open to the public. Discover innovative choreographies that push the boundaries of movement and artistic expression in this celebration of contemporary dance.",
  "tags": ["dance", "contemporary", "international", "festival", "performance"],
  "startDate": "2025-09-10T19:00:00.000Z",
  "endDate": "2025-09-13T23:30:00.000Z",
  "address": {
    "street": "3 Avenue Ney",
    "city": "Metz",
    "zipCode": "57000",
    "country": "France"
  },
  "structureId": 1,
  "audienceZones": [
    {
      "templateId": 1,
      "allocatedCapacity": 800
    },
    {
      "templateId": 2,
      "allocatedCapacity": 450
    },
    {
      "templateId": 3,
      "allocatedCapacity": 80
    }
  ],
  "displayOnHomepage": true,
  "isFeaturedEvent": false
}
```


**Response (201 Created):**
```json
{
  "id": 15,
  "name": "International Contemporary Dance Festival 2025",
  "status": "DRAFT",
  "categories": [
    { "id": 9, "name": "Dance" },
    { "id": 2, "name": "Theater" }
  ],
  "shortDescription": "Four exceptional days of contemporary dance featuring international companies from around the world.",
  "fullDescription": "The Movements Festival returns with an ambitious program mixing contemporary dance, performance, and digital arts. Join us for 8 international companies, 15 unique performances, and masterclasses open to the public. Discover innovative choreographies that push the boundaries of movement and artistic expression in this celebration of contemporary dance.",
  "tags": ["dance", "contemporary", "international", "festival", "performance"],
  "startDate": "2025-09-10T19:00:00Z",
  "endDate": "2025-09-13T23:30:00Z",
  "address": {
    "street": "3 Avenue Ney",
    "city": "Metz",
    "zipCode": "57000",
    "country": "France"
  },
  "audienceZones": [
    {
      "id": 25,
      "name": "Orchestra Pit",
      "allocatedCapacity": 800,
      "seatingType": "STANDING",
      "isActive": true,
      "templateId": 1,
      "areaId": 10
    },
    {
      "id": 26,
      "name": "Balcony", 
      "allocatedCapacity": 450,
      "seatingType": "SEATED",
      "isActive": true,
      "templateId": 2,
      "areaId": 10
    },
    {
      "id": 27,
      "name": "VIP Section",
      "allocatedCapacity": 80,
      "seatingType": "SEATED",
      "isActive": true,
      "templateId": 3,
      "areaId": 10
    }
  ],
  "structure": {
    "id": 1,
    "name": "Palais des Congrès de Metz"
  },
  "displayOnHomepage": true,
  "isFeaturedEvent": false,
  "mainPhotoUrl": null,
  "galleryUrls": [],
  "creator": {
    "id": 5,
    "firstName": "Alice",
    "lastName": "Martin"
  },
  "createdAt": "2025-07-03T10:30:00Z",
  "updatedAt": "2025-07-03T10:30:00Z"
}
```


### **Step 3: Upload Main Photo**

```
POST /api/v1/events/15/main-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary image file - festival_main_poster.jpg]
```


**Response (200 OK):**
```json
{
  "fileName": "festival_main_poster.jpg",
  "fileUrl": "https://storage.example.com/events/main/15_festival_main_poster_1688384400000.jpg",
  "message": "Photo principale mise à jour."
}
```


### **Step 4: Upload Multiple Gallery Images**

```
POST /api/v1/events/15/gallery
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [
  performance_1.jpg,
  performance_2.jpg,
  backstage_moments.jpg,
  venue_setup.jpg
]
```


**Response (200 OK):**
```json
[
  {
    "fileName": "performance_1.jpg",
    "fileUrl": "https://storage.example.com/events/gallery/15_performance_1_1688384500000.jpg",
    "message": "Image ajoutée à la galerie avec succès."
  },
  {
    "fileName": "performance_2.jpg",
    "fileUrl": "https://storage.example.com/events/gallery/15_performance_2_1688384600000.jpg",
    "message": "Image ajoutée à la galerie avec succès."
  },
  {
    "fileName": "backstage_moments.jpg",
    "fileUrl": "https://storage.example.com/events/gallery/15_backstage_moments_1688384700000.jpg",
    "message": "Image ajoutée à la galerie avec succès."
  },
  {
    "fileName": "venue_setup.jpg",
    "fileUrl": "https://storage.example.com/events/gallery/15_venue_setup_1688384800000.jpg",
    "message": "Image ajoutée à la galerie avec succès."
  }
]
```


### **Step 5: Publish Event**

```
PATCH /api/v1/events/15/status
Authorization: Bearer {token}
Content-Type: application/json
```


**EventStatusUpdateDto:**
```json
{
  "status": "PUBLISHED"
}
```


**Response (200 OK):**
```json
{
  "id": 15,
  "name": "International Contemporary Dance Festival 2025",
  "status": "PUBLISHED",
  "categories": [
    { "id": 9, "name": "Dance" },
    { "id": 2, "name": "Theater" }
  ],
  "shortDescription": "Four exceptional days of contemporary dance featuring international companies from around the world.",
  "fullDescription": "The Movements Festival returns with an ambitious program mixing contemporary dance, performance, and digital arts. Join us for 8 international companies, 15 unique performances, and masterclasses open to the public. Discover innovative choreographies that push the boundaries of movement and artistic expression in this celebration of contemporary dance.",
  "tags": ["dance", "contemporary", "international", "festival", "performance"],
  "startDate": "2025-09-10T19:00:00Z",
  "endDate": "2025-09-13T23:30:00Z",
  "audienceZones": [
    {
      "id": 25,
      "name": "Orchestra Pit",
      "allocatedCapacity": 800,
      "seatingType": "STANDING",
      "isActive": true,
      "templateId": 1,
      "areaId": 10
    },
    {
      "id": 26,
      "name": "Balcony",
      "allocatedCapacity": 450,
      "seatingType": "SEATED",
      "isActive": true,
      "templateId": 2,
      "areaId": 10
    },
    {
      "id": 27,
      "name": "VIP Section",
      "allocatedCapacity": 80,
      "seatingType": "SEATED",
      "isActive": true,
      "templateId": 3,
      "areaId": 10
    }
  ],
  "structure": {
    "id": 1,
    "name": "Palais des Congrès de Metz"
  },
  "mainPhotoUrl": "https://storage.example.com/events/main/15_festival_main_poster_1688384400000.jpg",
  "galleryUrls": [
    "https://storage.example.com/events/gallery/15_performance_1_1688384500000.jpg",
    "https://storage.example.com/events/gallery/15_performance_2_1688384600000.jpg",
    "https://storage.example.com/events/gallery/15_backstage_moments_1688384700000.jpg",
    "https://storage.example.com/events/gallery/15_venue_setup_1688384800000.jpg"
  ],
  "displayOnHomepage": true,
  "isFeaturedEvent": false,
  "creator": {
    "id": 5,
    "firstName": "Alice",
    "lastName": "Martin"
  },
  "createdAt": "2025-07-03T10:30:00Z",
  "updatedAt": "2025-07-03T10:45:00Z"
}
```


---

## 🔄 **SCENARIO 2: Event Update Management by Status**

### **Case A: DRAFT Event Update (Full Flexibility)**

#### Retrieve Current Event
```
GET /api/v1/events/16
Authorization: Bearer {token}
```


**Response (200 OK):**
```json
{
  "id": 16,
  "name": "Jazz Evening Under the Stars",
  "status": "DRAFT",
  "categories": [{ "id": 1, "name": "Concert" }],
  "shortDescription": "An intimate jazz performance in outdoor setting.",
  "fullDescription": "Join us for a magical evening of jazz music...",
  "tags": ["jazz", "outdoor", "intimate"],
  "startDate": "2025-08-15T20:00:00Z",
  "endDate": "2025-08-15T23:00:00Z",
  "audienceZones": [
    {
      "id": 28,
      "name": "Orchestra Pit",
      "allocatedCapacity": 500,
      "seatingType": "STANDING",
      "isActive": true,
      "templateId": 1,
      "areaId": 10
    }
  ],
  "mainPhotoUrl": null,
  "galleryUrls": []
}
```


#### Complete Update (All Fields Allowed)
```
PATCH /api/v1/events/16
Authorization: Bearer {token}
Content-Type: application/json
```


**EventUpdateDto:**
```json
{
  "name": "Jazz & Blues Festival - Summer Edition",
  "categoryIds": [1, 9],
  "shortDescription": "Two-day festival featuring jazz and blues artists from around the world.",
  "fullDescription": "Experience the magic of jazz and blues in this spectacular outdoor festival featuring international artists, local talents, and surprise collaborations. Food trucks, craft beverages, and a unique atmosphere await you.",
  "tags": ["jazz", "blues", "festival", "outdoor", "international"],
  "startDate": "2025-08-15T18:00:00Z",
  "endDate": "2025-08-16T23:30:00Z",
  "address": {
    "street": "Parc de la Seille",
    "city": "Metz",
    "zipCode": "57000",
    "country": "France"
  },
  "audienceZones": [
    {
      "id": 28,
      "templateId": 1,
      "allocatedCapacity": 800
    },
    {
      "templateId": 2,
      "allocatedCapacity": 400
    },
    {
      "templateId": 3,
      "allocatedCapacity": 100
    }
  ],
  "displayOnHomepage": true,
  "isFeaturedEvent": true
}
```


**Response (200 OK):**
```json
{
  "id": 16,
  "name": "Jazz & Blues Festival - Summer Edition",
  "status": "DRAFT",
  "categories": [
    { "id": 1, "name": "Concert" },
    { "id": 9, "name": "Dance" }
  ],
  "shortDescription": "Two-day festival featuring jazz and blues artists from around the world.",
  "fullDescription": "Experience the magic of jazz and blues in this spectacular outdoor festival featuring international artists, local talents, and surprise collaborations. Food trucks, craft beverages, and a unique atmosphere await you.",
  "tags": ["jazz", "blues", "festival", "outdoor", "international"],
  "startDate": "2025-08-15T18:00:00Z",
  "endDate": "2025-08-16T23:30:00Z",
  "address": {
    "street": "Parc de la Seille",
    "city": "Metz",
    "zipCode": "57000",
    "country": "France"
  },
  "audienceZones": [
    {
      "id": 28,
      "name": "Orchestra Pit",
      "allocatedCapacity": 800,
      "seatingType": "STANDING",
      "isActive": true,
      "templateId": 1,
      "areaId": 10
    },
    {
      "id": 29,
      "name": "Balcony",
      "allocatedCapacity": 400,
      "seatingType": "SEATED",
      "isActive": true,
      "templateId": 2,
      "areaId": 10
    },
    {
      "id": 30,
      "name": "VIP Section",
      "allocatedCapacity": 100,
      "seatingType": "SEATED",
      "isActive": true,
      "templateId": 3,
      "areaId": 10
    }
  ],
  "displayOnHomepage": true,
  "isFeaturedEvent": true,
  "updatedAt": "2025-07-03T11:15:00Z"
}
```


### **Case B: PUBLISHED Event Update (Limited Fields)**

#### Valid Update for Published Event
```
PATCH /api/v1/events/15
Authorization: Bearer {token}
Content-Type: application/json
```


**EventUpdateDto (Only allowed fields):**
```json
{
  "categoryIds": [9, 2, 3],
  "shortDescription": "UPDATED: Four exceptional days of contemporary dance and theater fusion featuring international companies.",
  "fullDescription": "UPDATED CONTENT: The Movements Festival returns with an even more ambitious program mixing contemporary dance, theater, and digital arts. This year features special collaborations between dance companies and theater groups, creating unique cross-disciplinary performances. Join us for 8 international companies, 15 unique performances, masterclasses, and exclusive workshops open to the public.",
  "tags": ["dance", "contemporary", "theater", "fusion", "international", "collaboration"],
  "displayOnHomepage": false,
  "isFeaturedEvent": true
}
```


**Response (200 OK):**
```json
{
  "id": 15,
  "name": "International Contemporary Dance Festival 2025",
  "status": "PUBLISHED",
  "categories": [
    { "id": 9, "name": "Dance" },
    { "id": 2, "name": "Theater" },
    { "id": 3, "name": "Conference" }
  ],
  "shortDescription": "UPDATED: Four exceptional days of contemporary dance and theater fusion featuring international companies.",
  "fullDescription": "UPDATED CONTENT: The Movements Festival returns with an even more ambitious program mixing contemporary dance, theater, and digital arts. This year features special collaborations between dance companies and theater groups, creating unique cross-disciplinary performances. Join us for 8 international companies, 15 unique performances, masterclasses, and exclusive workshops open to the public.",
  "tags": ["dance", "contemporary", "theater", "fusion", "international", "collaboration"],
  "displayOnHomepage": false,
  "isFeaturedEvent": true,
  "updatedAt": "2025-07-03T11:30:00Z"
}
```


#### Invalid Update Attempt (Restricted Fields)
```
PATCH /api/v1/events/15
Authorization: Bearer {token}
Content-Type: application/json
```


**EventUpdateDto (Contains restricted fields):**
```json
{
  "name": "UPDATED Festival Name - New Edition",
  "startDate": "2025-10-01T19:00:00Z",
  "shortDescription": "Valid description update",
  "audienceZones": [
    {
      "id": 25,
      "templateId": 1,
      "allocatedCapacity": 900
    }
  ]
}
```


**Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Modification restriction: This event is published. The following fields can no longer be modified: name, startDate, audienceZones. Only descriptions, categories, tags, gallery images and display options are modifiable.",
  "details": {
    "restrictedFields": ["name", "startDate", "audienceZones"],
    "allowedFields": ["categoryIds", "shortDescription", "fullDescription", "tags", "displayOnHomepage", "isFeaturedEvent"]
  },
  "path": "/api/v1/events/15",
  "timestamp": "2025-07-03T11:35:00Z"
}
```


---

## 🖼️ **SCENARIO 3: Advanced Image Management**

### **Update Main Photo**
```
POST /api/v1/events/15/main-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary image file - updated_main_poster.jpg]
```


**Response (200 OK):**
```json
{
  "fileName": "updated_main_poster.jpg",
  "fileUrl": "https://storage.example.com/events/main/15_updated_main_poster_1688385000000.jpg",
  "message": "Photo principale mise à jour."
}
```


### **Add Multiple Gallery Images**
```
POST /api/v1/events/15/gallery
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [
  rehearsal_session.jpg,
  artist_interview.jpg,
  crowd_reaction.jpg
]
```


**Response (200 OK):**
```json
[
  {
    "fileName": "rehearsal_session.jpg",
    "fileUrl": "https://storage.example.com/events/gallery/15_rehearsal_session_1688385100000.jpg",
    "message": "Image ajoutée à la galerie avec succès."
  },
  {
    "fileName": "artist_interview.jpg",
    "fileUrl": "https://storage.example.com/events/gallery/15_artist_interview_1688385200000.jpg",
    "message": "Image ajoutée à la galerie avec succès."
  },
  {
    "fileName": "crowd_reaction.jpg",
    "fileUrl": "https://storage.example.com/events/gallery/15_crowd_reaction_1688385300000.jpg",
    "message": "Image ajoutée à la galerie avec succès."
  }
]
```


### **Remove Specific Gallery Image**
```
DELETE /api/v1/events/15/gallery?imagePath=15_performance_1_1688384500000.jpg
Authorization: Bearer {token}
```


**Response (204 No Content)**

---

## ⚠️ **SCENARIO 4: Error Handling Examples**

### **Validation Errors**

#### Invalid Event Creation Data
```
POST /api/v1/events
Authorization: Bearer {token}
Content-Type: application/json
```


**Invalid EventCreationDto:**
```json
{
  "name": "AB",
  "categoryIds": [],
  "shortDescription": "This description is way too long and exceeds the maximum allowed length of 500 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "fullDescription": "",
  "startDate": "2023-01-01T10:00:00Z",
  "endDate": "2025-08-15T20:00:00Z",
  "audienceZones": []
}
```


**Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "Request validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Le nom doit contenir entre 3 et 255 caractères."
    },
    {
      "field": "categoryIds",
      "message": "Au moins une catégorie doit être sélectionnée."
    },
    {
      "field": "shortDescription",
      "message": "La description courte ne doit pas dépasser 500 caractères."
    },
    {
      "field": "fullDescription",
      "message": "La description complète est requise."
    },
    {
      "field": "startDate",
      "message": "La date de début doit être dans le futur."
    },
    {
      "field": "audienceZones",
      "message": "An event must have at least one audience zone."
    },
    {
      "field": "structureId",
      "message": "L'ID de la structure est requis."
    },
    {
      "field": "address",
      "message": "L'adresse de l'événement est requise."
    }
  ],
  "path": "/api/v1/events",
  "timestamp": "2025-07-03T12:00:00Z"
}
```


### **Business Logic Errors**

#### Invalid Audience Zone Template
```
POST /api/v1/events
Authorization: Bearer {token}
Content-Type: application/json
```


**EventCreationDto with invalid template:**
```json
{
  "name": "Test Event",
  "categoryIds": [1],
  "fullDescription": "Test description",
  "startDate": "2025-09-10T19:00:00Z",
  "endDate": "2025-09-10T22:00:00Z",
  "structureId": 1,
  "address": {
    "street": "Test Street",
    "city": "Test City",
    "zipCode": "12345",
    "country": "France"
  },
  "audienceZones": [
    {
      "templateId": 999,
      "allocatedCapacity": 100
    }
  ],
  "displayOnHomepage": false,
  "isFeaturedEvent": false
}
```


**Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "Business Logic Error",
  "message": "Audience zone template with ID 999 not found in structure 1",
  "path": "/api/v1/events",
  "timestamp": "2025-07-03T12:05:00Z"
}
```


#### Capacity Exceeds Template Maximum
```
POST /api/v1/events
Authorization: Bearer {token}
Content-Type: application/json
```


**EventCreationDto with exceeded capacity:**
```json
{
  "audienceZones": [
    {
      "templateId": 1,
      "allocatedCapacity": 1500
    }
  ]
}
```


**Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "Business Logic Error",
  "message": "Allocated capacity (1500) exceeds maximum capacity (1000) for template 'Orchestra Pit'",
  "details": {
    "templateId": 1,
    "templateName": "Orchestra Pit",
    "maxCapacity": 1000,
    "requestedCapacity": 1500
  },
  "path": "/api/v1/events",
  "timestamp": "2025-07-03T12:10:00Z"
}
```


### **Status Transition Errors**

#### Invalid Status Transition
```
PATCH /api/v1/events/15/status
Authorization: Bearer {token}
Content-Type: application/json
```


**Attempting to republish cancelled event:**
```json
{
  "status": "PUBLISHED"
}
```


**Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "Invalid Status Transition",
  "message": "Cannot transition from CANCELLED to PUBLISHED",
  "details": {
    "currentStatus": "CANCELLED",
    "requestedStatus": "PUBLISHED",
    "allowedTransitions": []
  },
  "path": "/api/v1/events/15/status",
  "timestamp": "2025-07-03T12:15:00Z"
}
```


### **File Upload Errors**

#### Invalid File Type
```
POST /api/v1/events/15/main-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary file - document.pdf]
```


**Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "Invalid File Type",
  "message": "Only image files (JPEG, PNG, WebP) are allowed",
  "details": {
    "allowedTypes": ["image/jpeg", "image/png", "image/webp"],
    "receivedType": "application/pdf"
  },
  "path": "/api/v1/events/15/main-photo",
  "timestamp": "2025-07-03T12:20:00Z"
}
```


#### File Size Exceeded
```
POST /api/v1/events/15/gallery
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [large_image_15mb.jpg]
```


**Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "File Size Exceeded",
  "message": "File size exceeds maximum allowed size of 10MB",
  "details": {
    "maxSize": "10MB",
    "fileSize": "15MB",
    "fileName": "large_image_15mb.jpg"
  },
  "path": "/api/v1/events/15/gallery",
  "timestamp": "2025-07-03T12:25:00Z"
}
```


---

## 📋 **Complete API Reference**

### **Core Event Management**

| **Operation** | **Method** | **Endpoint** | **DTO** | **Auth Required** |
|---------------|------------|--------------|---------|-------------------|
| Create event | `POST` | `/api/v1/events` | `EventCreationDto` | ✅ Owner/Admin |
| Get event details | `GET` | `/api/v1/events/{id}` | - | ❌ Public |
| Search events | `GET` | `/api/v1/events` | Query params | ❌ Public |
| Update event | `PATCH` | `/api/v1/events/{id}` | `EventUpdateDto` | ✅ Owner |
| Delete event | `DELETE` | `/api/v1/events/{id}` | - | ✅ Owner |

### **Status Management**

| **Operation** | **Method** | **Endpoint** | **DTO** | **Auth Required** |
|---------------|------------|--------------|---------|-------------------|
| Update status | `PATCH` | `/api/v1/events/{id}/status` | `EventStatusUpdateDto` | ✅ Owner |

### **Image Management**

| **Operation** | **Method** | **Endpoint** | **Content** | **Response** |
|---------------|------------|--------------|-------------|--------------|
| Upload main photo | `POST` | `/api/v1/events/{id}/main-photo` | `file: MultipartFile` | `FileUploadResponseDto` |
| Upload gallery images | `POST` | `/api/v1/events/{id}/gallery` | `files: MultipartFile[]` | `List<FileUploadResponseDto>` |
| Remove gallery image | `DELETE` | `/api/v1/events/{id}/gallery` | `imagePath: String` | `204 No Content` |

### **Utility Endpoints**

| **Operation** | **Method** | **Endpoint** | **Auth Required** |
|---------------|------------|--------------|-------------------|
| Get categories | `GET` | `/api/v1/event-categories` | ❌ Public |
| Get structure details | `GET` | `/api/v1/structures/{id}` | ❌ Public |
| Get friends attending | `GET` | `/api/v1/events/{id}/friends` | ✅ Authenticated |

---

## 🔐 **Security & Authorization**

- **Authentication**: Bearer token required for all modification operations
- **Authorization**: User must be owner or admin of the structure
- **Role Requirements**: `STRUCTURE_ADMINISTRATOR` or `ORGANIZATION_SERVICE`
- **Ownership Validation**: Automatically enforced via security service

## 📝 **Frontend Integration Notes**

1. **Status-aware UI**: Disable restricted fields based on current status
2. **Error Handling**: Implement comprehensive error message display
3. **Image Preview**: Support multiple file selection for gallery uploads
4. **Validation**: Client-side validation should mirror server-side rules
5. **Progress Indication**: Show upload progress for image operations
6. **Confirmation Dialogs**: Implement for destructive operations (delete, cancel)

This complete guide provides all necessary information for robust frontend integration with proper error handling and user experience considerations.
