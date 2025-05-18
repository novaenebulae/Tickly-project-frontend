// src/app/core/config/environment.ts

/**
 * Environnement de l'application
 * Ces variables peuvent être remplacées lors du build pour différents environnements
 */
export const environment = {
  // Indique si l'application est en production ou développement
  production: false,

  // Version de l'application
  version: '0.1.0',

  // URL de base de l'API REST
  apiUrl: 'http://localhost:8080',

  // Activation des logs de débogage
  enableDebugLogs: true,

  // Activation des mocks (simulation de l'API)
  useMocks: true,

  // Délai artificiel pour les requêtes mockées (ms)
  mockDelay: 500,

  // Configuration des features flags
  features: {
    enableUserRegistration: true,
    enableEventCreation: true,
    enableEventBooking: false,
    enableStructureCreation: true,
    enableSeatingMap: false
  },

  // Configuration Sentry pour la capture des erreurs (désactivé en développement)
  sentry: {
    enabled: false,
    dsn: ''
  }
};

// Interface pour l'environnement
export interface Environment {
  production: boolean;
  version: string;
  apiUrl: string;
  enableDebugLogs: boolean;
  useMocks: boolean;
  mockDelay: number;
  features: {
    enableUserRegistration: boolean;
    enableEventCreation: boolean;
    enableEventBooking: boolean;
    enableStructureCreation: boolean;
    enableSeatingMap: boolean;
  };
  sentry: {
    enabled: boolean;
    dsn: string;
  };
}
