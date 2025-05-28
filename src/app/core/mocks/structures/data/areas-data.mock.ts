// src/app/core/mocks/structures/areas.mock.ts
import { StructureAreaModel } from '../../../models/structure/structure-area.model';

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
  { id: 503, structureId: 5, name: 'Salle de Projection "Cosmos"', maxCapacity: 300, isActive: true, description: 'Salle pour projections de films.' }, // Pour event 37
  { id: 504, structureId: 5, name: 'Salle de Projection "Galaxie"', maxCapacity: 150, isActive: true, description: 'Petite salle pour projections.' }, // Pour event 37
  { id: 505, structureId: 5, name: 'Planétarium', maxCapacity: 250, isActive: true, description: 'Salle de conférence et de projection du planétarium.' }, // Pour event 42
  { id: 506, structureId: 5, name: 'Terrasse d\'Observation Astronomique', maxCapacity: 300, isActive: true, description: 'Espace extérieur pour observation.' }, // Pour event 42
  { id: 507, structureId: 5, name: 'Club "Le Rockstore"', maxCapacity: 650, isActive: true, description: 'Dancefloor et espace lounge.' }, // Pour event 47

  // --- Zones pour Structure ID 6 (Grand Parc Urbain / Plage) ---
  { id: 601, structureId: 6, name: 'Kiosque à Musique et Pelouse', maxCapacity: 1000, isActive: true, description: 'Zone centrale du parc pour événements.' }, // Pour event 7
  { id: 602, structureId: 6, name: 'Clairière des Projections', maxCapacity: 800, isActive: true, description: 'Espace pour cinéma en plein air.' }, // Pour event 18
  { id: 603, structureId: 6, name: 'Grande Pelouse Nord (Concerts)', maxCapacity: 8000, isActive: true, description: 'Espace pour concerts en plein air.' }, // Pour event 40 (annulé)
  { id: 604, structureId: 6, name: 'Allées du Jardin des Sculptures', maxCapacity: 2000, isActive: true, description: 'Parcours pour exposition en plein air.' }, // Pour event 44


  // --- Zones pour Structure ID 7 (Place de la République / Autres Places) ---
  { id: 701, structureId: 7, name: 'Place Centrale (Marché)', maxCapacity: 2000, isActive: true, description: 'Zone principale pour marchés et rassemblements.' }, // Pour event 8
  { id: 702, structureId: 7, name: 'Village de Noël (Place Cathédrale)', maxCapacity: 3000, isActive: true, description: 'Zone pour le marché de Noël.' }, // Pour event 21
  { id: 703, structureId: 7, name: 'Scène Place de l\'Horloge', maxCapacity: 1000, isActive: true, description: 'Espace pour spectacles de rue.' }, // Pour event 26
  { id: 704, structureId: 7, name: 'Déambulation Rue des Teinturiers', maxCapacity: 500, isActive: true, description: 'Parcours pour spectacles de rue.' }, // Pour event 26
  { id: 705, structureId: 7, name: 'Zone Brocante Nord (Champ de Mars)', maxCapacity: 2000, isActive: true, description: 'Partie du marché aux puces.' }, // Pour event 32
  { id: 706, structureId: 7, name: 'Zone Brocante Sud (Champ de Mars)', maxCapacity: 2000, isActive: true, description: 'Autre partie du marché aux puces.' }, // Pour event 32
  { id: 707, structureId: 7, name: 'Zone Food Trucks (Quais)', maxCapacity: 3200, isActive: true, description: 'Espace pour festival de street food.' }, // Pour event 48


  // --- Zones pour Structure ID 8 (Les Ateliers Créatifs / Boutique) ---
  { id: 801, structureId: 8, name: 'Salle d\'Atelier Polyvalente', maxCapacity: 20, isActive: true, description: 'Salle principale pour ateliers divers.' }, // Pour event 9, 16
  { id: 802, structureId: 8, name: 'Espace Boutique et Atelier DIY', maxCapacity: 10, isActive: true, description: 'Pour ateliers cosmétiques.' }, // Pour event 38

  // --- Zones pour Structure ID 9 (Place de la Mairie de Rennes) ---
  { id: 901, structureId: 9, name: 'Parvis de la Mairie (Bal)', maxCapacity: 500, isActive: true, description: 'Espace pour bal populaire.' }, // Pour event 10

  // --- Zones pour Structure ID 10 (Espace Événementiel "Le Confluent" / Parcours Sportif / Marciac) ---
  { id: 1001, structureId: 10, name: 'Zone Arrivée Course Cycliste', maxCapacity: 5000, isActive: true, description: 'Espace pour l\'arrivée des courses.' }, // Pour event 13
  { id: 1002, structureId: 10, name: 'Point de Vue Montagne (Course)', maxCapacity: 1000, isActive: true, description: 'Zone spectateurs en montagne.' }, // Pour event 13
  { id: 1003, structureId: 10, name: 'Chapiteau Festival Jazz Marciac', maxCapacity: 3000, isActive: true, description: 'Grand chapiteau pour le festival.' }, // Pour event 17
  { id: 1004, structureId: 10, name: 'Zone Départ/Arrivée Marathon Nice', maxCapacity: 10000, isActive: true, description: 'Zone de départ et arrivée du marathon.' }, // Pour event 43
  { id: 1005, structureId: 10, name: 'Zone Arrivée Marathon Cannes', maxCapacity: 5000, isActive: true, description: 'Zone d\'arrivée à Cannes.' }, // Pour event 43

  // --- Zones pour Structure ID 11 (Site en Développement "Nova Arena") ---
  // Pas encore de zones physiques définies pour cette structure en 'draft'

  // --- Zones pour Structure ID 12 (Le Petit Café Intime / Caveau Huchette) ---
  { id: 1201, structureId: 12, name: 'Petite Salle Concert Café', maxCapacity: 40, isActive: true, description: 'Espace intime pour concerts acoustiques.' }, // Pour event 23
  { id: 1202, structureId: 12, name: 'Caveau Jazz Club', maxCapacity: 80, isActive: true, description: 'Salle principale du club de jazz.' }, // Pour event 33

  // --- Zones pour Structure ID 13 (Plage des Corsaires) ---
  { id: 1301, structureId: 13, name: 'Terrain Beach Volley Central', maxCapacity: 200, isActive: true, description: 'Terrain principal pour le tournoi.' }, // Pour event 24
  { id: 1302, structureId: 13, name: 'Terrains Beach Volley Annexes', maxCapacity: 500, isActive: true, description: 'Autres terrains pour le tournoi.' }, // Pour event 24

  // --- Zones pour Structure ID 14 (Librairie "L'Encre et la Plume") ---
  { id: 1401, structureId: 14, name: 'Salle Arrière (Ateliers)', maxCapacity: 15, isActive: true, description: 'Espace pour ateliers d\'écriture.' }, // Pour event 27

  // --- Zones pour Structure ID 15 (Angoulême - Cité de la BD) ---
  { id: 1501, structureId: 15, name: 'Grand Hall "Espace Bulles"', maxCapacity: 5000, isActive: true, description: 'Hall principal des exposants du festival BD.' }, // Pour event 29
  { id: 1502, structureId: 15, name: 'Auditorium Rencontres & Dédicaces', maxCapacity: 300, isActive: true, description: 'Pour les conférences et dédicaces.' }, // Pour event 29

  // --- Zones pour Structure ID 16 (Parc National des Calanques) ---
  { id: 1601, structureId: 16, name: 'Sentier Principal Randonnée Guidée', maxCapacity: 15, isActive: true, description: 'Capacité du groupe de randonnée.' }, // Pour event 31

  // --- Zones pour Structure ID 17 (Ludothèque "Le Dé Pipé") ---
  { id: 1701, structureId: 17, name: 'Grande Salle de Jeux (Tournois)', maxCapacity: 100, isActive: true, description: 'Salle principale pour les tournois.' }, // Pour event 35
  { id: 1702, structureId: 17, name: 'Espace "Découverte" (Jeux Libres)', maxCapacity: 50, isActive: true, description: 'Zone pour jouer librement.' }, // Pour event 35

  // --- Zones pour Structure ID 18 (Chapiteau Magique - Cirque Itinérant) ---
  { id: 1801, structureId: 18, name: 'Piste Centrale et Gradins Chapiteau', maxCapacity: 700, isActive: true, description: 'Espace spectacle du cirque.' }, // Pour event 36

  // --- Zones pour Structure ID 19 (Centre Culturel "Le Lien" / Maison de Quartier) ---
  { id: 1901, structureId: 19, name: 'Salle Polyvalente Spectacles', maxCapacity: 150, isActive: true, description: 'Pour spectacles et réunions.' }, // Pour event 45
  { id: 1902, structureId: 19, name: 'Atelier Bricolage (Repair Café)', maxCapacity: 30, isActive: true, description: 'Espace pour ateliers de réparation.' }, // Pour event 46

  // --- Zones pour Structure ID 20 (Théâtre "Les Petits Lutins") ---
  { id: 2001, structureId: 20, name: 'Petite Salle de Spectacle Enfants', maxCapacity: 80, isActive: true, description: 'Salle adaptée au jeune public.' }, // Pour event 49
];
