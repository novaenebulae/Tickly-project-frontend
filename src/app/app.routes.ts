import { Routes } from '@angular/router';
import { LoginGuard } from './core/guards/login.guard';
import { AuthComponent } from './core/auth/auth.component';
import { RegisterPageComponent } from './pages/public/register/register-page/register-page.component';
import { adminRoutes } from './pages/private/admin/admin.routes';
import { userRoutes } from './pages/private/user/user.routes';

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
    path: 'user',
    canActivate: [LoginGuard],
    children: userRoutes,
  },
  {
    path: 'structure-admin',
    canActivate: [LoginGuard],
    children: adminRoutes,
  },
  {
    path: '**',
    component: RegisterPageComponent,
  },
];
