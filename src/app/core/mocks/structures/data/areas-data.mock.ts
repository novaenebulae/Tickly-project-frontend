import {EventAudienceZone, SeatingType} from '../../../models/event/event-audience-zone.model';
import { StructureAreaModel } from '../../../models/structure/structure-area.model';
import { allMockEvents } from '../../events/data/event-data.mock';

export const mockAreas: StructureAreaModel[] = [
  // --- Zones pour Structure ID 1 (Le Grand Complexe Événementiel Parisien) ---
  { id: 101, structureId: 1, name: 'Grande Scène Extérieure', maxCapacity: 20000, isActive: true, description: 'Espace principal pour les grands concerts en plein air.' },
  { id: 102, structureId: 1, name: 'Scène Cascade (Couvert)', maxCapacity: 3000, isActive: true, description: 'Scène secondaire couverte, idéale pour des sets plus intimistes.' },
  { id: 103, structureId: 1, name: 'Amphithéâtre Principal (Intérieur)', maxCapacity: 1200, isActive: true, description: 'Pour conférences et spectacles assis.' },
  { id: 104, structureId: 1, name: 'Arène eSport Alpha', maxCapacity: 500, isActive: true, description: 'Dédiée aux compétitions de jeux vidéo.' },
  { id: 105, structureId: 1, name: 'Hall d\'Exposition A', maxCapacity: 1000, isActive: true, description: 'Grand hall modulable pour salons.' },
  { id: 106, structureId: 1, name: 'Salle de Conférences "Victor Hugo"', maxCapacity: 200, isActive: true, description: 'Salle équipée pour séminaires et réunions.' },
  { id: 107, structureId: 1, name: 'Salle de Spectacle "Molière"', maxCapacity: 1300, isActive: true, description: 'Salle historique pour théâtre et cabarets.' }, // Pour event 30
  { id: 108, structureId: 1, name: 'Théâtre du Ranelagh (salle fictive ici pour structure 1)', maxCapacity: 300, isActive: true, description: 'Petite salle de théâtre classique.' }, // Pour event 41

  // --- Zones pour Structure ID 2 (Auditorium Harmonia) ---
  { id: 201, structureId: 2, name: 'Grande Salle Symphonique', maxCapacity: 1200, isActive: true, description: 'Salle principale de l\'auditorium avec parterre et balcons.' },
  { id: 202, structureId: 2, name: 'Espace Château (pour théâtre immersif)', maxCapacity: 100, isActive: true, description: 'Zone aménagée pour des expériences théâtrales spécifiques.' }, // Pour event 14
  { id: 203, structureId: 2, name: 'Salle Polyvalente "Le Studio"', maxCapacity: 2500, isActive: true, description: 'Espace adaptable pour concerts debout ou assis.' }, // Pour event 20
  { id: 204, structureId: 2, name: 'Salle des Fêtes du Dock', maxCapacity: 2000, isActive: true, description: 'Grande salle pour concerts et festivals.' }, // Pour event 51

  // --- Zones pour Structure ID 3 (Espace Culturel "Perspectives") ---
  { id: 301, structureId: 3, name: 'Galerie Principale (Exposition)', maxCapacity: 300, isActive: true, description: 'Espace d\'exposition principal.' },
  { id: 302, structureId: 3, name: 'Auditorium (Conférences)', maxCapacity: 700, isActive: true, description: 'Pour les conférences et projections.' }, // Pour event 19
  { id: 303, structureId: 3, name: 'Galerie "Le Rayon Vert"', maxCapacity: 100, isActive: true, description: 'Petite galerie pour expositions photographiques.' }, // Pour event 25
  { id: 304, structureId: 3, name: 'Hall d\'Exposition "Zenith"', maxCapacity: 3000, isActive: true, description: 'Grand hall pour salons.' }, // Pour event 34
  { id: 305, structureId: 3, name: 'Salle Ateliers "Sérénité"', maxCapacity: 50, isActive: true, description: 'Dédiée aux ateliers de bien-être.' }, // Pour event 34
  { id: 306, structureId: 3, name: 'Hall "Sakura" (Japan Expo)', maxCapacity: 10000, isActive: true, description: 'Hall principal pour Japan Expo.' }, // Pour event 39
  { id: 307, structureId: 3, name: 'Salle de Projection "Anime X"', maxCapacity: 400, isActive: true, description: 'Pour les projections d\'anime.' }, // Pour event 39
  { id: 308, structureId: 3, name: 'Galerie d\'Art "Contemporain Y"', maxCapacity: 100, isActive: true, description: 'Espace pour vernissages et expositions.' }, // Pour event 50

  // --- Zones pour Structure ID 4 (Stade Municipal de Bordeaux) ---
  { id: 401, structureId: 4, name: 'Terrain Principal et Tribunes', maxCapacity: 40000, isActive: true, description: 'Terrain de jeu et tribunes principales.' },
  { id: 402, structureId: 4, name: 'Virages (Zones Debout)', maxCapacity: 10000, isActive: true, description: 'Zones populaires pour les supporters.' },

  // --- Zones pour Structure ID 5 (Théâtre de la Comète / Cité de l'Espace / Rockstore) ---
  { id: 501, structureId: 5, name: 'Salle Principale du Théâtre', maxCapacity: 450, isActive: true, description: 'Salle principale avec orchestre et balcon.' }, // Pour event 6
  { id: 502, structureId: 5, name: 'Salle de Concert "Le Bikini"', maxCapacity: 900, isActive: true, description: 'Salle de concert avec fosse et mezzanine.' }, // Pour event 28
];

/**
 * Génère toutes les zones d'audience à partir des événements
 * Cela extrait les audienceZones de tous les événements pour créer un jeu de données global
 */
export function getAllMockAudienceZones(): EventAudienceZone[] {
  const allZones: EventAudienceZone[] = [];

  allMockEvents.forEach(event => {
    if (event.audienceZones) {
      event.audienceZones.forEach(zone => {
        // S'assurer que la zone a un ID (nécessaire pour certaines opérations)
        if (zone.id) {
          allZones.push(zone as EventAudienceZone);
        }
      });
    }
  });

  return allZones;
}

/**
 * Récupère les zones d'audience pour une area spécifique
 */
export function getAudienceZonesByAreaId(areaId: number): EventAudienceZone[] {
  return getAllMockAudienceZones().filter(zone => zone.areaId === areaId);
}

/**
 * Récupère une zone d'audience par son ID
 */
export function findAudienceZoneById(id: number): EventAudienceZone | undefined {
  return getAllMockAudienceZones().find(zone => zone.id === id);
}
