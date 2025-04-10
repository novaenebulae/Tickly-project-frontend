import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';
import { adminRoutes } from './pages/admin/admin.routes';
import { AuthComponent } from './core/auth/auth.component';

export const routes: Routes = [
  {
    path: '**',
    // canActivate: [LoginGuard],
    component: AuthComponent,
  },
  {
    path: 'admin',
    // canActivate: [AuthGuard],
    children: adminRoutes,
  }
];
