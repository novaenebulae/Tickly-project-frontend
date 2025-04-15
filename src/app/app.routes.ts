import { Routes } from '@angular/router';
import { LoginGuard } from './core/guards/login.guard';
import { AuthComponent } from './core/auth/auth.component';
import { staffRoutes } from './pages/private/staff/staff.routes';
import { spectatorRoutes } from './pages/private/spectator/spectator.routes';
import { RegisterPageComponent } from './pages/public/register/register-page/register-page.component';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthComponent,
  },
  {
    path: 'register',
    component: RegisterPageComponent,
  },
  {
    path: 'staff',
    canActivate: [LoginGuard],
    children: staffRoutes,
  },
  {
    path: 'spectator',
    canActivate: [LoginGuard],
    children: spectatorRoutes,
  },
  {
    path: '**',
    component: RegisterPageComponent,
  },
];
