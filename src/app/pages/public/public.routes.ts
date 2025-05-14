import {LandingPageComponent} from './landing-page/landing-page.component';
import {PublicLayoutComponent} from './public-layout/public-layout.component';
import {Routes} from '@angular/router';
import {RegisterPageComponent} from '../auth/register/register-page.component';

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
      // {
      //   path: 'structures',
      // },
      {
        path: '',
        pathMatch: 'full',
        component: LandingPageComponent,
      },
    ],
  },
];
