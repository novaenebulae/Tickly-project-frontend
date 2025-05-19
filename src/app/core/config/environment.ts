// src/app/core/config/environment.ts

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
