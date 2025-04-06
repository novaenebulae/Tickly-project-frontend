import { Routes } from '@angular/router';
import { adminRoutes } from './pages/admin/admin.routes';
import { AuthComponent } from './core/auth/auth.component';
import {
  redirectLoginIfAuthenticated,
  redirectLoginIfNotAuthenticated,
} from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    canActivate: [redirectLoginIfNotAuthenticated], // Protège toutes les autres routes
    children: [
      {
        path: 'admin',
        children: adminRoutes,
      },
    ],
  },
  {
    path: 'login',
    component: AuthComponent,
    canActivate: [redirectLoginIfAuthenticated], // Redirige vers /admin/dashboard si connecté
  },
];
