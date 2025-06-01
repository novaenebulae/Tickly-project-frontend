import { Routes } from '@angular/router';
import { UserTicketsPage } from './user-tickets-page/user-tickets-page.component';

/**
 * User private area routes configuration
 *
 * All routes are accessible under the /user/* path
 * and require user authentication (via LoginGuard in app.routes.ts)
 */
export const userRoutes: Routes = [
  // Default route - redirect to tickets
  {
    path: '',
    redirectTo: 'tickets',
    pathMatch: 'full'
  },

  // User tickets management
  {
    path: 'tickets',
    component: UserTicketsPage,
    title: 'Mes Billets | Tickly'
  },

  // Legacy support - redirect reservations to tickets
  {
    path: 'reservations',
    redirectTo: 'tickets',
    pathMatch: 'full'
  }

  // Profile page (to be implemented)
  // {
  //   path: 'profile',
  //   component: UserProfileComponent,
  //   title: 'Mon Profil | Tickly'
  // },

  // Favorites page (to be implemented)
  // {
  //   path: 'favorites',
  //   component: UserFavoritesComponent,
  //   title: 'Mes Favoris | Tickly'
  // }
];
