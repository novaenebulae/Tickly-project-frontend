import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './panels/dashboard/dashboard.component';
import { StatsComponent } from './panels/stats/stats.component';

// Event management components
import { EventsPanelComponent } from './panels/events/events-panel/events-panel.component';
import { EventCalendarComponent } from './panels/events/event-calendar/event-calendar.component';
import { EventDetailsPanelComponent } from './panels/events/event-details-panel/event-details-panel.component';

// Structure management components
import { StructurePanelComponent } from './panels/structure/structure-panel/structure-panel.component';
import { StructureEditComponent } from './panels/structure/structure-edit/structure-edit.component';
import { TeamManagementComponent } from './panels/structure/team-management/team-management.component';
import { AreasManagementComponent } from './panels/structure/areas-management/areas-management.component';
import {EventFormComponent} from './panels/events/event-form/event-form.component';
import {StructureMediasComponent} from './panels/structure/structure-medias/structure-medias.component';

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

      // Dashboard & Stats
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Tableau de bord | Administration'
      },

      // Event Management
      {
        path: 'events',
        component: EventsPanelComponent,
        title: 'Gestion des événements | Administration'
      },
      {
        path: 'events/create',
        component: EventFormComponent,
        title: 'Créer un événement | Administration'
      },
      {
        path: 'events/calendar',
        component: EventCalendarComponent,
        title: 'Calendrier des événements | Administration'
      },
      {
        path: 'event/details/:id',
        component: EventDetailsPanelComponent,
        title: 'Détails d\'événement | Administration'
      },
      {
        path: 'event/:id/edit',
        component: EventFormComponent,
        title: 'Édition d\'un événement | Administration'
      },

      // Structure Management
      {
        path: 'structure',
        component: StructurePanelComponent,
        title: 'Gestion de la Structure | Administration'
      },
      {
        path: 'structure/edit',
        component: StructureEditComponent,
        title: 'Modifier la structure | Administration'
      },
      {
        path: 'structure/medias',
        component: StructureMediasComponent,
        title: 'Ajouter des photos à la structure | Administration'
      },
      {
        path: 'structure/team',
        component: TeamManagementComponent,
        title: 'Gestion de l\'équipe | Administration'
      },
      {
        path: 'structure/areas',
        component: AreasManagementComponent,
        title: 'Gestion des zones | Administration'
      }
    ]
  }
];
