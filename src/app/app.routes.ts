import {Routes} from '@angular/router';
import {LoginGuard} from './core/guards/login.guard';
import {PublicGuard} from './core/guards/public.guard';
import {AuthComponent} from './pages/auth/auth/auth.component';
import {RegisterPageComponent} from './pages/auth/register/register-page.component';
import {publicRoutes} from './pages/public/public.routes';
import {userRoutes} from './pages/private/user/user.routes';
import {adminRoutes} from './pages/private/admin/admin.routes';
import {MainLayoutComponent} from './shared/layout/main-layout/main-layout.component';
import {AdminGuard} from './core/guards/admin.guard';
import {StructureCreationComponent} from './pages/private/admin/structure-creation/structure-creation.component';

/**
 * Main application routes configuration
 *
 * The application is divided into three main areas:
 * - Public routes: Accessible to all users (home, events, etc.)
 * - User routes: For authenticated users (tickets, profile, etc.)
 * - Admin routes: For administrators (event management, etc.)
 */
export const routes: Routes = [
  // Authentication routes (accessible when not logged in)

  {
    path: 'login',
    component: AuthComponent,
    canActivate: [PublicGuard],
    title: 'Connexion | Tickly'
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [PublicGuard],
    title: 'Inscription | Tickly'
  },

  // User private area (requires authentication)
  {
    path: 'user',
    canActivate: [LoginGuard],
    children: userRoutes
  },
  {
    path: 'create-structure',
    loadComponent: () => import('./pages/private/admin/structure-creation/structure-creation.component')
      .then(m => m.StructureCreationComponent),
    canActivate: [LoginGuard], // Seul LoginGuard, PAS AdminGuard
    title: 'Créer une structure | Tickly'
  },

  // Admin private area (requires authentication)
  {
    path: 'admin',
    loadChildren: () => import('./pages/private/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [LoginGuard, AdminGuard], // AdminGuard ici
    title: 'Administration | Tickly'
  },


  // Public area (default)
  ...publicRoutes,

  // Fallback for unmatched routes
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
