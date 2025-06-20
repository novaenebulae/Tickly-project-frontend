/**
 * @file Application wide configuration settings.
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

/**
 * Defines the structure for application configuration constants.
 */
interface AppConfig {
  appName: string;
  appVersion: string;
  api: {
    baseUrl: string;
    endpoints: {
      auth: {
        login: string;
        register: string;
        validateToken: string;
        refreshToken?: string; // Optional: if you implement token refresh
        passwordResetRequest: string;
        passwordChangeRequest: string;
      };
      events: {
        base: string;          // e.g., 'events' for GET (list), POST (create)
        byId: (id: number | string) => string; // e.g., `events/${id}` for GET (single), PUT, DELETE
        search: string;
        categories: string;
        statusUpdate: (id: number | string) => string; // e.g., `events/${id}/status`
      };
      structures: {
        base: string;
        byId: (id: number | string) => string;
        types: string;
        areas: (structureId: number | string) => string; // e.g., `structures/${structureId}/areas`
        areaById: (structureId: number | string, areaId: number | string) => string;
        areaAudienceZones: (structureId: number | string, areaId: number | string) => string;
        areaAudienceZone: (structureId: number | string, areaId: number | string, zoneId: number | string) => string;
      };
      users: {
        base: string; // For admin listing users, if any
        byId: (id: number | string) => string;
        profile: string; // For current user's profile (e.g., 'users/me')
        updateProfile: string;
        search: string; // To search users (e.g., for adding friends)
      };
      friendship: {
        base: string;          // List current user's friends
        requests: string;      // GET (received/sent), POST (send new)
        requestAction: (friendshipId: number | string) => string; // PUT/DELETE for accept/reject/cancel/block
        friendsAttendingEvent: (eventId: number | string) => string; // GET friends for an event
      };
      team: {
        structure: (structureId: number | string) => string; // e.g., `team/structure/${structureId}`
        roles: string;                                       // e.g., 'team/roles'
        invite: string;                                      // e.g., 'team/invite'
        member: (memberId: number | string) => string;      // e.g., `team/member/${memberId}`
        myRole: string;                                      // e.g., 'team/me/role'
      };
      ticketing: {
        reservations: string;  // POST to create a new reservation (batch of tickets)
        myTickets: string;     // GET tickets for the current user
        ticketById: (ticketId: string) => string; // GET details of a specific ticket
        validateTicket?: string; // Optional: POST to validate a ticket (scan)
      };
      // Add other domains as needed
    };
  };
  mock: {
    enabled: boolean; // Global switch for all mocks
    delay: number;    // Default delay in ms for mock responses
    // Individual domain switches
    auth: boolean;
    events: boolean;
    structures: boolean;
    users: boolean;
    friendship: boolean;
    team: boolean;
    ticketing: boolean;
  };
  auth: {
    tokenKey: string;             // Key for storing the JWT in localStorage/sessionStorage
    keepLoggedInKey: string;      // Key for storing the 'keep me logged in' preference
    userRoleKey: string;          // Optional: Key for storing user role if needed client-side
    structureIdKey: string;       // Optional: Key for storing associated structure ID
    tokenRefreshOffset?: number;  // Optional: Time in seconds before token expiry to attempt refresh
  };
  events: {
    defaultHomeCount: number;
    defaultFeaturedCount: number;
    // Add other event-specific configurations
  };
  pagination: {
    defaultPageSize: number;
    maxPageSize?: number;
  };
  // Add other global app settings
  features: {
    enableTicketingPdfExport: boolean;
    // Add feature flags here
  };
  logging: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  }
}

/**
 * Application configuration constants.
 * Values here can be overridden by environment-specific files (environment.ts, environment.prod.ts)
 * if those files also export an object that merges with or replaces parts of this.
 */
export const APP_CONFIG: AppConfig = {
  appName: 'OLIVAREZ Lucas - CDA - Ticketing App',
  appVersion: '1.0.0',

  api: {
    baseUrl: 'http://localhost:8080/', // TODO: Replace with your actual backend URL or use environment variable
    endpoints: {
      auth: {
        login: 'login',
        register: 'auth/register',
        validateToken: 'auth/validate-token',
        passwordResetRequest: 'auth/password-reset-request',
        passwordChangeRequest: 'auth/password-change-request', // For logged-in user
      },
      events: {
        base: 'events',
        byId: (id) => `events/${id}`,
        search: 'events/search',
        categories: 'events/categories',
        statusUpdate: (id) => `events/${id}/status`,
      },
      structures: {
        base: 'structures', // GET (list)
        byId: (id: number | string) => `structures/${id}`, // GET (single), PUT, DELETE
        types: 'structures/types', // GET structure types
        areas: (structureId: number | string) => `structures/${structureId}/areas`, // GET, POST (create area)
        areaById: (structureId: number | string, areaId: number | string) => `structures/${structureId}/areas/${areaId}`,
        areaAudienceZones: (structureId: number | string, areaId: number | string) => `structures/${structureId}/areas/${areaId}/audience-zones`,
        areaAudienceZone: (structureId: number | string, areaId: number | string, zoneId: number | string) => `structures/${structureId}/areas/${areaId}/audience-zones/${zoneId}`
      },
      users: {
        base: 'users',
        byId: (id) => `users/${id}`,
        profile: 'users/me',
        updateProfile: 'users/me',
        search: 'users/search',
      },
      team: {
        structure: (structureId: number | string) => `team/structure/${structureId}`,
        roles: 'team/roles',
        invite: 'team/invite',
        member: (memberId: number | string) => `team/member/${memberId}`,
        myRole: 'team/me/role'
      },
      friendship: {
        base: 'friendships', // GET list of FriendModel
        requests: 'friendships/requests', // GET list of FriendRequestModel, POST SendFriendRequestDto
        requestAction: (friendshipId) => `friendships/requests/${friendshipId}`, // PUT/DELETE with UpdateFriendshipStatusDto
        friendsAttendingEvent: (eventId) => `friendships/events/${eventId}/attendees`,
      },
      ticketing: {
        reservations: 'ticketing/reservations', // POST ReservationRequestDto
        myTickets: 'ticketing/tickets/my',     // GET current user's TicketModel[]
        ticketById: (ticketId) => `ticketing/tickets/${ticketId}`, // GET TicketModel
        // validateTicket: 'ticketing/tickets/validate',
      }
    }
  },

  mock: {
    enabled: true,  // Set to false to use real API, true for mocks
    delay: 300,     // Simulate network latency for mocks
    auth: true,
    events: true,
    structures: true,
    users: true,
    friendship: true,
    ticketing: true,
    team: true,
  },

  auth: {
    tokenKey: 'APP_AUTH_TOKEN',
    keepLoggedInKey: 'APP_KEEP_LOGGED_IN',
    userRoleKey: 'APP_USER_ROLE',
    structureIdKey: 'APP_USER_STRUCTURE_ID'
  },

  events: {
    defaultHomeCount: 6,
    defaultFeaturedCount: 3,
  },

  pagination: {
    defaultPageSize: 12,
    maxPageSize: 100,
  },

  features: {
    enableTicketingPdfExport: true, // Example feature flag
  },

  logging: {
    logLevel: 'debug' // Set to 'info' or 'warn' for production
  }
};
