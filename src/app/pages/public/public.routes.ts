import {Routes} from '@angular/router';
import {LoginGuard} from '../../core/guards/login.guard';

/**
 * Public routes configuration
 *
 * These routes are accessible to all visitors without authentication requirements
 * They represent the main public content areas of the application
 */
export const publicRoutes: Routes = [
  {
    path: '',
    children: [
      // Home page / Landing page
      {
        path: '',
        loadComponent: () => import('./landing-page/landing-page.component')
          .then(m => m.LandingPageComponent),
        pathMatch: 'full',
        title: 'Accueil | Tickly'
      },

      // Events section
      {
        path: 'events',
        children: [
          // All events listing
          {
            path: '',
            loadComponent: () => import('./events/all-events-page/all-events-page.component')
              .then(m => m.AllEventsPageComponent),
            title: 'Événements | Tickly'
          },
          // Single event details
          {
            path: ':id',
            loadComponent: () => import('./events/event-details-page/event-details-page.component')
              .then(m => m.EventDetailsPageComponent),
            title: 'Détails de l\'événement | Tickly'
          },
          // Event ticket booking (requires authentication)
          {
            path: ':id/booking',
            loadComponent: () => import('../private/user/event-ticket-reservation-page/event-ticket-reservation-page.component')
              .then(m => m.EventTicketReservationPageComponent),
            canActivate: [LoginGuard],
            title: 'Réserver des billets | Tickly'
          }
        ]
      },

      // Structures section
      {
        path: 'structures',
        children: [
          // All structures listing
          {
            path: '',
            loadComponent: () => import('./structures/all-structures-page/all-structures-page.component')
              .then(m => m.AllStructuresPageComponent),
            title: 'Structures | Tickly'
          },
          // Single structure details (commented until implemented)
          {
            path: ':id',
            loadComponent: () => import('./structures/structure-details-page/structure-details-page.component')
              .then(m => m.StructureDetailsPageComponent),
            title: 'Détails de l\'organisation | Tickly'
          }
        ]
      },
      {
        path: 'users/confirm-deletion',
        loadComponent: () => import('../auth/account-deletion-confirmation/account-deletion-confirmation.component').then(m => m.AccountDeletionConfirmationComponent)
      }

      // Fallback for unmatched routes within public area
      // {
      //   path: '**',
      //   redirectTo: ''
      // }
    ]
  }
];
