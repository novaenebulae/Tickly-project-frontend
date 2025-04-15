import { Routes } from '@angular/router';
import { LoginGuard } from './core/guards/login.guard';
import { adminRoutes } from './pages/admin/admin.routes';
import { spectatorRoutes } from './pages/spectator/spectator.routes';
import { AuthComponent } from './core/auth/auth.component';

export const routes: Routes = [
  {
    path: 'staff',
    canActivate: [LoginGuard],
    children: adminRoutes,
  },
  {
    path: 'spectator',
    canActivate: [LoginGuard],
    children: spectatorRoutes,
  },
  {
    path: '**',
    component: AuthComponent,
  },
];
