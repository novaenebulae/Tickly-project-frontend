import { Routes } from '@angular/router';
import { LoginGuard } from './core/guards/login.guard';
import { AuthComponent } from './core/auth/auth.component';
import { adminRoutes } from './pages/private/admin/admin.routes';
import { userRoutes } from './pages/private/user/user.routes';
import { RegisterPageComponent } from './pages/public/register/register-page/register-page.component';
import { PublicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthComponent,
    canActivate: [PublicGuard],
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [PublicGuard],
  },
  {
    path: 'user',
    canActivate: [LoginGuard],
    children: userRoutes,
  },
  {
    path: 'admin',
    canActivate: [LoginGuard],
    children: adminRoutes,
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
