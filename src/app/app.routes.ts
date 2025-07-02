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
import {ValidateEmailComponent} from './pages/auth/validate-email/validate-email.component';
import {
  AccountDeletionConfirmationComponent
} from './pages/auth/account-deletion-confirmation/account-deletion-confirmation.component';

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
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent),
    canActivate: [PublicGuard],
    title: 'Mot de passe oublié | Tickly'
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./pages/auth/reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent),
    canActivate: [PublicGuard],
    title: 'Réinitialisation du mot de passe | Tickly'
  },

  {
    path: 'auth/validate-email',
    component: ValidateEmailComponent,
    title: 'Validation de l\'email | Tickly'
    // Note: Le token est passé en query parameter (?token=xyz) et non en paramètre de route
  },

  {
    path: 'team/accept-invitation',
    loadComponent: () => import('./pages/auth/team-accept-invitation/team-accept-invitation.component')
      .then(m => m.TeamAcceptInvitationComponent),
    title: 'Accepter l\'invitation'
  },

  {
    path: 'users/confirm-deletion', // Ce chemin correspond au lien dans l'email
    component: AccountDeletionConfirmationComponent,
    title: 'Confirmation de suppression de compte'
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
    canActivate: [LoginGuard], // AdminGuard ici
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
