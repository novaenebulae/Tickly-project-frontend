import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../shared/layout/main-layout/main-layout.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AllEventsPageComponent } from './events/all-events-page/all-events-page.component';
import { EventDetailsPageComponent } from './events/event-details-page/event-details-page.component';
import { AllStructuresPageComponent } from './structures/all-structures-page/all-structures-page.component';
import { EventTicketReservationPageComponent } from '../private/user/event-ticket-reservation-page/event-ticket-reservation-page.component';
import { LoginGuard } from '../../core/guards/login.guard';

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
        component: LandingPageComponent,
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
            component: AllEventsPageComponent,
            title: 'Événements | Tickly'
          },
          // Single event details
          {
            path: ':id',
            component: EventDetailsPageComponent,
            title: 'Détails de l\'événement | Tickly'
          },
          // Event ticket booking (requires authentication)
          {
            path: ':id/booking',
            component: EventTicketReservationPageComponent,
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
            component: AllStructuresPageComponent,
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

      // Fallback for unmatched routes within public area
      // {
      //   path: '**',
      //   redirectTo: ''
      // }
    ]
  }
];
