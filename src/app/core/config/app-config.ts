// src/app/core/config/app-config.ts

/**
 * Configuration globale de l'application Tickly
 * Ce fichier centralise tous les paramètres de configuration
 */
export const APP_CONFIG = {
  // Configuration de l'API
  api: {
    baseUrl: 'http://localhost:8080',
    endpoints: {
      auth: {
        login: '/login',
        register: '/register',
        refreshToken: '/refresh-token'
      },
      events: {
        base: '/api/events',
        search: '/api/events/search'
      },
      structures: {
        base: '/api/structures',
        create: '/api/structures/create-structure',
        types: '/api/structure-types',
        areas: '/api/areas'
      }
    },
    // Timeout par défaut pour les requêtes HTTP (en ms)
    defaultTimeout: 30000
  },

  // Configuration des mocks
  mock: {
    // Activation globale des mocks (remplace les appels API réels)
    enabled: true,
    // Délai simulé pour les réponses des mocks (en ms)
    delay: 500,

    // Activation par domaine fonctionnel
    auth: true,
    events: true,
    structures: true
  },

  // Configuration de l'authentification
  auth: {
    // Clé de stockage du token JWT
    tokenKey: 'jwt_token',
    // Clé pour la préférence "se souvenir de moi"
    keepLoggedInKey: 'keepLoggedIn',
    // Durée de vie du token en secondes (1 heure par défaut)
    tokenLifetime: 3600,
    // Activation de l'auto-refresh du token
    enableAutoRefresh: true,
    // Seuil de refresh en secondes (15 minutes avant expiration)
    refreshThreshold: 900
  },

  // Configuration des notifications
  notification: {
    // Durée d'affichage par défaut des notifications (en ms)
    duration: 5000,
    // Position des notifications
    position: {
      horizontal: 'center',
      vertical: 'top'
    }
  },

  // Paramètres du système d'événements
  events: {
    // Nombre d'événements à afficher par défaut sur la page d'accueil
    defaultHomeCount: 6,
    // Nombre d'événements par page dans la liste
    defaultPageSize: 10,
    // Taille maximale des photos d'événements (en Ko)
    maxPhotoSize: 5120,
    // Nombre maximum de photos par événement
    maxPhotosPerEvent: 10
  },

  // Paramètres du système de structures
  structures: {
    // Nombre maximum de zones par structure
    maxAreasPerStructure: 20
  }
};

// Types pour la configuration
export type AppConfig = typeof APP_CONFIG;
