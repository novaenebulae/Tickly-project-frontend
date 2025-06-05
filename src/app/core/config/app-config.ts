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
      ticketing: {
        reservations: string;  // POST to create a new reservation (batch of tickets)
        myTickets: string;     // GET tickets for the current user
        ticketById: (ticketId: string) => string; // GET details of a specific ticket
        validateTicket?: string; // Optional: POST to validate a ticket (scan)
      };
      // ===== NOUVEAU : ENDPOINTS STATS =====
      stats: {
        // Statistiques d'événements
        events: {
          base: (eventId: number | string) => string; // GET stats générales d'un événement
          timeSeries: (eventId: number | string) => string; // GET données temporelles
          compare: string; // GET comparaison de plusieurs événements
          performance: (eventId: number | string) => string; // GET métriques de performance
          audience: (eventId: number | string) => string; // GET insights audience
          realTime: (eventId: number | string) => string; // GET stats temps réel (optionnel)
        };
        // Statistiques de structures
        structures: {
          base: (structureId: number | string) => string; // GET stats générales structure
          dashboard: (structureId: number | string) => string; // GET dashboard consolidé
          eventsOverview: (structureId: number | string) => string; // GET overview événements
          performance: (structureId: number | string) => string; // GET métriques performance
          analytics: (structureId: number | string) => string; // GET analytics avancées
          reports: (structureId: number | string) => string; // GET rapports détaillés
          compare: string; // GET comparaison de plusieurs structures
        };
        // Statistiques globales/admin
        global: {
          overview: string; // GET vue d'ensemble plateforme
          trends: string; // GET tendances générales
          topPerformers: string; // GET top structures/événements
          platformHealth: string; // GET santé de la plateforme
        };
        // Exports et rapports
        exports: {
          eventReport: (eventId: number | string) => string; // GET/POST rapport événement
          structureReport: (structureId: number | string) => string; // GET/POST rapport structure
          customReport: string; // POST rapport personnalisé
        };
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
    ticketing: boolean;
    stats: boolean;
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
  // ===== NOUVEAU : CONFIG STATS =====
  stats: {
    // Configuration des graphiques
    charts: {
      defaultTimeframe: string; // '30d', '3m', '1y'
      defaultGranularity: string; // 'day', 'week', 'month'
      maxDataPoints: number; // Limite de points sur les graphiques
      refreshInterval: number; // Intervalle de rafraîchissement auto (ms)
      colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        danger: string;
        info: string;
      };
    };
    // Configuration du cache
    cache: {
      ttl: number; // Time to live en millisecondes
      maxSize: number; // Nombre max d'entrées en cache
      prefetchEnabled: boolean; // Préchargement des données
    };
    // Configuration des seuils d'alerte
    thresholds: {
      fillRate: {
        excellent: number; // >= 90%
        good: number; // >= 70%
        average: number; // >= 50%
        poor: number; // < 50%
      };
      attendance: {
        high: number;
        medium: number;
        low: number;
      };
      performance: {
        growth: {
          excellent: number; // >= 20%
          good: number; // >= 10%
          stable: number; // >= -5%
          declining: number; // < -5%
        };
      };
    };
    // Configuration des exports
    exports: {
      formats: string[]; // ['pdf', 'excel', 'csv']
      maxRange: number; // Plage max en jours pour les exports
      includeCharts: boolean;
      includeRawData: boolean;
    };
    // Configuration temps réel
    realTime: {
      enabled: boolean;
      updateInterval: number; // Intervalle de mise à jour (ms)
      maxConcurrentConnections: number;
    };
  };
  // Add other global app settings
  features: {
    enableTicketingPdfExport: boolean;
    // ===== NOUVEAU : FEATURE FLAGS STATS =====
    enableStatsModule: boolean;
    enableRealTimeStats: boolean;
    enableStatsExports: boolean;
    enableAdvancedAnalytics: boolean;
    enableStatsComparisons: boolean;
    enablePredictiveAnalytics: boolean; // Pour plus tard
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
        areaById: (structureId: number | string, areaId: number | string) => `structures/${structureId}/areas/${areaId}` // PUT, DELETE area
      },
      users: {
        base: 'users',
        byId: (id) => `users/${id}`,
        profile: 'users/me',
        updateProfile: 'users/me',
        search: 'users/search',
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
      },

      // ===== CONFIGURATION ENDPOINTS STATS =====
      stats: {
        // Endpoints pour les statistiques d'événements
        events: {
          base: (eventId: number | string) => `stats/events/${eventId}`, // Statistiques générales
          timeSeries: (eventId: number | string) => `stats/events/${eventId}/timeseries`, // Données temporelles
          compare: 'stats/events/compare', // Comparaison d'événements
          performance: (eventId: number | string) => `stats/events/${eventId}/performance`, // Métriques performance
          audience: (eventId: number | string) => `stats/events/${eventId}/audience`, // Insights audience
          realTime: (eventId: number | string) => `stats/events/${eventId}/realtime` // Stats temps réel
        },

        // Endpoints pour les statistiques de structures
        structures: {
          base: (structureId: number | string) => `stats/structures/${structureId}`, // Stats générales
          dashboard: (structureId: number | string) => `stats/structures/${structureId}/dashboard`, // Dashboard consolidé
          eventsOverview: (structureId: number | string) => `stats/structures/${structureId}/events-overview`, // Overview événements
          performance: (structureId: number | string) => `stats/structures/${structureId}/performance`, // Métriques performance
          analytics: (structureId: number | string) => `stats/structures/${structureId}/analytics`, // Analytics avancées
          reports: (structureId: number | string) => `stats/structures/${structureId}/reports`, // Rapports détaillés
          compare: 'stats/structures/compare' // Comparaison de structures
        },

        // Endpoints pour les statistiques globales
        global: {
          overview: 'stats/global/overview', // Vue d'ensemble plateforme
          trends: 'stats/global/trends', // Tendances générales
          topPerformers: 'stats/global/top-performers', // Top structures/événements
          platformHealth: 'stats/global/platform-health' // Santé de la plateforme
        },

        // Endpoints pour les exports et rapports
        exports: {
          eventReport: (eventId: number | string) => `stats/exports/events/${eventId}/report`, // Rapport événement
          structureReport: (structureId: number | string) => `stats/exports/structures/${structureId}/report`, // Rapport structure
          customReport: 'stats/exports/custom-report' // Rapport personnalisé
        }
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
    stats: true // ✅ Activé pour les statistiques
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

  // ===== CONFIGURATION STATISTIQUES =====
  stats: {
    // Configuration des graphiques
    charts: {
      defaultTimeframe: '30d', // Période par défaut
      defaultGranularity: 'day', // Granularité par défaut
      maxDataPoints: 100, // Maximum 100 points sur un graphique
      refreshInterval: 300000, // Rafraîchissement toutes les 5 minutes
      colors: {
        primary: '#3B82F6',    // Bleu
        secondary: '#64748B',  // Gris
        success: '#10B981',    // Vert
        warning: '#F59E0B',    // Orange
        danger: '#EF4444',     // Rouge
        info: '#06B6D4'        // Cyan
      }
    },

    // Configuration du cache
    cache: {
      ttl: 300000, // 5 minutes de cache
      maxSize: 50, // Maximum 50 entrées en cache
      prefetchEnabled: true // Activer le préchargement
    },

    // Configuration des seuils d'alerte
    thresholds: {
      fillRate: {
        excellent: 90, // >= 90% = excellent
        good: 70,      // >= 70% = bon
        average: 50,   // >= 50% = moyen
        poor: 0        // < 50% = faible
      },
      attendance: {
        high: 1000,    // > 1000 participants = fort
        medium: 500,   // > 500 participants = moyen
        low: 100       // < 100 participants = faible
      },
      performance: {
        growth: {
          excellent: 20, // >= 20% croissance = excellent
          good: 10,      // >= 10% croissance = bon
          stable: -5,    // >= -5% = stable
          declining: -5  // < -5% = en déclin
        }
      }
    },

    // Configuration des exports
    exports: {
      formats: ['pdf', 'excel', 'csv'], // Formats supportés
      maxRange: 365, // Maximum 1 an de données
      includeCharts: true, // Inclure les graphiques
      includeRawData: true // Inclure les données brutes
    },

    // Configuration temps réel
    realTime: {
      enabled: false, // Désactivé par défaut (à activer plus tard)
      updateInterval: 30000, // Mise à jour toutes les 30 secondes
      maxConcurrentConnections: 100 // Maximum 100 connexions simultanées
    }
  },

  // ===== FEATURE FLAGS =====
  features: {
    enableTicketingPdfExport: true, // Export PDF billets

    // Feature flags pour les statistiques
    enableStatsModule: true, // ✅ Module stats activé
    enableRealTimeStats: false, // ❌ Stats temps réel (pour plus tard)
    enableStatsExports: true, // ✅ Export des stats
    enableAdvancedAnalytics: true, // ✅ Analytics avancées
    enableStatsComparisons: true, // ✅ Comparaisons
    enablePredictiveAnalytics: false // ❌ Prédictif (pour plus tard)
  },

  logging: {
    logLevel: 'debug' // Set to 'info' or 'warn' for production
  }
};
