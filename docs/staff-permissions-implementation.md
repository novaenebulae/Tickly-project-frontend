# Staff Permissions Implementation

This document describes the implementation of role-based permissions for staff users in the Tickly Frontend application.

## Overview

The implementation follows the permissions described in the [roles-permissions-documentation.md](./roles-permissions-documentation.md) file. It includes:

1. Guards for different staff roles
2. Application of these guards to admin routes
3. Permission checks in services

## Guards

The following guards have been created to protect admin routes:

### StaffGuard

- **Purpose**: Allows access to users with any staff role (STRUCTURE_ADMINISTRATOR, ORGANIZATION_SERVICE, or RESERVATION_SERVICE)
- **Applied to**: The entire `/admin` path
- **File**: `src/app/core/guards/staff.guard.ts`

### StructureManagementGuard

- **Purpose**: Allows access only to users with the STRUCTURE_ADMINISTRATOR role
- **Applied to**: Structure management routes (`/admin/structure`, `/admin/structure/edit`, `/admin/structure/medias`)
- **File**: `src/app/core/guards/structure-management.guard.ts`

### TeamManagementGuard

- **Purpose**: Allows access only to users with the STRUCTURE_ADMINISTRATOR role
- **Applied to**: Team management route (`/admin/structure/team`)
- **File**: `src/app/core/guards/team-management.guard.ts`

### AreasReadGuard

- **Purpose**: Allows access to users with STRUCTURE_ADMINISTRATOR role (full access) or ORGANIZATION_SERVICE role (read-only)
- **Applied to**: Areas management route (`/admin/structure/areas`)
- **File**: `src/app/core/guards/areas-read.guard.ts`

### EventManagementGuard

- **Purpose**: Allows access to users with STRUCTURE_ADMINISTRATOR or ORGANIZATION_SERVICE roles
- **Applied to**: Event management routes (`/admin/events`, `/admin/events/create`, `/admin/events/calendar`, `/admin/event/details/:id`, `/admin/event/:id/edit`)
- **File**: `src/app/core/guards/event-management.guard.ts`

### TicketValidationGuard

- **Purpose**: Allows access to users with any staff role
- **Applied to**: Ticket validation routes (not yet implemented)
- **File**: `src/app/core/guards/ticket-validation.guard.ts`

## Route Configuration

The guards are applied to routes in the following files:

### app.routes.ts

The StaffGuard is applied to the entire `/admin` path, replacing the AdminGuard:

```typescript
{
  path: 'admin',
  loadChildren: () => import('./pages/private/admin/admin.routes').then(m => m.adminRoutes),
  canActivate: [LoginGuard, StaffGuard], // Both guards to ensure user is logged in and has a staff role
  title: 'Administration | Tickly'
}
```

### admin.routes.ts

Specific guards are applied to different routes within the admin area:

```typescript
// Event Management - Protected by EventManagementGuard
{
  path: 'events',
  component: EventsPanelComponent,
  canActivate: [EventManagementGuard],
  title: 'Gestion des événements | Administration'
},

// Structure Management - Protected by StructureManagementGuard
{
  path: 'structure',
  component: StructurePanelComponent,
  canActivate: [StructureManagementGuard],
  title: 'Gestion de la Structure | Administration'
},

// Team Management - Protected by TeamManagementGuard
{
  path: 'structure/team',
  component: TeamManagementComponent,
  canActivate: [TeamManagementGuard],
  title: 'Gestion de l\'équipe | Administration'
},

// Areas Management - Protected by AreasReadGuard
{
  path: 'structure/areas',
  component: AreasManagementComponent,
  canActivate: [AreasReadGuard],
  title: 'Gestion des zones | Administration'
}
```

## Implementation Details

Each guard follows a similar pattern:

1. Check if the user is logged in
2. Check if the user has the required role(s)
3. Check if the user has a structure associated with their account (or needs to set one up)
4. Allow or deny access based on these checks

The guards use the `AuthService` to get the current user's role and structure information, and the `NotificationService` to display error messages when access is denied.

## Future Enhancements

1. Add permission checks to service methods to ensure that users can only perform actions they are authorized to perform
2. Implement read-only mode for ORGANIZATION_SERVICE users in the AreasManagementComponent
3. Implement the ticket validation functionality with the TicketValidationGuard
