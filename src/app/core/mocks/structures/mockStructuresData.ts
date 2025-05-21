import {getAreasByStructureId} from './areas.mock';
import {mockStructureTypes} from './structure-types.mock';
import {StructureModel} from '../../models/structure/structure.model';


/**
 * Liste des structures mockées pour le développement et les tests
 */
export const mockStructures: StructureModel[] = [
  // Structure 1: Salle de concert
  {
    id: 1,
    name: 'Le Zénith',
    types: [mockStructureTypes.find(t => t.id === 1)!],
    description: 'Grande salle de concert pouvant accueillir jusqu\'à 7000 personnes. Programmation variée incluant concerts, spectacles et événements sportifs.',
    address: {
      country: 'France',
      city: 'Paris',
      street: 'Avenue Corentin Cariou',
      number: '211',
      zipCode: '75019'
    },
    phone: '+33 1 44 52 54 56',
    email: 'contact@lezenith.fr',
    websiteUrl: 'https://www.lezenith.fr',
    socialsUrl: [
      'https://www.facebook.com/lezenithparis',
      'https://www.instagram.com/lezenithparis',
      'https://twitter.com/zenith_paris'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=101',
    coverUrl: 'https://picsum.photos/1200/400?random=151',
    createdAt: new Date('2023-01-15T10:30:00'),
    updatedAt: new Date('2023-06-12T14:45:00'),
    importance: 85, // Score d'importance élevé (grande salle parisienne)
    eventsCount: 8
  },

  // Structure 2: Théâtre
  {
    id: 2,
    name: 'Théâtre de la Ville',
    types: [mockStructureTypes.find(t => t.id === 2)!],
    description: 'Théâtre historique offrant une programmation de théâtre contemporain, danse et musique du monde.',
    address: {
      country: 'France',
      city: 'Paris',
      street: 'Place du Châtelet',
      number: '2',
      zipCode: '75004'
    },
    phone: '+33 1 42 74 22 77',
    email: 'info@theatredelaville.com',
    websiteUrl: 'https://www.theatredelaville-paris.com',
    socialsUrl: [
      'https://www.facebook.com/TheatredelaVille.Paris',
      'https://www.instagram.com/theatredelaville'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=102',
    coverUrl: 'https://picsum.photos/1200/400?random=152',
    createdAt: new Date('2023-02-20T09:15:00'),
    updatedAt: new Date('2023-07-05T11:30:00'),
    importance: 72, // Score d'importance moyen-élevé
    eventsCount: 6
  },

  // Structure 3: Centre de conférence
  {
    id: 3,
    name: 'Centre des Congrès',
    types: [mockStructureTypes.find(t => t.id === 3)!],
    description: 'Espace moderne pour conférences, séminaires et événements professionnels avec équipements audiovisuels de pointe.',
    address: {
      country: 'France',
      city: 'Lyon',
      street: 'Quai Charles de Gaulle',
      number: '50',
      zipCode: '69006'
    },
    phone: '+33 4 72 82 26 26',
    email: 'contact@ccc-lyon.com',
    websiteUrl: 'https://www.ccc-lyon.com',
    socialsUrl: [
      'https://www.linkedin.com/company/centre-congres-lyon',
      'https://twitter.com/CongresCentre'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=103',
    coverUrl: 'https://picsum.photos/1200/400?random=153',
    createdAt: new Date('2023-03-10T11:00:00'),
    updatedAt: new Date('2023-09-18T16:20:00'),
    importance: 68, // Score d'importance moyen-élevé
    eventsCount: 5
  },

  // Structure 4: Espace polyvalent
  {
    id: 4,
    name: 'La Cité des Arts',
    types: [
      mockStructureTypes.find(t => t.id === 4)!,
      mockStructureTypes.find(t => t.id === 9)!
    ],
    description: 'Centre culturel polyvalent proposant expositions, spectacles, ateliers et espaces de création pour artistes.',
    address: {
      country: 'France',
      city: 'Montpellier',
      street: 'Boulevard Louis Blanc',
      number: '25',
      zipCode: '34000'
    },
    phone: '+33 4 67 60 82 42',
    email: 'accueil@cite-arts.fr',
    websiteUrl: 'https://www.cite-arts-montpellier.fr',
    socialsUrl: [
      'https://www.facebook.com/citedesartsmontpellier',
      'https://www.instagram.com/cite_arts'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=104',
    coverUrl: 'https://picsum.photos/1200/400?random=154',
    createdAt: new Date('2023-04-05T14:30:00'),
    updatedAt: new Date('2023-10-22T09:45:00'),
    importance: 55, // Score d'importance moyen
    eventsCount: 7
  },

  // Structure 5: Bar / Club
  {
    id: 5,
    name: 'Le Dôme',
    types: [mockStructureTypes.find(t => t.id === 5)!],
    description: 'Club branché proposant concerts live et soirées DJ dans une ambiance industrielle.',
    address: {
      country: 'France',
      city: 'Marseille',
      street: 'Rue Augustin Daumas',
      number: '12',
      zipCode: '13009'
    },
    phone: '+33 4 91 12 21 21',
    email: 'info@ledomemarseille.com',
    websiteUrl: 'https://www.ledomemarseille.com',
    socialsUrl: [
      'https://www.facebook.com/ledomemarseille',
      'https://www.instagram.com/ledome_marseille'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=105',
    coverUrl: 'https://picsum.photos/1200/400?random=155',
    createdAt: new Date('2023-05-18T16:45:00'),
    updatedAt: new Date('2023-11-03T22:15:00'),
    importance: 40, // Score d'importance moyen-faible
    eventsCount: 3
  },

  // Structure 6: Cinéma
  {
    id: 6,
    name: 'Cinéma Lumière',
    types: [mockStructureTypes.find(t => t.id === 6)!],
    description: 'Cinéma art et essai proposant films indépendants et cycles thématiques.',
    address: {
      country: 'France',
      city: 'Bordeaux',
      street: 'Rue Georges Bonnac',
      number: '5',
      zipCode: '33000'
    },
    phone: '+33 5 56 46 06 55',
    email: 'cinema@lumierebordeaux.fr',
    websiteUrl: 'https://www.cinema-lumiere.com',
    socialsUrl: [
      'https://www.facebook.com/cinemalumiere',
      'https://twitter.com/Cinema_Lumiere'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=106',
    coverUrl: 'https://picsum.photos/1200/400?random=156',
    createdAt: new Date('2023-06-22T10:20:00'),
    updatedAt: new Date('2023-12-15T13:40:00'),
    importance: 35, // Score d'importance faible
    eventsCount: 4
  },

  // Structure 7: Musée
  {
    id: 7,
    name: 'Musée d\'Art Contemporain',
    types: [mockStructureTypes.find(t => t.id === 7)!],
    description: 'Collection permanente d\'œuvres contemporaines et expositions temporaires d\'artistes internationaux.',
    address: {
      country: 'France',
      city: 'Strasbourg',
      street: 'Place Hans-Jean Arp',
      number: '1',
      zipCode: '67000'
    },
    phone: '+33 3 88 23 31 31',
    email: 'info@mac-strasbourg.eu',
    websiteUrl: 'https://www.mac-strasbourg.eu',
    socialsUrl: [
      'https://www.facebook.com/MACstrasbourg',
      'https://www.instagram.com/mac_strasbourg'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=107',
    coverUrl: 'https://picsum.photos/1200/400?random=157',
    createdAt: new Date('2023-07-14T09:00:00'),
    updatedAt: new Date('2024-01-10T11:25:00'),
    importance: 50, // Score d'importance moyen
    eventsCount: 2
  },

  // Structure 8: Stade (Nouvelle structure)
  {
    id: 8,
    name: 'Stade Vélodrome',
    types: [mockStructureTypes.find(t => t.id === 10)!],
    description: 'Grand stade pouvant accueillir jusqu\'à 67000 spectateurs pour des matches de football et des concerts.',
    address: {
      country: 'France',
      city: 'Marseille',
      street: 'Boulevard Michelet',
      number: '3',
      zipCode: '13008'
    },
    phone: '+33 4 91 75 71 00',
    email: 'contact@velodrome.com',
    websiteUrl: 'https://www.velodrome-marseille.com',
    socialsUrl: [
      'https://www.facebook.com/stade.velodrome',
      'https://www.instagram.com/stade_velodrome'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=108',
    coverUrl: 'https://picsum.photos/1200/400?random=158',
    createdAt: new Date('2023-03-25T08:15:00'),
    updatedAt: new Date('2023-11-20T16:30:00'),
    importance: 88, // Score d'importance très élevé
    eventsCount: 8
  },

  // Structure 9: Galerie d'art (Nouvelle structure)
  {
    id: 9,
    name: 'Galerie Lumière',
    types: [mockStructureTypes.find(t => t.id === 8)!],
    description: 'Galerie d\'art contemporain mettant en avant des artistes émergents et proposant des expositions mensuelles.',
    address: {
      country: 'France',
      city: 'Nice',
      street: 'Rue des Arts',
      number: '17',
      zipCode: '06000'
    },
    phone: '+33 4 93 62 48 75',
    email: 'contact@galerielumiere.fr',
    websiteUrl: 'https://www.galerielumiere.fr',
    socialsUrl: [
      'https://www.instagram.com/galerie_lumiere',
      'https://www.facebook.com/GalerieLumiere'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=109',
    coverUrl: 'https://picsum.photos/1200/400?random=159',
    createdAt: new Date('2023-09-10T14:30:00'),
    updatedAt: new Date('2024-02-05T11:20:00'),
    importance: 42, // Score d'importance moyen-faible
    eventsCount: 5
  },

  // Structure 10: Complexe sportif (Nouvelle structure)
  {
    id: 10,
    name: 'Complexe Sportif Jean Bouin',
    types: [mockStructureTypes.find(t => t.id === 11)!],
    description: 'Complexe sportif polyvalent comprenant plusieurs terrains, une piscine olympique et des salles pour divers sports.',
    address: {
      country: 'France',
      city: 'Dijon',
      street: 'Rue Jean Bouin',
      number: '10',
      zipCode: '21000'
    },
    phone: '+33 3 80 48 92 36',
    email: 'info@complexejeanbouin.fr',
    websiteUrl: 'https://www.complexejeanbouin.fr',
    socialsUrl: [
      'https://www.facebook.com/ComplexeJeanBouin'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=110',
    coverUrl: 'https://picsum.photos/1200/400?random=160',
    createdAt: new Date('2023-06-05T09:45:00'),
    updatedAt: new Date('2024-01-15T14:10:00'),
    importance: 60, // Score d'importance moyen
    eventsCount: 6
  },

  // Structure 11: Lieu historique (Nouvelle structure)
  {
    id: 11,
    name: 'Abbaye de Sénanque',
    types: [mockStructureTypes.find(t => t.id === 12)!],
    description: 'Abbaye cistercienne du XIIe siècle proposant visites guidées, concerts et événements culturels dans un cadre exceptionnel.',
    address: {
      country: 'France',
      city: 'Gordes',
      street: 'Route de Sénanque',
      number: '',
      zipCode: '84220'
    },
    phone: '+33 4 90 72 05 72',
    email: 'visites@senanque.fr',
    websiteUrl: 'https://www.abbayedesenanque.com',
    socialsUrl: [
      'https://www.facebook.com/abbayedesenanque',
      'https://www.instagram.com/abbaye_senanque'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=111',
    coverUrl: 'https://picsum.photos/1200/400?random=161',
    createdAt: new Date('2023-05-20T10:30:00'),
    updatedAt: new Date('2023-12-10T09:15:00'),
    importance: 65, // Score d'importance moyen-élevé
    eventsCount: 4
  },

  // Structure 12: École d'art (Nouvelle structure)
  {
    id: 12,
    name: 'École Nationale Supérieure d\'Art',
    types: [mockStructureTypes.find(t => t.id === 14)!, mockStructureTypes.find(t => t.id === 9)!],
    description: 'École supérieure d\'art proposant formations, expositions et événements artistiques tout au long de l\'année.',
    address: {
      country: 'France',
      city: 'Toulouse',
      street: 'Rue des Beaux-Arts',
      number: '5',
      zipCode: '31000'
    },
    phone: '+33 5 61 22 29 98',
    email: 'contact@ensa-toulouse.fr',
    websiteUrl: 'https://www.ensa-toulouse.fr',
    socialsUrl: [
      'https://www.facebook.com/ecoledartToulouse',
      'https://www.instagram.com/ensa_toulouse',
      'https://twitter.com/ENSA_Toulouse'
    ],
    logoUrl: 'https://picsum.photos/200/200?random=112',
    coverUrl: 'https://picsum.photos/1200/400?random=162',
    createdAt: new Date('2023-08-15T11:45:00'),
    updatedAt: new Date('2024-02-20T15:30:00'),
    importance: 55, // Score d'importance moyen
    eventsCount: 7
  }
];

// Ajouter les zones aux structures
mockStructures.forEach(structure => {
  structure.areas = getAreasByStructureId(structure.id!);
});
