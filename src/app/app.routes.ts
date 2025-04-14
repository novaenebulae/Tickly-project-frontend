import { Routes } from '@angular/router';
import { LoginGuard } from './core/guards/login.guard';
import { adminRoutes } from './pages/admin/admin.routes';
import { AuthComponent } from './core/auth/auth.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [LoginGuard],
    children: adminRoutes,
  },
  {
    path: '**',
    component: AuthComponent,
  }
];
