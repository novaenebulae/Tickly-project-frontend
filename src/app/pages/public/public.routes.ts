import {LandingPageComponent} from './landing-page/landing-page.component';
import {PublicLayoutComponent} from './public-layout/public-layout.component';
import {Routes} from '@angular/router';
import {RegisterPageComponent} from '../auth/register/register-page.component';
import {AllEventsPageComponent} from './all-events-page/all-events-page.component';

export const publicRoutes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'home',
        pathMatch: 'full',
        component: LandingPageComponent,
      },
      {
        path: 'register',
        component: RegisterPageComponent,
      },
      {
        path: 'events',
        component: AllEventsPageComponent
      },
      {
        path: '',
        pathMatch: 'full',
        component: LandingPageComponent,
      },
    ],
  },
];
