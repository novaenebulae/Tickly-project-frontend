# Event Management Implementation

This document describes the implementation of the Event Management functionality in the Tickly Frontend application.

## Overview

The Event Management functionality allows users with appropriate roles (STRUCTURE_ADMINISTRATOR or ORGANIZATION_SERVICE) to create, update, delete, and manage events. The implementation includes:

1. Role-based permissions for event management
2. Event details modal for viewing and managing events
3. Permission checks in services to ensure only authorized users can perform certain operations

## Components and Services

### Guards

- **EventManagementGuard**: Protects event management routes, allowing access only to users with STRUCTURE_ADMINISTRATOR or ORGANIZATION_SERVICE roles.

### Services

- **EventService**: Updated to include permission checks for event management operations.
- **EventDetailsModalService**: Service for opening the event details modal from any component.

### Components

- **EventDetailsModalComponent**: Modal component for displaying event details and providing actions based on user permissions.

## Role-Based Permissions

The implementation follows the API guidelines for role-based permissions:

- Only users with STRUCTURE_ADMINISTRATOR or ORGANIZATION_SERVICE roles can access event management functionality.
- Users can only manage events that belong to their structure.
- Permission checks are implemented at both the route level (using guards) and the service level.

## Permission Checks

Permission checks are implemented in the following methods of the EventService:

- `hasEventManagementPermission()`: Checks if the current user has permission to manage events.
- `canEditEvent(event)`: Checks if the current user can edit a specific event.
- `createEvent(eventData)`: Checks permissions before creating an event.
- `updateEvent(eventId, eventUpdateData)`: Checks permissions before updating an event.
- `deleteEvent(eventId)`: Checks permissions before deleting an event.
- `updateEventStatus(eventId, status)`: Checks permissions before updating an event's status.

## Event Details Modal

The Event Details Modal provides a user-friendly interface for viewing and managing event details. It includes:

- Tabs for different sections of information (general info, audience zones, photo gallery)
- Permission-based actions (publish, cancel, edit)
- Styling for a clean and user-friendly interface

## Usage

### Opening the Event Details Modal

```typescript
import { EventDetailsModalService } from '@app/shared/domain/admin/event-details-modal';

@Component({
  // ...
})
export class YourComponent {
  constructor(private eventDetailsModal: EventDetailsModalService) {}

  openEventDetails(eventId: number): void {
    this.eventDetailsModal.openEventDetailsModal(eventId);
  }
}
```

### Protecting Routes with EventManagementGuard

```typescript
const routes: Routes = [
  {
    path: 'events',
    component: EventsPanelComponent,
    canActivate: [EventManagementGuard],
    title: 'Gestion des événements | Administration'
  }
];
```

## Conclusion

The Event Management functionality is now fully implemented according to the requirements. It provides a secure and user-friendly interface for managing events, with appropriate permission checks to ensure only authorized users can perform certain operations.
