import {Routes} from '@angular/router';
import {LoginGuard} from './core/guards/login.guard';
import {PublicGuard} from './core/guards/public.guard';
import {StaffGuard} from './core/guards/staff.guards';

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
    loadComponent: () => import('./pages/auth/auth/auth.component')
      .then(m => m.AuthComponent),
    canActivate: [PublicGuard],
    title: 'Connexion | Tickly'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register-page.component')
      .then(m => m.RegisterPageComponent),
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
    loadComponent: () => import('./pages/auth/validate-email/validate-email.component')
      .then(m => m.ValidateEmailComponent),
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
    loadComponent: () => import('./pages/auth/account-deletion-confirmation/account-deletion-confirmation.component')
      .then(m => m.AccountDeletionConfirmationComponent),
    title: 'Confirmation de suppression de compte'
  },

  {
    path: 'tickets/view/:ticketId', // Route pour accéder aux billets publics via email
    loadComponent: () => import('./pages/public/tickets/public-ticket.component')
      .then(m => m.PublicTicketComponent),
    title: 'Votre billet | Tickly'
  },


  // User private area (requires authentication)
  {
    path: 'user',
    loadChildren: () => import('./pages/private/user/user.routes').then(m => m.userRoutes),
    canActivate: [LoginGuard]
  },

  // Manager area (for structure administrators)
  {
    path: 'create-structure',
    loadComponent: () => import('./pages/private/admin/structure-setup/structure-setup.component')
      .then(m => m.StructureSetupComponent),
    canActivate: [LoginGuard], // Requires authentication
    title: 'Configuration de structure | Tickly'
  },

  // Admin private area (requires authentication and staff role)
  {
    path: 'admin',
    loadChildren: () => import('./pages/private/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [LoginGuard, StaffGuard], // Both guards to ensure user is logged in and has a staff role
    title: 'Administration | Tickly'
  },


  // Public area (default)
  {
    path: '',
    loadChildren: () => import('./pages/public/public.routes').then(m => m.publicRoutes)
  },

  // Fallback for unmatched routes
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
