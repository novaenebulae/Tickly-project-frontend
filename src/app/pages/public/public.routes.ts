import {LandingPageComponent} from './landing-page/landing-page.component';
import {PublicLayoutComponent} from '../../shared/layout/public-layout/public-layout.component';
import {Routes} from '@angular/router';
import {RegisterPageComponent} from '../auth/register/register-page.component';
import {AllEventsPageComponent} from './events/all-events-page/all-events-page.component';
import {AllStructuresPageComponent} from './structures/all-structures-page/all-structures-page.component';
import {EventDetailsPageComponent} from './events/event-details-page/event-details-page.component';

export const publicRoutes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        component: LandingPageComponent,
      },
      {
        path: 'register',
        component: RegisterPageComponent,
      },
      {
        path: 'events/:id',
        component: EventDetailsPageComponent,
      },
      {
        path: 'events',
        component: AllEventsPageComponent
      },
      {
        path: 'structures',
        component: AllStructuresPageComponent
      },
      // {
      //   path: 'structures/:id',
      //   loadComponent: () => import('./pages/structures/structure-details-page/structure-details-page.component').then(m => m.StructureDetailsPageComponent)
      // },
      {
        path: '**',
        redirectTo: ''
      },
      {
        path: '',
        pathMatch: 'full',
        component: LandingPageComponent,
      },
    ],
  },
];
