import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { OrganisationComponent } from './panels/organisation/organisation.component';
import { EventsPanelComponent } from './panels/events/events-panel/events-panel.component';
import { DashboardComponent } from './panels/dashboard/dashboard.component';
import { StatsComponent } from './panels/stats/stats.component';
import { CalendarComponent } from './panels/events/calendar/calendar.component';
import { TeamComponent } from './panels/organisation/team/team.component';
import { EventCreationComponent } from './panels/events/event-creation/event-creation.component';
import { ZoneManagementComponent } from './panels/organisation/zone-management/zone-management.component';

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
        children: [
          {
            path: 'create',
            component: EventCreationComponent,
          },
          {
            path: 'calendar',
            component: CalendarComponent,
          },
        ],
      },
      {
        path: 'organisation',
        component: OrganisationComponent,
        children: [
          {
            path: 'team',
            component: TeamComponent,
          },
          {
            path: 'zone-management',
            component: ZoneManagementComponent,
          },
        ],
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
