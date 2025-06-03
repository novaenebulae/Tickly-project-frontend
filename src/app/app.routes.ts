import { Routes } from '@angular/router';
import { LoginGuard } from './core/guards/login.guard';
import { PublicGuard } from './core/guards/public.guard';
import { AuthComponent } from './pages/auth/auth/auth.component';
import { RegisterPageComponent } from './pages/auth/register/register-page.component';
import { publicRoutes } from './pages/public/public.routes';
import { userRoutes } from './pages/private/user/user.routes';
import { adminRoutes } from './pages/private/admin/admin.routes';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';
import {AdminGuard} from './core/guards/admin.guard';

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

  // Admin private area (requires authentication)
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: adminRoutes
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
