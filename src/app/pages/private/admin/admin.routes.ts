import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { EventsPanelComponent } from './panels/events/events-panel/events-panel.component';
import { DashboardComponent } from './panels/dashboard/dashboard.component';
import { StatsComponent } from './panels/stats/stats.component';
import { CalendarComponent } from './panels/events/calendar/calendar.component';
import { EventCreationComponent } from './panels/events/event-creation/event-creation.component';
import {ZoneManagementComponent} from './panels/structure/zone-management/zone-management.component';
import {StructurePanelComponent} from './panels/structure/structure-panel/structure-panel.component';
import {TeamManagementComponent} from './panels/structure/team-management/team-management.component';

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
        path: 'structure',
        component: StructurePanelComponent,
        children: [
          {
            path: 'team-management',
            component: TeamManagementComponent,
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
