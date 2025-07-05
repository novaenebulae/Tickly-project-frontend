import {Routes} from '@angular/router';
import {AdminLayoutComponent} from '../../../shared/layout/admin-layout/admin-layout.component';
import {DashboardComponent} from './panels/dashboard/dashboard.component';

// Guards unifiés
// Event management components
import {EventsPanelComponent} from './panels/events/events-panel/events-panel.component';
import {EventCalendarComponent} from './panels/events/event-calendar/event-calendar.component';
import {EventDetailsPanelComponent} from './panels/events/event-details-panel/event-details-panel.component';

// Structure management components
import {StructurePanelComponent} from './panels/structure/structure-panel/structure-panel.component';
import {StructureEditComponent} from './panels/structure/structure-edit/structure-edit.component';
import {TeamManagementComponent} from './panels/structure/team-management/team-management.component';
import {AreasManagementComponent} from './panels/structure/areas-management/areas-management.component';
import {EventFormComponent} from './panels/events/event-form/event-form.component';
import {StructureMediasComponent} from './panels/structure/structure-medias/structure-medias.component';
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
    component: AdminLayoutComponent,
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
        component: DashboardComponent,
        canActivate: [StaffGuard],
        title: 'Tableau de bord | Administration'
      },

      // Event Management
      {
        path: 'events',
        component: EventsPanelComponent,
        canActivate: [EventExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Gestion des événements | Administration'
      },
      {
        path: 'events/create',
        component: EventFormComponent,
        canActivate: [EventManagementGuard], // 🔥 Seuls STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE
        title: 'Créer un événement | Administration'
      },
      {
        path: 'events/calendar',
        component: EventCalendarComponent,
        canActivate: [EventExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Calendrier des événements | Administration'
      },
      {
        path: 'event/details/:id',
        component: EventDetailsPanelComponent,
        canActivate: [EventExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Détails d\'événement | Administration'
      },
      {
        path: 'event/:id/edit',
        component: EventFormComponent,
        canActivate: [EventManagementGuard], // 🔥 Seuls STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE
        title: 'Édition d\'un événement | Administration'
      },

      // Structure Management
      {
        path: 'structure',
        component: StructurePanelComponent,
        canActivate: [StructureExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Gestion de la Structure | Administration'
      },
      {
        path: 'structure/edit',
        component: StructureEditComponent,
        canActivate: [StructureExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Modifier la structure | Administration'
      },
      {
        path: 'structure/medias',
        component: StructureMediasComponent,
        canActivate: [StructureExtendedAccessGuard],
        title: 'Ajouter des photos à la structure | Administration'
      },
      {
        path: 'structure/team',
        component: TeamManagementComponent,
        canActivate: [TeamManagementGuard], // 🔥 Seuls STRUCTURE_ADMINISTRATOR + ORGANIZATION_SERVICE
        title: 'Gestion de l\'équipe | Administration'
      },
      {
        path: 'structure/areas',
        component: AreasManagementComponent,
        canActivate: [AreasExtendedAccessGuard], // 🔥 RESERVATION_SERVICE peut voir en readonly
        title: 'Gestion des zones | Administration'
      }
    ]
  }
];
