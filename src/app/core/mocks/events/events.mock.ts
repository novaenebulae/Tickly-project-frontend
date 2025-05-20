// src/app/core/mocks/events/events.mock.ts

import {EventModel, EventStatus} from '../../models/event/event.model';
import {EventCategoryModel} from '../../models/event/event-category.model';
import {SeatingType} from '../../models/event/seating.model';
import {AddressModel} from '../../models/structure/address.model';
import {EventSearchParams} from '../../models/event/event-search-params.model';

/**
 * Liste des événements mockés pour le développement et les tests
 */
export const mockEvents: EventModel[] = [
  {
    id: 1,
    name: 'Festival de Musique d\'été',
    category: {id: 6, name: 'Festival'},
    shortDescription: 'Un festival vibrant avec des artistes internationaux.',
    tags: ['été', 'musique', 'plein air'],
    startDate: new Date('2025-07-10T18:00:00'),
    endDate: new Date('2025-07-12T23:00:00'),
    address: {
      street: 'Avenue du Parc',
      city: 'Paris',
      zipCode: '75001',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 101,
        name: 'Parc Central',
        areaId: 101,
        maxCapacity: 5000,
        ticketPrice: 45.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Profitez de trois jours de musique live avec des groupes et artistes renommés. Le festival comprend trois scènes, des zones de restauration et des espaces de repos. Des groupes nationaux et internationaux se produiront tout au long du weekend.',
    links: ['https://festivalmusiqueete.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1011/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1012/600/400', 'https://picsum.photos/seed/1013/600/400'],
    status: 'published',
    createdAt: new Date('2025-01-15T10:00:00'),
    updatedAt: new Date('2025-04-20T15:30:00')
  },
  {
    id: 2,
    name: 'Théâtre Classique: Roméo et Juliette',
    category: {id: 2, name: 'Theater'},
    shortDescription: 'Une représentation émouvante de la tragédie de Shakespeare.',
    tags: ['théâtre', 'classique', 'roméo'],
    startDate: new Date('2025-06-05T20:00:00'),
    endDate: new Date('2025-06-05T22:30:00'),
    address: {
      street: 'Rue du Théâtre',
      city: 'Lyon',
      zipCode: '69002',
      country: 'France'
    },
    structureId: 2,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 102,
        name: 'Théâtre Royal',
        areaId: 102,
        maxCapacity: 800,
        ticketPrice: 30.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 40
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Une mise en scène moderne de la célèbre pièce de Shakespeare. Une réinterprétation de la pièce classique avec des costumes contemporains et une mise en scène innovante qui met en valeur la rivalité entre les familles.',
    links: ['https://theatreroyal.com/romeo-juliette'],
    mainPhotoUrl: 'https://picsum.photos/seed/1021/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1022/600/400'],
    status: 'published',
    createdAt: new Date('2025-02-10T09:00:00'),
    updatedAt: new Date('2025-04-18T11:00:00')
  },
  {
    id: 3,
    name: 'Match de Football: Équipe A vs Équipe B',
    category: {id: 3, name: 'Sport'},
    shortDescription: 'Un match passionnant entre deux équipes rivales.',
    tags: ['sport', 'football', 'match'],
    startDate: new Date('2025-05-20T15:00:00'),
    endDate: new Date('2025-05-20T17:00:00'),
    address: {
      street: 'Boulevard du Stade',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France'
    },
    structureId: 3,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 103,
        name: 'Tribunes Nord',
        areaId: 103,
        maxCapacity: 10000,
        ticketPrice: 25.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 104,
        name: 'Tribunes Sud',
        areaId: 104,
        maxCapacity: 10000,
        ticketPrice: 25.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Venez encourager votre équipe favorite dans ce match décisif. Le championnat entre dans sa phase finale et ce match pourrait être déterminant pour la qualification en phases finales.',
    links: ['https://stademunicipal.com/match'],
    mainPhotoUrl: 'https://picsum.photos/seed/1031/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1032/600/400'],
    status: 'published',
    createdAt: new Date('2025-03-01T12:00:00'),
    updatedAt: new Date('2025-04-22T14:00:00')
  },
  {
    id: 4,
    name: 'Conférence Tech: L\'avenir de l\'IA',
    category: {id: 4, name: 'Conference'},
    shortDescription: 'Découvrez les dernières avancées en intelligence artificielle.',
    tags: ['conférence', 'IA', 'tech'],
    startDate: new Date('2025-08-15T09:00:00'),
    endDate: new Date('2025-08-15T17:00:00'),
    address: {
      street: 'Avenue des Congrès',
      city: 'Paris',
      zipCode: '75015',
      country: 'France'
    },
    structureId: 4,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 105,
        name: 'Amphithéâtre Principal',
        areaId: 105,
        maxCapacity: 1500,
        ticketPrice: 100.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Une journée complète de conférences et ateliers sur l\'intelligence artificielle. Des experts internationaux présentent les dernières innovations et débattent des implications éthiques et sociétales des IA avancées.',
    links: ['https://conferenceia.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1041/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1042/600/400'],
    status: 'published',
    createdAt: new Date('2025-01-20T08:00:00'),
    updatedAt: new Date('2025-04-19T10:00:00')
  },
  {
    id: 5,
    name: 'Exposition d\'Art Moderne',
    category: {id: 5, name: 'Exhibition'},
    shortDescription: 'Une collection d\'œuvres d\'art contemporain.',
    tags: ['exposition', 'art', 'moderne'],
    startDate: new Date('2025-09-01T10:00:00'),
    endDate: new Date('2025-09-30T18:00:00'),
    address: {
      street: 'Rue des Beaux Arts',
      city: 'Nice',
      zipCode: '06000',
      country: 'France'
    },
    structureId: 5,
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 106,
        name: 'Galerie Principale',
        areaId: 106,
        maxCapacity: 300,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Explorez les dernières tendances de l\'art moderne dans cette exposition. Plus de 50 artistes de 15 pays différents présentent leurs œuvres les plus récentes, avec un accent particulier sur l\'art numérique et les installations interactives.',
    links: ['https://galeriedart.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1051/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1052/600/400'],
    status: 'published',
    createdAt: new Date('2025-02-25T11:00:00'),
    updatedAt: new Date('2025-04-21T13:00:00')
  },
  {
    id: 6,
    name: 'Concert Jazz en Plein Air',
    category: {id: 1, name: 'Music'},
    shortDescription: 'Une soirée jazz sous les étoiles.',
    tags: ['concert', 'jazz', 'plein air'],
    startDate: new Date('2025-07-20T19:00:00'),
    endDate: new Date('2025-07-20T22:00:00'),
    address: {
      street: 'Place du Marché',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 107,
        name: 'Espace Central',
        areaId: 107,
        maxCapacity: 1000,
        ticketPrice: 35.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Venez écouter les meilleurs musiciens de jazz dans un cadre convivial. Un quintette de jazz renommé interprètera des classiques et des compositions originales sous le ciel étoilé.',
    links: ['https://concertjazz.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1061/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1062/600/400'],
    status: 'published',
    createdAt: new Date('2025-03-10T14:00:00'),
    updatedAt: new Date('2025-04-23T16:00:00')
  },
  {
    id: 7,
    name: 'Festival de Théâtre Contemporain',
    category: {id: 2, name: 'Theater'},
    shortDescription: 'Des pièces innovantes et audacieuses.',
    tags: ['festival', 'théâtre', 'contemporain'],
    startDate: new Date('2025-10-05T18:00:00'),
    endDate: new Date('2025-10-10T22:00:00'),
    address: {
      street: 'Avenue du Théâtre',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France'
    },
    structureId: 2,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 108,
        name: 'Salle Principale',
        areaId: 108,
        maxCapacity: 600,
        ticketPrice: 40.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 15,
        seatsPerRow: 40
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Une semaine de théâtre contemporain avec des artistes émergents. Découvrez des œuvres originales qui repoussent les limites du théâtre traditionnel et explorent des thèmes actuels.',
    links: ['https://festivaltheatre.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1071/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1072/600/400'],
    status: 'published',
    createdAt: new Date('2025-04-01T10:00:00'),
    updatedAt: new Date('2025-04-25T12:00:00')
  },
  {
    id: 8,
    name: 'Compétition de Skateboard',
    category: {id: 3, name: 'Sport'},
    shortDescription: 'Des skateurs de haut niveau s\'affrontent.',
    tags: ['sport', 'skateboard', 'compétition'],
    startDate: new Date('2025-06-25T14:00:00'),
    endDate: new Date('2025-06-25T18:00:00'),
    address: {
      street: 'Parc des Sports',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France'
    },
    structureId: 3,
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 109,
        name: 'Espace Skatepark',
        areaId: 109,
        maxCapacity: 1500,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Venez encourager les meilleurs skateurs dans cette compétition locale. Des athlètes de tous âges s\'affronteront dans trois catégories : street, vert et freestyle.',
    links: ['https://skateboardcomp.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1081/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1082/600/400'],
    status: 'published',
    createdAt: new Date('2025-03-15T09:00:00'),
    updatedAt: new Date('2025-04-20T11:00:00')
  },
  {
    id: 9,
    name: 'Salon du Livre',
    category: {id: 5, name: 'Exhibition'},
    shortDescription: 'Rencontrez vos auteurs préférés.',
    tags: ['salon', 'livre', 'auteurs'],
    startDate: new Date('2025-11-10T10:00:00'),
    endDate: new Date('2025-11-15T18:00:00'),
    address: {
      street: 'Place de la Culture',
      city: 'Lille',
      zipCode: '59000',
      country: 'France'
    },
    structureId: 5,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 110,
        name: 'Espace Principal',
        areaId: 110,
        maxCapacity: 1000,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 111,
        name: 'Espace Conférences',
        areaId: 111,
        maxCapacity: 300,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 10,
        seatsPerRow: 30
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le plus grand salon du livre de la région avec plus de 200 auteurs présents. Des séances de dédicaces, des tables rondes et des ateliers d\'écriture sont au programme de cet événement incontournable pour tous les amoureux de la littérature.',
    links: ['https://salondulivre.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1091/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1092/600/400'],
    status: 'published',
    createdAt: new Date('2025-03-20T08:00:00'),
    updatedAt: new Date('2025-04-22T10:00:00')
  },
  {
    id: 10,
    name: 'Atelier de Peinture pour Débutants',
    category: {id: 7, name: 'Other'},
    shortDescription: 'Apprenez les bases de la peinture à l\'huile.',
    tags: ['atelier', 'peinture', 'débutant'],
    startDate: new Date('2025-05-15T14:00:00'),
    endDate: new Date('2025-05-15T17:00:00'),
    address: {
      street: 'Rue des Arts',
      city: 'Nantes',
      zipCode: '44000',
      country: 'France'
    },
    structureId: 6,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 112,
        name: 'Atelier',
        areaId: 112,
        maxCapacity: 20,
        ticketPrice: 50.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Cet atelier de 3 heures vous initiera aux techniques de base de la peinture à l\'huile. Matériel fourni, aucune expérience préalable nécessaire. À la fin de la séance, vous repartirez avec votre propre création.',
    links: ['https://atelierartistique.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1101/600/400',
    eventPhotoUrls: [],
    status: 'published',
    createdAt: new Date('2025-04-05T09:00:00'),
    updatedAt: new Date('2025-04-24T11:00:00')
  }
];

/**
 * Événement en brouillon pour les tests
 */
export const draftEvent: EventModel = {
  id: 11,
  name: 'Festival de Jazz 2026 (Brouillon)',
  category: {id: 1, name: 'Music'},
  shortDescription: 'Préparez-vous pour la 10ème édition de notre festival de jazz.',
  fullDescription: 'La programmation est en cours de finalisation. Une dizaine d\'artistes internationaux sont attendus pour célébrer cet événement anniversaire.',
  tags: ['jazz', 'festival', 'musique'],
  startDate: new Date('2026-06-01T18:00:00'),
  endDate: new Date('2026-06-03T23:00:00'),
  address: {
    street: 'Avenue du Jazz',
    city: 'Paris',
    zipCode: '75001',
    country: 'France'
  },
  structureId: 1,
  isFreeEvent: false,
  defaultSeatingType: SeatingType.MIXED,
  seatingZones: [
    {
      id: 113,
      name: 'Zone VIP',
      areaId: 113,
      maxCapacity: 500,
      ticketPrice: 100.00,
      isActive: true,
      seatingType: SeatingType.SEATED
    },
    {
      id: 114,
      name: 'Zone Standard',
      areaId: 114,
      maxCapacity: 2000,
      ticketPrice: 50.00,
      isActive: true,
      seatingType: SeatingType.STANDING
    }
  ],
  displayOnHomepage: false,
  isFeaturedEvent: false,
  links: [],
  mainPhotoUrl: 'https://picsum.photos/seed/1201/600/400',
  status: 'draft',
  createdAt: new Date('2025-04-10T10:00:00'),
  updatedAt: new Date('2025-04-10T10:00:00')
};

/**
 * Événements supplémentaires pour les tests
 */
export const additionalMockEvents: EventModel[] = [
  draftEvent,
  {
    id: 12,
    name: 'Exposition Photo "Nature Sauvage"',
    category: {id: 5, name: 'Exhibition'},
    shortDescription: 'Des clichés exceptionnels de la nature sauvage.',
    fullDescription: 'Découvrez le travail de 5 photographes animaliers renommés qui ont parcouru le monde pendant des années pour capturer ces instants uniques de la vie sauvage.',
    tags: ['photo', 'nature', 'animaux'],
    startDate: new Date('2025-12-01T10:00:00'),
    endDate: new Date('2025-12-20T18:00:00'),
    address: {
      street: 'Galerie de la Nature',
      city: 'Strasbourg',
      zipCode: '67000',
      country: 'France'
    },
    structureId: 5,
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 115,
        name: 'Salle d\'exposition',
        areaId: 115,
        maxCapacity: 200,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    links: ['https://expo-photo-nature.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1301/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1302/600/400', 'https://picsum.photos/seed/1303/600/400'],
    status: 'published',
    createdAt: new Date('2025-04-15T11:00:00'),
    updatedAt: new Date('2025-04-15T11:00:00')
  }
]

// Ajout d'événements supplémentaires pour compléter allMockEvent
// Événements avec différents statuts
export const eventsWithDifferentStatuses: EventModel[] = [
  {
    id: 13,
    name: 'Conférence Annuelle Tech (Annulée)',
    category: {id: 4, name: 'Conference'},
    shortDescription: 'La conférence a été annulée en raison de problèmes logistiques.',
    fullDescription: 'Nous sommes désolés de vous informer que la conférence tech prévue a dû être annulée pour des raisons indépendantes de notre volonté. Les billets achetés seront intégralement remboursés.',
    tags: ['technologie', 'conférence', 'annulée'],
    startDate: new Date('2025-09-05T09:00:00'),
    endDate: new Date('2025-09-05T18:00:00'),
    address: {
      street: 'Centre de Conférences',
      city: 'Paris',
      zipCode: '75016',
      country: 'France'
    },
    structureId: 4,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 116,
        name: 'Auditorium Principal',
        areaId: 116,
        maxCapacity: 800,
        ticketPrice: 120.00,
        isActive: false,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    links: ['https://techconference.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1401/600/400',
    eventPhotoUrls: [],
    status: 'cancelled',
    createdAt: new Date('2025-03-01T09:00:00'),
    updatedAt: new Date('2025-04-20T14:00:00')
  },
  {
    id: 14,
    name: 'Marathon de Paris',
    category: {id: 3, name: 'Sport'},
    shortDescription: 'Le marathon annuel de Paris.',
    fullDescription: 'Participez au marathon de Paris, l\'un des plus grands marathons internationaux. Parcours de 42,195 km à travers les plus beaux monuments de la capitale.',
    tags: ['marathon', 'course', 'paris'],
    startDate: new Date('2025-04-12T08:00:00'),
    endDate: new Date('2025-04-12T16:00:00'),
    address: {
      street: 'Avenue des Champs-Élysées',
      city: 'Paris',
      zipCode: '75008',
      country: 'France'
    },
    structureId: 3,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 117,
        name: 'Participant Coureur',
        areaId: 117,
        maxCapacity: 50000,
        ticketPrice: 80.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    links: ['https://marathondeparis.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1501/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1502/600/400'],
    status: 'completed',
    createdAt: new Date('2024-10-10T10:00:00'),
    updatedAt: new Date('2025-04-15T09:00:00')
  },
  {
    id: 15,
    name: 'Festival de Cannes 2025',
    category: {id: 6, name: 'Festival'},
    shortDescription: 'Le célèbre festival international du film.',
    fullDescription: 'La 78ème édition du Festival de Cannes réunira les plus grands noms du cinéma mondial. Projections de films, tapis rouge et compétition officielle pour la Palme d\'or.',
    tags: ['festival', 'cinéma', 'cannes'],
    startDate: new Date('2025-05-14T09:00:00'),
    endDate: new Date('2025-05-25T23:59:00'),
    address: {
      street: 'Palais des Festivals',
      city: 'Cannes',
      zipCode: '06400',
      country: 'France'
    },
    structureId: 7,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 118,
        name: 'Grand Théâtre Lumière',
        areaId: 118,
        maxCapacity: 2300,
        ticketPrice: 200.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 119,
        name: 'Salle Debussy',
        areaId: 119,
        maxCapacity: 1000,
        ticketPrice: 150.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    links: ['https://festival-cannes.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1601/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1602/600/400', 'https://picsum.photos/seed/1603/600/400'],
    status: 'pending_approval',
    createdAt: new Date('2025-01-10T11:00:00'),
    updatedAt: new Date('2025-04-01T15:00:00')
  }
];

// Événements à venir
export const upcomingEvents: EventModel[] = [
  {
    id: 16,
    name: 'Spectacle de Ballet "Le Lac des Cygnes"',
    category: {id: 2, name: 'Theater'},
    shortDescription: 'Une représentation classique du célèbre ballet.',
    fullDescription: 'Le Ballet National présente "Le Lac des Cygnes" de Tchaïkovski dans une mise en scène respectueuse de la tradition mais avec une touche moderne dans les décors.',
    tags: ['ballet', 'danse', 'classique'],
    startDate: new Date('2025-08-03T20:00:00'),
    endDate: new Date('2025-08-03T22:30:00'),
    address: {
      street: 'Opéra Municipal',
      city: 'Lyon',
      zipCode: '69001',
      country: 'France'
    },
    structureId: 8,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 120,
        name: 'Orchestre',
        areaId: 120,
        maxCapacity: 400,
        ticketPrice: 80.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 121,
        name: 'Balcon',
        areaId: 121,
        maxCapacity: 200,
        ticketPrice: 50.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    links: ['https://operalyon.com/cygnes'],
    mainPhotoUrl: 'https://picsum.photos/seed/1701/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1702/600/400'],
    status: 'published',
    createdAt: new Date('2025-03-20T14:00:00'),
    updatedAt: new Date('2025-04-05T09:00:00')
  },
  {
    id: 17,
    name: 'Salon de l\'Agriculture 2026',
    category: {id: 5, name: 'Exhibition'},
    shortDescription: 'Le rendez-vous annuel du monde agricole.',
    fullDescription: 'Découvrez le monde agricole, ses animaux, ses produits et ses innovations. Dégustations, démonstrations et présentations d\'animaux sont au programme de cette édition.',
    tags: ['agriculture', 'salon', 'animaux'],
    startDate: new Date('2026-02-20T09:00:00'),
    endDate: new Date('2026-03-01T19:00:00'),
    address: {
      street: 'Parc des Expositions',
      city: 'Paris',
      zipCode: '75015',
      country: 'France'
    },
    structureId: 9,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 122,
        name: 'Pass Général',
        areaId: 122,
        maxCapacity: 100000,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    links: ['https://salon-agriculture.com'],
    mainPhotoUrl: 'https://picsum.photos/seed/1801/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1802/600/400'],
    status: 'published',
    createdAt: new Date('2025-04-10T10:00:00'),
    updatedAt: new Date('2025-04-10T10:00:00')
  }
];

// Événements gratuits
export const freeEvents: EventModel[] = [
  {
    id: 18,
    name: 'Festival de Street Art',
    category: {id: 6, name: 'Festival'},
    shortDescription: 'Découvrez l\'art urbain en direct.',
    fullDescription: 'Des artistes de street art nationaux et internationaux se réuniront pour créer des œuvres en direct. Ateliers d\'initiation au graffiti et à d\'autres techniques d\'art urbain pour tous les âges.',
    tags: ['street art', 'gratuit', 'urbain'],
    startDate: new Date('2025-07-05T11:00:00'),
    endDate: new Date('2025-07-06T19:00:00'),
    address: {
      street: 'Friche Industrielle',
      city: 'Marseille',
      zipCode: '13003',
      country: 'France'
    },
    structureId: 10,
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 123,
        name: 'Espace principal',
        areaId: 123,
        maxCapacity: 2000,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    links: ['https://streetartfest.fr'],
    mainPhotoUrl: 'https://picsum.photos/seed/1901/600/400',
    eventPhotoUrls: ['https://picsum.photos/seed/1902/600/400'],
    status: 'published',
    createdAt: new Date('2025-03-15T11:00:00'),
    updatedAt: new Date('2025-04-12T14:00:00')
  },
  {
    id: 19,
    name: 'Concert en Plein Air',
    category: {id: 1, name: 'Music'},
    shortDescription: 'Un concert gratuit au cœur de la ville.',
    fullDescription: 'Concert gratuit organisé par la mairie avec des artistes locaux. Musique variée allant du jazz à la pop. Restauration sur place.',
    tags: ['concert', 'gratuit', 'plein air'],
    startDate: new Date('2025-06-21T18:00:00'),
    endDate: new Date('2025-06-21T23:00:00'),
    address: {
      street: 'Place de la République',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 124,
        name: 'Place publique',
        areaId: 124,
        maxCapacity: 5000,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    links: ['https://mairie-bordeaux.fr/concerts-ete'],
    mainPhotoUrl: 'https://picsum.photos/seed/2001/600/400',
    eventPhotoUrls: [],
    status: 'published',
    createdAt: new Date('2025-04-01T09:00:00'),
    updatedAt: new Date('2025-04-15T10:00:00')
  }
];

// Mise à jour du tableau complet avec tous les événements
export const allMockEvents: EventModel[] = [
  ...mockEvents,
  ...additionalMockEvents,
  ...eventsWithDifferentStatuses,
  ...upcomingEvents,
  ...freeEvents
];

/**
 * Fonctions utilitaires pour les mocks d'événements
 */

// Récupérer les événements à venir
export function getUpcomingMockEvents(): EventModel[] {
  const today = new Date();
  return allMockEvents.filter(event =>
    new Date(event.startDate) > today &&
    event.status === 'published'
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

// Récupérer les événements pour la page d'accueil
export function getHomepageEvents(count: number = 4): EventModel[] {
  return allMockEvents
    .filter(event => event.displayOnHomepage && event.status === 'published')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, count);
}

// Récupérer les événements mis en avant
export function getFeaturedEvents(count: number = 3): EventModel[] {
  return allMockEvents
    .filter(event => event.isFeaturedEvent && event.status === 'published')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, count);
}

// Récupérer les événements par statut
export function getEventsByStatus(status: EventStatus): EventModel[] {
  return allMockEvents.filter(event => event.status === status);
}

// Récupérer les événements par structure
export function getEventsByStructure(structureId: number): EventModel[] {
  return allMockEvents.filter(event => event.structureId === structureId);
}

// Récupérer les événements par catégorie
export function getEventsByCategory(categoryId: number): EventModel[] {
  return allMockEvents.filter(event => event.category.id === categoryId);
}

// Recherche d'événements par terme
export function searchEvents(term: string): EventModel[] {
  const lowercaseTerm = term.toLowerCase();
  return allMockEvents.filter(event =>
    event.name.toLowerCase().includes(lowercaseTerm) ||
    (event.shortDescription && event.shortDescription.toLowerCase().includes(lowercaseTerm)) ||
    event.fullDescription.toLowerCase().includes(lowercaseTerm) ||
    (event.tags && event.tags.some(tag => tag.toLowerCase().includes(lowercaseTerm)))
  );
}

// Fonctions d'aide supplémentaires pour les mocks d'événements

/**
 * Récupère un événement par son identifiant
 * @param id Identifiant de l'événement à récupérer
 */
export function getMockEventById(id: number): EventModel | undefined {
  return allMockEvents.find(event => event.id === id);
}

/**
 * Récupère les événements par statut pour une structure donnée
 * @param structureId Identifiant de la structure
 * @param status Statut des événements à récupérer
 */
export function getStructureEventsByStatus(structureId: number, status: EventStatus): EventModel[] {
  return allMockEvents.filter(
    event => event.structureId === structureId && event.status === status
  );
}

/**
 * Filtre les événements selon plusieurs critères (utilisé pour la pagination et les filtres)
 * @param filters Critères de filtrage
 * @param page Numéro de la page (commence à 0)
 * @param pageSize Nombre d'éléments par page
 */
export function getFilteredEvents(events: EventModel[], filters: EventSearchParams): EventModel[] {
  console.log('Filtrage des événements avec les critères :', filters);

  return events.filter(event => {
    // Filtre par terme de recherche avec vérification de null/undefined
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const nameMatch = event.name.toLowerCase().includes(query);
      const descMatch = event.shortDescription ? event.shortDescription.toLowerCase().includes(query) : false;
      if (!nameMatch && !descMatch) return false;
    }

    // Filtre par statut
    if (filters.status && event.status !== filters.status) {
      return false;
    }

    // Filtre par mise en avant
    if (filters.featured !== undefined && event.isFeaturedEvent !== filters.featured) {
      return false;
    }

    // Filtre par gratuité
    if (filters.free !== undefined && event.isFreeEvent !== filters.free) {
      return false;
    }

    // Filtre par structure
    if (filters.structureId && event.structureId !== filters.structureId) {
      return false;
    }

    // Filtre par catégorie (tableau)
    if (filters.category) {
      const categoryMatch = filters.category.some(cat => event.category.id === cat.id);
      if (!categoryMatch) return false;
    }

    // Filtre par date avec création unique d'objets Date
    if (filters.startDate) {
      const filterStartDate = new Date(filters.startDate);
      const eventStartDate = new Date(event.startDate);
      if (eventStartDate < filterStartDate) return false;
    }

    if (filters.endDate) {
      const filterEndDate = new Date(filters.endDate);
      const eventEndDate = new Date(event.endDate);
      if (eventEndDate > filterEndDate) return false;
    }

    // Filtre par lieu avec vérification d'existence
    if (filters.location && event.address) {
      const location = filters.location.toLowerCase();
      const cityMatch = event.address.city ? event.address.city.toLowerCase().includes(location) : false;
      const streetMatch = event.address.street ? event.address.street.toLowerCase().includes(location) : false;
      if (!cityMatch && !streetMatch) return false;
    }

    return true;
  }).sort((a, b) => {

    // Gestion du tri
    if (filters.sortBy) {
      const direction = filters.sortDirection === 'desc' ? -1 : 1;

      switch (filters.sortBy) {
        case 'date':
          return direction * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'price':
          // Calculer le prix minimum pour chaque événement
          const aPrice = a.isFreeEvent ? 0 : Math.min(...a.seatingZones.map(z => z.ticketPrice));
          const bPrice = b.isFreeEvent ? 0 : Math.min(...b.seatingZones.map(z => z.ticketPrice));
          return direction * (aPrice - bPrice);
        default:
          return 0;
      }
    }

    // Par défaut, trier par date
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

/**
 * Construit un mock d'événement avec des valeurs par défaut
 * @param overrides Valeurs pour surcharger les valeurs par défaut
 */
export function buildMockEvent(overrides: Partial<EventModel> = {}): EventModel {
  // Valeurs par défaut pour un événement
  const defaultEvent: EventModel = {
    name: 'Événement par défaut',
    category: {id: 7, name: 'Other'},
    fullDescription: 'Description détaillée par défaut pour l\'événement',
    startDate: new Date(new Date().setDate(new Date().getDate() + 30)),  // Dans 30 jours
    endDate: new Date(new Date().setDate(new Date().getDate() + 30 + 2)), // Dans 32 jours (durée 2 jours)
    address: {
      street: 'Rue par défaut',
      city: 'Ville par défaut',
      zipCode: '00000',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 999,
        name: 'Zone par défaut',
        areaId: 999,
        maxCapacity: 100,
        ticketPrice: 10.00,
        isActive: true,
        seatingType: SeatingType.MIXED
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Fusionner les valeurs par défaut avec les overrides
  return {...defaultEvent, ...overrides};
}

/**
 * Génère un ID unique pour un nouvel événement
 */
export function getNextEventId(): number {
  return Math.max(...allMockEvents.map(e => e.id || 0)) + 1;
}

// Export d'objets utilitaires

/**
 * Aide pour le mapping entre les statuts frontend et backend
 */
export const eventStatusMapping = {
  draft: {label: 'Brouillon', color: 'gray'},
  published: {label: 'Publié', color: 'green'},
  pending_approval: {label: 'En attente d\'approbation', color: 'orange'},
  cancelled: {label: 'Annulé', color: 'red'},
  completed: {label: 'Terminé', color: 'blue'}
};

/**
 * Formattage des catégories pour l'affichage
 */
export const eventCategoryMapping: Record<string, { icon: string, color: string }> = {
  'Music': {icon: 'music_note', color: '#3F51B5'}, // Indigo
  'Theater': {icon: 'theater_comedy', color: '#9C27B0'}, // Purple
  'Sport': {icon: 'sports', color: '#00BCD4'}, // Cyan
  'Conference': {icon: 'mic', color: '#FF5722'}, // Deep Orange
  'Exhibition': {icon: 'palette', color: '#FF9800'}, // Orange
  'Festival': {icon: 'festival', color: '#E91E63'}, // Pink
  'Other': {icon: 'event', color: '#607D8B'} // Blue Gray
};

// Version finale pour export
export default {
  allMockEvents,
  mockEvents,
  additionalMockEvents,
  eventsWithDifferentStatuses,
  upcomingEvents,
  freeEvents,
  draftEvent,
  getUpcomingMockEvents,
  getHomepageEvents,
  getFeaturedEvents,
  getEventsByStatus,
  getEventsByStructure,
  getEventsByCategory,
  searchEvents,
  getMockEventById,
  getStructureEventsByStatus,
  getFilteredEvents,
  buildMockEvent,
  getNextEventId,
  eventStatusMapping,
  eventCategoryMapping
};
