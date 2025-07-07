import {Routes} from '@angular/router';
import {
  AreasExtendedAccessGuard,
  EventExtendedAccessGuard,
  EventManagementGuard,
  StaffGuard,
  StructureExtendedAccessGuard,
  TeamManagementGuard
} from '../../../core/guards/staff.guards';

/**
 * Admin area routes configuration
 *
 * All routes are accessible under the /admin/* path
 * and require admin authentication (via LoginGuard in app.routes.ts)
 *
 * Routes are organized by functional areas:
 * - Dashboard & Stats
 * - Event management
 * - Structure management
 *
 * Guards utilisés :
 * - EventManagementGuard: STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE (readonly)
 * - EventExtendedAccessGuard: + RESERVATION_SERVICE (readonly)
 * - StructureManagementGuard: STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE (readonly)
 * - StructureExtendedAccessGuard: + RESERVATION_SERVICE (readonly)
 * - TeamManagementGuard: STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE (readonly)
 * - AreasAccessGuard: STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE (readonly)
 * - StaffGuard: Tous les rôles de staff
 */
export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../../shared/layout/admin-layout/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    children: [
      // Default route redirects to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // Dashboard & Stats - Accessible à tous les rôles de staff
      {
        path: 'dashboard',
        loadComponent: () => import('./panels/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        canActivate: [StaffGuard],
        title: 'Tableau de bord | Administration'
      },

      // Event Management
      {
        path: 'events',
        loadComponent: () => import('./panels/events/events-panel/events-panel.component')
          .then(m => m.EventsPanelComponent),
        canActivate: [EventExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Gestion des événements | Administration'
      },
      {
        path: 'events/create',
        loadComponent: () => import('./panels/events/event-form/event-form.component')
          .then(m => m.EventFormComponent),
        canActivate: [EventManagementGuard], // 🔥 Seuls STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE
        title: 'Créer un événement | Administration'
      },
      {
        path: 'events/calendar',
        loadComponent: () => import('./panels/events/event-calendar/event-calendar.component')
          .then(m => m.EventCalendarComponent),
        canActivate: [EventExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Calendrier des événements | Administration'
      },
      {
        path: 'event/details/:id',
        loadComponent: () => import('./panels/events/event-details-panel/event-details-panel.component')
          .then(m => m.EventDetailsPanelComponent),
        canActivate: [EventExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Détails d\'événement | Administration'
      },
      {
        path: 'event/:id/edit',
        loadComponent: () => import('./panels/events/event-form/event-form.component')
          .then(m => m.EventFormComponent),
        canActivate: [EventManagementGuard], // 🔥 Seuls STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE
        title: 'Édition d\'un événement | Administration'
      },

      // Structure Management
      {
        path: 'structure',
        loadComponent: () => import('./panels/structure/structure-panel/structure-panel.component')
          .then(m => m.StructurePanelComponent),
        canActivate: [StructureExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Gestion de la Structure | Administration'
      },
      {
        path: 'structure/edit',
        loadComponent: () => import('./panels/structure/structure-edit/structure-edit.component')
          .then(m => m.StructureEditComponent),
        canActivate: [StructureExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Modifier la structure | Administration'
      },
      {
        path: 'structure/medias',
        loadComponent: () => import('./panels/structure/structure-medias/structure-medias.component')
          .then(m => m.StructureMediasComponent),
        canActivate: [StructureExtendedAccessGuard],
        title: 'Ajouter des photos à la structure | Administration'
      },
      {
        path: 'structure/team',
        loadComponent: () => import('./panels/structure/team-management/team-management.component')
          .then(m => m.TeamManagementComponent),
        canActivate: [TeamManagementGuard], // 🔥 Seuls STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE
        title: 'Gestion de l\'équipe | Administration'
      },
      {
        path: 'structure/areas',
        loadComponent: () => import('./panels/structure/areas-management/areas-management.component')
          .then(m => m.AreasManagementComponent),
        canActivate: [AreasExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Gestion des zones | Administration'
      }
    ]
  }
];
