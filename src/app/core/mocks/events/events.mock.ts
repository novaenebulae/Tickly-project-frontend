// src/app/core/mocks/events/events.mock.ts

import { Event, EventStatus } from '../../models/event.model';

/**
 * Liste des événements mockés pour le développement et les tests
 */
export const mockEvents: Event[] = [
  {
    id: 1,
    name: 'Festival de Musique d\'été',
    category: 'Festival',
    shortDescription: 'Un festival vibrant avec des artistes internationaux.',
    genre: ['Pop', 'Rock'],
    tags: ['été', 'musique', 'plein air'],
    startDate: new Date('2025-07-10T18:00:00'),
    endDate: new Date('2025-07-12T23:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 101,
        name: 'Parc Central',
        maxCapacity: 5000,
        ticketCount: 4500,
        ticketPrice: 45.00,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Profitez de trois jours de musique live avec des groupes et artistes renommés. Le festival comprend trois scènes, des zones de restauration et des espaces de repos. Des groupes nationaux et internationaux se produiront tout au long du weekend.',
    links: ['https://festivalmusiqueete.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1011/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1012/600/400', 'https://picsum.photos/seed/1013/600/400'],
    status: 'published',
    createdByStructureId: 1,
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-04-20T15:30:00')
  },
  {
    id: 2,
    name: 'Théâtre Classique: Roméo et Juliette',
    category: 'Theater',
    shortDescription: 'Une représentation émouvante de la tragédie de Shakespeare.',
    genre: ['Drame'],
    tags: ['théâtre', 'classique', 'roméo'],
    startDate: new Date('2025-06-05T20:00:00'),
    endDate: new Date('2025-06-05T22:30:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 102,
        name: 'Théâtre Royal',
        maxCapacity: 800,
        ticketCount: 800,
        ticketPrice: 30.00,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Une mise en scène moderne de la célèbre pièce de Shakespeare. Une réinterprétation de la pièce classique avec des costumes contemporains et une mise en scène innovante qui met en valeur la rivalité entre les familles.',
    links: ['https://theatreroyal.com/romeo-juliette'],
    mainPhotoUrl: 'https://picsum.photos/seed/1021/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1022/600/400'],
    status: 'published',
    createdByStructureId: 2,
    createdAt: new Date('2025-02-10T09:00:00'),
    updatedAt: new Date('2025-04-18T11:00:00')
  },
  {
    id: 3,
    name: 'Match de Football: Équipe A vs Équipe B',
    category: 'Sport',
    shortDescription: 'Un match passionnant entre deux équipes rivales.',
    genre: ['Football'],
    tags: ['sport', 'football', 'match'],
    startDate: new Date('2025-05-20T15:00:00'),
    endDate: new Date('2025-05-20T17:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 103,
        name: 'Stade Municipal',
        maxCapacity: 20000,
        ticketCount: 18000,
        ticketPrice: 25.00,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Venez encourager votre équipe favorite dans ce match décisif. Le championnat entre dans sa phase finale et ce match pourrait être déterminant pour la qualification en phases finales.',
    links: ['https://stademunicipal.com/match'],
    mainPhotoUrl: 'https://picsum.photos/seed/1031/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1032/600/400'],
    status: 'published',
    createdByStructureId: 3,
    createdAt: new Date('2025-03-01T12:00:00'),
    updatedAt: new Date('2025-04-22T14:00:00')
  },
  {
    id: 4,
    name: 'Conférence Tech: L\'avenir de l\'IA',
    category: 'Conference',
    shortDescription: 'Découvrez les dernières avancées en intelligence artificielle.',
    genre: ['Technologie'],
    tags: ['conférence', 'IA', 'tech'],
    startDate: new Date('2025-08-15T09:00:00'),
    endDate: new Date('2025-08-15T17:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 104,
        name: 'Centre des Congrès',
        maxCapacity: 1500,
        ticketCount: 1500,
        ticketPrice: 100.00,
        active: true
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Une journée complète de conférences et ateliers sur l\'intelligence artificielle. Des experts internationaux présentent les dernières innovations et débattent des implications éthiques et sociétales des IA avancées.',
    links: ['https://conferenceia.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1041/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1042/600/400'],
    status: 'published',
    createdByStructureId: 4,
    createdAt: new Date('2025-01-20T08:00:00'),
    updatedAt: new Date('2025-04-19T10:00:00')
  },
  {
    id: 5,
    name: 'Exposition d\'Art Moderne',
    category: 'Exhibition',
    shortDescription: 'Une collection d\'œuvres d\'art contemporain.',
    genre: ['Art'],
    tags: ['exposition', 'art', 'moderne'],
    startDate: new Date('2025-09-01T10:00:00'),
    endDate: new Date('2025-09-30T18:00:00'),
    isFreeEvent: true,
    locations: [
      {
        locationId: 105,
        name: 'Galerie d\'Art',
        maxCapacity: 300,
        ticketCount: null,
        ticketPrice: null,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Explorez les dernières tendances de l\'art moderne dans cette exposition. Plus de 50 artistes de 15 pays différents présentent leurs œuvres les plus récentes, avec un accent particulier sur l\'art numérique et les installations interactives.',
    links: ['https://galeriedart.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1051/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1052/600/400'],
    status: 'published',
    createdByStructureId: 5,
    createdAt: new Date('2025-02-25T11:00:00'),
    updatedAt: new Date('2025-04-21T13:00:00')
  },
  {
    id: 6,
    name: 'Concert Jazz en Plein Air',
    category: 'Music',
    shortDescription: 'Une soirée jazz sous les étoiles.',
    genre: ['Jazz'],
    tags: ['concert', 'jazz', 'plein air'],
    startDate: new Date('2025-07-20T19:00:00'),
    endDate: new Date('2025-07-20T22:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 106,
        name: 'Place du Marché',
        maxCapacity: 1000,
        ticketCount: 950,
        ticketPrice: 35.00,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Venez écouter les meilleurs musiciens de jazz dans un cadre convivial. Un quintette de jazz renommé interprètera des classiques et des compositions originales sous le ciel étoilé.',
    links: ['https://concertjazz.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1061/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1062/600/400'],
    status: 'published',
    createdByStructureId: 1,
    createdAt: new Date('2025-03-10T14:00:00'),
    updatedAt: new Date('2025-04-23T16:00:00')
  },
  {
    id: 7,
    name: 'Festival de Théâtre Contemporain',
    category: 'Theater',
    shortDescription: 'Des pièces innovantes et audacieuses.',
    genre: ['Contemporain'],
    tags: ['festival', 'théâtre', 'contemporain'],
    startDate: new Date('2025-10-05T18:00:00'),
    endDate: new Date('2025-10-10T22:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 107,
        name: 'Théâtre Moderne',
        maxCapacity: 600,
        ticketCount: 600,
        ticketPrice: 40.00,
        active: true
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Une semaine de théâtre contemporain avec des artistes émergents. Découvrez des œuvres originales qui repoussent les limites du théâtre traditionnel et explorent des thèmes actuels.',
    links: ['https://festivaltheatre.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1071/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1072/600/400'],
    status: 'published',
    createdByStructureId: 2,
    createdAt: new Date('2025-04-01T10:00:00'),
    updatedAt: new Date('2025-04-25T12:00:00')
  },
  {
    id: 8,
    name: 'Compétition de Skateboard',
    category: 'Sport',
    shortDescription: 'Des skateurs de haut niveau s\'affrontent.',
    genre: ['Skateboard'],
    tags: ['sport', 'skateboard', 'compétition'],
    startDate: new Date('2025-06-25T14:00:00'),
    endDate: new Date('2025-06-25T18:00:00'),
    isFreeEvent: true,
    locations: [
      {
        locationId: 108,
        name: 'Parc des Sports',
        maxCapacity: 1500,
        ticketCount: null,
        ticketPrice: null,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Venez encourager les meilleurs skateurs dans cette compétition locale. Des athlètes de tous âges s\'affronteront dans trois catégories : street, vert et freestyle.',
    links: ['https://skateboardcomp.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1081/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1082/600/400'],
    status: 'published',
    createdByStructureId: 3,
    createdAt: new Date('2025-03-15T09:00:00'),
    updatedAt: new Date('2025-04-20T11:00:00')
  },
  {
    id: 9,
    name: 'Salon du Livre',
    category: 'Exhibition',
    shortDescription: 'Rencontrez vos auteurs préférés.',
    genre: ['Littérature'],
    tags: ['salon', 'livre', 'auteurs'],
    startDate: new Date('2025-11-10T10:00:00'),
    endDate: new Date('2025-11-15T18:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 109,
        name: 'Centre Culturel',
        maxCapacity: 1000,
        ticketCount: 1000,
        ticketPrice: 15.00,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Un salon dédié aux passionnés de lecture et d\'écriture. Plus de 200 auteurs seront présents pour des séances de dédicaces, et de nombreuses conférences et ateliers d\'écriture seront organisés tout au long de l\'événement.',
    links: ['https://salondulivre.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1091/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1092/600/400'],
    status: 'published',
    createdByStructureId: 5,
    createdAt: new Date('2025-04-01T08:00:00'),
    updatedAt: new Date('2025-04-26T10:00:00')
  },
  {
    id: 10,
    name: 'Festival de Cinéma Indépendant',
    category: 'Festival',
    shortDescription: 'Projection de films indépendants et rencontres avec les réalisateurs.',
    genre: ['Cinéma'],
    tags: ['festival', 'cinéma', 'indépendant'],
    startDate: new Date('2025-12-01T18:00:00'),
    endDate: new Date('2025-12-07T23:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 110,
        name: 'Cinéma Central',
        maxCapacity: 400,
        ticketCount: 400,
        ticketPrice: 20.00,
        active: true
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    fullDescription: 'Une semaine dédiée au cinéma indépendant avec des projections et débats. Le festival présente plus de 50 films de tous genres, des courts aux longs métrages, ainsi que des masterclass avec des réalisateurs reconnus.',
    links: ['https://festivalcinemaindependant.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1101/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1102/600/400'],
    status: 'published',
    createdByStructureId: 4,
    createdAt: new Date('2025-05-01T10:00:00'),
    updatedAt: new Date('2025-05-10T12:00:00')
  },
  // Événements supplémentaires
  {
    id: 11,
    name: 'Rock The Night 2025',
    category: 'Music',
    shortDescription: 'Le concert rock de l\'année !',
    genre: ['Rock', 'Metal'],
    tags: ['concert', 'rock', 'soirée'],
    startDate: new Date('2025-11-15T20:00:00'),
    endDate: new Date('2025-11-15T23:59:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 111,
        name: 'Arène Centrale',
        maxCapacity: 2500,
        ticketCount: 2500,
        ticketPrice: 50.00,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Préparez-vous pour Rock The Night 2025, une soirée explosive avec les meilleurs groupes de rock du moment ! Line-up incluant "The Electric Waves", "Crimson Haze", et "Nova Pulse". Son et lumières spectaculaires pour une immersion totale. Stands de merchandising et rafraîchissements sur place.',
    links: ['https://rockthenight.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1111/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1112/600/400', 'https://picsum.photos/seed/1113/600/400'],
    status: 'published',
    createdByStructureId: 1,
    createdAt: new Date('2025-05-15T09:00:00'),
    updatedAt: new Date('2025-05-20T11:00:00')
  },
  {
    id: 12,
    name: 'Marathon International',
    category: 'Sport',
    shortDescription: 'Course urbaine à travers les sites emblématiques de la ville.',
    genre: ['Course à pied'],
    tags: ['marathon', 'course', 'compétition'],
    startDate: new Date('2025-04-10T08:00:00'),
    endDate: new Date('2025-04-10T14:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 112,
        name: 'Parcours Urbain',
        maxCapacity: 10000,
        ticketCount: 8000,
        ticketPrice: 60.00,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Marathon International traverse les plus beaux quartiers de la ville sur un parcours de 42,195 km. Ouvert aux coureurs professionnels et amateurs, l\'événement comprend également un semi-marathon et une course de 10 km.',
    links: ['https://marathoninternational.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1121/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1122/600/400'],
    status: 'draft',
    createdByStructureId: 3,
    createdAt: new Date('2025-01-05T11:00:00'),
    updatedAt: new Date('2025-01-20T14:00:00')
  },
  {
    id: 13,
    name: 'Symphonie sous les Étoiles',
    category: 'Music',
    shortDescription: 'Concert de musique classique en plein air.',
    genre: ['Classique'],
    tags: ['symphonie', 'orchestre', 'plein air'],
    startDate: new Date('2025-08-05T21:00:00'),
    endDate: new Date('2025-08-05T23:30:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 113,
        name: 'Jardins Botaniques',
        maxCapacity: 2000,
        ticketCount: 1800,
        ticketPrice: 40.00,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Un concert exceptionnel où l\'Orchestre Philharmonique interprète les plus grands chefs-d\'œuvre de la musique classique sous un ciel étoilé. Le programme comprend des œuvres de Mozart, Beethoven et Tchaïkovski.',
    links: ['https://symphonietoiles.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1131/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1132/600/400'],
    status: 'published',
    createdByStructureId: 2,
    createdAt: new Date('2025-03-20T13:00:00'),
    updatedAt: new Date('2025-03-25T15:00:00')
  },
  {
    id: 14,
    name: 'Festival Gastronomique',
    category: 'Festival',
    shortDescription: 'Découvrez les saveurs locales et internationales.',
    genre: ['Gastronomie'],
    tags: ['nourriture', 'cuisine', 'dégustation'],
    startDate: new Date('2025-09-20T11:00:00'),
    endDate: new Date('2025-09-22T22:00:00'),
    isFreeEvent: true,
    locations: [
      {
        locationId: 114,
        name: 'Place Centrale',
        maxCapacity: 5000,
        ticketCount: null,
        ticketPrice: null,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Festival Gastronomique réunit les meilleurs chefs et artisans de la région et d\'ailleurs. Au programme : dégustations, démonstrations culinaires, ateliers et concours gastronomiques.',
    links: ['https://festivalgastronomique.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1141/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1142/600/400', 'https://picsum.photos/seed/1143/600/400'],
    status: 'published',
    createdByStructureId: 5,
    createdAt: new Date('2025-05-05T09:30:00'),
    updatedAt: new Date('2025-05-15T10:45:00')
  },
  {
    id: 15,
    name: 'Conférence sur le Changement Climatique',
    category: 'Conference',
    shortDescription: 'Experts et scientifiques débattent des solutions durables.',
    genre: ['Environnement'],
    tags: ['climat', 'écologie', 'conférence'],
    startDate: new Date('2025-10-22T09:00:00'),
    endDate: new Date('2025-10-24T18:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 115,
        name: 'Centre de Conventions',
        maxCapacity: 1200,
        ticketCount: 1000,
        ticketPrice: 85.00,
        active: true
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Cette conférence internationale rassemble experts, chercheurs et décideurs autour des défis du changement climatique. Trois jours de présentations, tables rondes et ateliers pour explorer les solutions innovantes et les politiques environnementales.',
    links: ['https://climatechangeconference.org'],
    mainPhotoUrl: 'https://picsum.photos/seed/1151/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1152/600/400'],
    status: 'pending_approval',
    createdByStructureId: 4,
    createdAt: new Date('2025-04-15T14:00:00'),
    updatedAt: new Date('2025-04-30T16:30:00')
  }
];

/**
 * Événements supplémentaires en brouillon (à utiliser pour tester les fonctionnalités de publication)
 */
export const mockDraftEvents: Event[] = [
  {
    id: 16,
    name: 'Gala de Danse Contemporaine',
    category: 'Theater',
    shortDescription: 'Une soirée de mouvements fluides et d\'émotions intenses.',
    genre: ['Danse'],
    tags: ['danse', 'contemporain', 'gala'],
    startDate: new Date('2025-11-30T19:30:00'),
    endDate: new Date('2025-11-30T22:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 116,
        name: 'Opéra Municipal',
        maxCapacity: 900,
        ticketCount: 900,
        ticketPrice: 55.00,
        active: true
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Le Gala de Danse Contemporaine présente les créations de chorégraphes innovants interprétées par des danseurs de talent. Une exploration des limites du corps humain et des émotions à travers le mouvement.',
    links: ['https://galadanse.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1161/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1162/600/400'],
    status: 'draft' as EventStatus,
    createdByStructureId: 2,
    createdAt: new Date('2025-06-01T10:00:00'),
    updatedAt: new Date('2025-06-01T10:00:00')
  },
  {
    id: 17,
    name: 'Hackathon Innovation Tech',
    category: 'Conference',
    shortDescription: 'Développeurs et créateurs s\'unissent pour coder le futur.',
    genre: ['Technologie'],
    tags: ['hackathon', 'programmation', 'innovation'],
    startDate: new Date('2025-08-28T09:00:00'),
    endDate: new Date('2025-08-30T18:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 117,
        name: 'Hub Technologique',
        maxCapacity: 300,
        ticketCount: 300,
        ticketPrice: 20.00,
        active: true
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: '48 heures non-stop de créativité et de code. Relevez les défis proposés par nos sponsors, formez votre équipe et développez des solutions innovantes. Prix à gagner et opportunités de networking.',
    links: ['https://techhackathon.dev'],
    mainPhotoUrl: 'https://picsum.photos/seed/1171/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1172/600/400'],
    status: 'draft' as EventStatus,
    createdByStructureId: 4,
    createdAt: new Date('2025-06-05T11:30:00'),
    updatedAt: new Date('2025-06-05T11:30:00')
  }
];

/**
 * Événements annulés (pour tester les filtres et affichages spécifiques)
 */
export const mockCancelledEvents: Event[] = [
  {
    id: 18,
    name: 'Festival de Musique Électronique',
    category: 'Festival',
    shortDescription: 'Une expérience sonore et visuelle incomparable.',
    genre: ['Électronique'],
    tags: ['festival', 'électronique', 'DJ'],
    startDate: new Date('2025-07-25T20:00:00'),
    endDate: new Date('2025-07-27T06:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 118,
        name: 'Zone Industrielle',
        maxCapacity: 8000,
        ticketCount: 8000,
        ticketPrice: 75.00,
        active: true
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Le plus grand festival de musique électronique de la région avec des DJs internationaux, une scénographie impressionnante et des performances visuelles.',
    links: ['https://electrofestival.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1181/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1182/600/400'],
    status: 'cancelled' as EventStatus,
    createdByStructureId: 1,
    createdAt: new Date('2025-02-15T09:00:00'),
    updatedAt: new Date('2025-06-10T14:00:00')
  },
  {
    id: 19,
    name: 'Tournoi International d\'Échecs',
    category: 'Other',
    shortDescription: 'Compétition d\'échecs de haut niveau.',
    genre: ['Jeux de stratégie'],
    tags: ['échecs', 'tournoi', 'compétition'],
    startDate: new Date('2025-05-15T09:00:00'),
    endDate: new Date('2025-05-17T18:00:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 119,
        name: 'Grand Hôtel',
        maxCapacity: 300,
        ticketCount: 300,
        ticketPrice: 30.00,
        active: true
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Un tournoi d\'échecs prestigieux avec des joueurs internationaux et des maîtres du jeu. Les matchs seront commentés en direct par des experts.',
    links: ['https://tournoiechecs.org'],
    mainPhotoUrl: 'https://picsum.photos/seed/1191/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1192/600/400'],
    status: 'cancelled' as EventStatus,
    createdByStructureId: 4,
    createdAt: new Date('2025-01-05T10:30:00'),
    updatedAt: new Date('2025-04-05T11:45:00')
  }
];

/**
 * Événements en attente d'approbation (pour tester le workflow d'approbation)
 */
export const mockPendingEvents: Event[] = [
  {
    id: 20,
    name: 'Spectacle de Cirque Contemporain',
    category: 'Theater',
    shortDescription: 'Une fusion de cirque, danse et théâtre.',
    genre: ['Cirque'],
    tags: ['cirque', 'acrobaties', 'spectacle'],
    startDate: new Date('2025-08-10T19:30:00'),
    endDate: new Date('2025-08-10T21:30:00'),
    isFreeEvent: false,
    locations: [
      {
        locationId: 120,
        name: 'Chapiteau Central',
        maxCapacity: 700,
        ticketCount: 700,
        ticketPrice: 35.00,
        active: true
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Un spectacle innovant qui combine les arts du cirque, la danse contemporaine et les techniques théâtrales pour créer une expérience immersive unique.',
    links: ['https://cirquecontemporain.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/2001/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/2002/600/400'],
    status: 'pending_approval' as EventStatus,
    createdByStructureId: 2,
    createdAt: new Date('2025-06-15T11:00:00'),
    updatedAt: new Date('2025-06-15T11:00:00')
  },
  {
    id: 21,
    name: 'Festival de Poésie',
    category: 'Festival',
    shortDescription: 'Lectures, performances et ateliers poétiques.',
    genre: ['Littérature'],
    tags: ['poésie', 'littérature', 'festival'],
    startDate: new Date('2025-09-25T14:00:00'),
    endDate: new Date('2025-09-27T22:00:00'),
    isFreeEvent: true,
    locations: [
      {
        locationId: 121,
        name: 'Maison de la Poésie',
        maxCapacity: 200,
        ticketCount: null,
        ticketPrice: null,
        active: true
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Trois jours dédiés à la poésie sous toutes ses formes : classique, moderne, slam, performances, ateliers d\'écriture et rencontres avec des poètes renommés.',
    links: ['https://festivalpoesie.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/2011/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/2012/600/400'],
    status: 'pending_approval' as EventStatus,
    createdByStructureId: 5,
    createdAt: new Date('2025-06-20T09:15:00'),
    updatedAt: new Date('2025-06-20T09:15:00')
  }
];

/**
 * Helper function pour combiner tous les événements
 */
export function getAllEvents(): Event[] {
  return [
    ...mockEvents,
    ...mockDraftEvents,
    ...mockCancelledEvents,
    ...mockPendingEvents
  ];
}

/**
 * Helper function pour filtrer les événements par statut
 */
export function getEventsByStatus(status: EventStatus): Event[] {
  return getAllEvents().filter(event => event.status === status);
}

/**
 * Helper function pour obtenir les événements populaires (basé sur le nombre de billets vendus)
 */
export function getPopularEvents(count: number = 5): Event[] {
  return [...mockEvents]
    .filter(event => event.status === 'published')
    .sort((a, b) => {
      const soldA = a.locations.reduce((sum, loc) => sum + (loc.ticketCount || 0), 0);
      const soldB = b.locations.reduce((sum, loc) => sum + (loc.ticketCount || 0), 0);
      return soldB - soldA;
    })
    .slice(0, count);
}

/**
 * Helper function pour obtenir les événements à venir (après la date actuelle)
 */
export function getUpcomingEvents(count: number = 5): Event[] {
  const now = new Date();
  return [...mockEvents]
    .filter(event => event.status === 'published' && new Date(event.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, count);
}

/**
 * Helper function pour obtenir les événements par structure
 */
export function getEventsByStructure(structureId: number): Event[] {
  return getAllEvents().filter(event => event.createdByStructureId === structureId);
}

/**
 * Helper function pour rechercher des événements par terme
 */

/**
 * Recherche des événements selon des critères
 */
export function searchEvents(
  events: Event[],
  searchQuery?: string,
  sortBy: keyof Event = 'startDate',
  sortDirection: 'asc' | 'desc' = 'desc'
): Event[] {
  let filteredEvents = [...events];

  // Filtre par recherche textuelle
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredEvents = filteredEvents.filter(event =>
      event.name.toLowerCase().includes(query) ||
      (event.shortDescription && event.shortDescription.toLowerCase().includes(query)) ||
      (event.fullDescription && event.fullDescription.toLowerCase().includes(query))
    );
  }

  // Tri des résultats
  return [...filteredEvents].sort((a, b) => {
    let valA: any = a[sortBy];
    let valB: any = b[sortBy];

    // Gestion des valeurs undefined ou null
    if (valA === undefined || valA === null) return sortDirection === 'asc' ? -1 : 1;
    if (valB === undefined || valB === null) return sortDirection === 'asc' ? 1 : -1;

    // Comparaison pour les dates
    if (valA instanceof Date && valB instanceof Date) {
      return sortDirection === 'asc'
        ? valA.getTime() - valB.getTime()
        : valB.getTime() - valA.getTime();
    }

    // Comparaison pour les chaînes de caractères (ignorer la casse)
    if (typeof valA === 'string' && typeof valB === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    // Comparaison standard
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}
