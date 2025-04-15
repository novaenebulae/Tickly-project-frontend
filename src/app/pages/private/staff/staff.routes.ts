import { Routes } from '@angular/router';
import { StaffLayoutComponent } from './staff-layout/staff-layout.component';
import { OrganisationComponent } from './panels/organisation/organisation.component';
import { EventsComponent } from './panels/events/events.component';
import { DashboardComponent } from './panels/dashboard/dashboard.component';
import { StatsComponent } from './panels/stats/stats.component';
import { CalendarComponent } from './panels/events/calendar/calendar.component';
import { TeamComponent } from './panels/organisation/team/team.component';
import { AreasComponent } from './panels/organisation/areas/areas.component';

export const staffRoutes: Routes = [
  {
    path: '',
    component: StaffLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'events',
        component: EventsComponent,
        children: [
          {
            path: 'create',
            component: EventsComponent,
          },
          {
            path: 'calendar',
            component: CalendarComponent,
          },
        ]
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
            path: 'areas',
            component: AreasComponent,
          },
        ]
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
