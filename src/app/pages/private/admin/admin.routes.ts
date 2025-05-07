import {Routes} from '@angular/router';
import {AdminLayoutComponent} from './admin-layout/admin-layout.component';
import {EventsPanelComponent} from './panels/events/events-panel/events-panel.component';
import {DashboardComponent} from './panels/dashboard/dashboard.component';
import {StatsComponent} from './panels/stats/stats.component';
import {EventCreationComponent} from './panels/events/event-creation/event-creation.component';
import {ZoneManagementComponent} from './panels/structure/zone-management/zone-management.component';
import {StructurePanelComponent} from './panels/structure/structure-panel/structure-panel.component';
import {TeamManagementComponent} from './panels/structure/team-management/team-management.component';
import {StructureEditComponent} from './panels/structure/structure-edit/structure-edit.component';
import {EventCalendarComponent} from './panels/events/event-calendar/event-calendar.component';
import {EventDetailsPanelComponent} from './panels/events/event-details-panel/event-details-panel.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'events',
        component: EventsPanelComponent,
      },

      {
        path: 'events/create',
        component: EventCreationComponent,
      },
      {
        path: 'events/calendar',
        component: EventCalendarComponent
      },
      {
        path: 'event/details',
        component: EventDetailsPanelComponent,
      },
      {
        path: 'structure',
        component: StructurePanelComponent,
      },

      {
        path: 'structure/team-management',
        component: TeamManagementComponent,
      },
      {
        path: 'structure/edit',
        component: StructureEditComponent,
      },
      {
        path: 'structure/zone-management',
        component: ZoneManagementComponent,
      },
      {
        path: 'stats',
        component: StatsComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
