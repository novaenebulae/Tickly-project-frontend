// Tableau mockEventsData pour events.mock.ts
import { EventModel } from '../../models/event/event.model';
import { SeatingType } from '../../models/event/seating.model';

export const allMockEvents: EventModel[] = [
  // Structure 1: Le Zénith (eventsCount: 8)
  {
    id: 1,
    name: 'Concert Rock: Imagine Dragons',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Une soirée explosive avec le groupe Imagine Dragons.',
    tags: ['rock', 'concert', 'musique internationale'],
    startDate: new Date('2025-06-15T20:00:00'),
    endDate: new Date('2025-06-15T23:00:00'),
    address: {
      street: 'Avenue Corentin Cariou 211',
      city: 'Paris',
      zipCode: '75019',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 101,
        name: 'Fosse',
        areaId: 1,
        maxCapacity: 4000,
        ticketPrice: 70.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 102,
        name: 'Gradins',
        areaId: 2,
        maxCapacity: 3000,
        ticketPrice: 80.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 100
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Imagine Dragons, le groupe multi-platine, revient en concert au Zénith de Paris. Venez vivre une expérience musicale unique avec leurs tubes planétaires et leurs nouvelles chansons.',
    links: ['https://www.lezenith.fr/concerts/imagine-dragons'],
    mainPhotoUrl: 'https://picsum.photos/seed/event1/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event1b/800/400',
      'https://picsum.photos/seed/event1c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-12-15T10:30:00'),
    updatedAt: new Date('2025-01-12T14:45:00')
  },
  {
    id: 2,
    name: 'Concert Rap: Nekfeu',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Le rappeur Nekfeu en tournée pour son nouvel album.',
    tags: ['rap', 'hip-hop', 'musique française'],
    startDate: new Date('2025-07-10T20:30:00'),
    endDate: new Date('2025-07-10T23:00:00'),
    address: {
      street: 'Avenue Corentin Cariou 211',
      city: 'Paris',
      zipCode: '75019',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 103,
        name: 'Fosse',
        areaId: 1,
        maxCapacity: 4000,
        ticketPrice: 55.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 104,
        name: 'Gradins',
        areaId: 2,
        maxCapacity: 3000,
        ticketPrice: 65.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 100
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Nekfeu, figure emblématique du rap français, présentera son nouvel album lors d\'un concert exceptionnel au Zénith de Paris.',
    links: ['https://www.lezenith.fr/concerts/nekfeu'],
    mainPhotoUrl: 'https://picsum.photos/seed/event2/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event2b/800/400',
      'https://picsum.photos/seed/event2c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-12-20T09:15:00'),
    updatedAt: new Date('2025-01-15T16:20:00')
  },
  {
    id: 3,
    name: 'Concert Pop: Dua Lipa',
    category: { id: 1, name: 'Music' },
    shortDescription: 'La star mondiale Dua Lipa présente son nouveau spectacle.',
    tags: ['pop', 'international', 'dance'],
    startDate: new Date('2025-07-25T20:00:00'),
    endDate: new Date('2025-07-25T22:30:00'),
    address: {
      street: 'Avenue Corentin Cariou 211',
      city: 'Paris',
      zipCode: '75019',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 105,
        name: 'Fosse',
        areaId: 1,
        maxCapacity: 4000,
        ticketPrice: 85.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 106,
        name: 'Gradins',
        areaId: 2,
        maxCapacity: 3000,
        ticketPrice: 95.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 100
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Dua Lipa, multiple Grammy Award Winner, arrive au Zénith de Paris avec un spectacle éblouissant. Une production visuelle exceptionnelle accompagnera ses chansons à succès.',
    links: ['https://www.lezenith.fr/concerts/dua-lipa'],
    mainPhotoUrl: 'https://picsum.photos/seed/event3/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event3b/800/400',
      'https://picsum.photos/seed/event3c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-12-05T11:00:00'),
    updatedAt: new Date('2025-01-20T13:15:00')
  },
  {
    id: 4,
    name: 'Concert Électro: Justice',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Le duo électro français Justice enflamme le Zénith.',
    tags: ['électro', 'dj set', 'musique française'],
    startDate: new Date('2025-08-05T21:00:00'),
    endDate: new Date('2025-08-06T01:00:00'),
    address: {
      street: 'Avenue Corentin Cariou 211',
      city: 'Paris',
      zipCode: '75019',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 107,
        name: 'Fosse',
        areaId: 1,
        maxCapacity: 7000,
        ticketPrice: 60.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Justice, le duo électro français mondialement reconnu, présente son nouveau live show. Une expérience audiovisuelle immersive qui mêle leurs classiques et nouvelles productions.',
    links: ['https://www.lezenith.fr/concerts/justice'],
    mainPhotoUrl: 'https://picsum.photos/seed/event4/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event4b/800/400',
      'https://picsum.photos/seed/event4c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-10T08:30:00'),
    updatedAt: new Date('2025-02-05T10:45:00')
  },
  {
    id: 5,
    name: 'Concert Classique: Orchestre Philharmonique de Paris',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Un concert exceptionnel dirigé par la cheffe d\'orchestre Alondra de la Parra.',
    tags: ['classique', 'orchestre', 'symphonie'],
    startDate: new Date('2025-09-12T19:30:00'),
    endDate: new Date('2025-09-12T21:30:00'),
    address: {
      street: 'Avenue Corentin Cariou 211',
      city: 'Paris',
      zipCode: '75019',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 108,
        name: 'Gradins',
        areaId: 2,
        maxCapacity: 3000,
        ticketPrice: 50.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 100
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'L\'Orchestre Philharmonique de Paris présente un programme exceptionnel incluant des œuvres de Beethoven, Debussy et Ravel sous la direction de la cheffe d\'orchestre mexicaine Alondra de la Parra.',
    links: ['https://www.lezenith.fr/concerts/philharmonique-paris'],
    mainPhotoUrl: 'https://picsum.photos/seed/event5/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event5b/800/400',
      'https://picsum.photos/seed/event5c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-20T14:00:00'),
    updatedAt: new Date('2025-02-10T09:30:00')
  },
  {
    id: 6,
    name: 'Spectacle Humour: Gad Elmaleh',
    category: { id: 2, name: 'Theater' },
    shortDescription: 'Le retour de Gad Elmaleh avec son nouveau one-man-show.',
    tags: ['humour', 'one-man-show', 'comédie'],
    startDate: new Date('2025-10-15T20:00:00'),
    endDate: new Date('2025-10-15T22:00:00'),
    address: {
      street: 'Avenue Corentin Cariou 211',
      city: 'Paris',
      zipCode: '75019',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 109,
        name: 'Gradins',
        areaId: 2,
        maxCapacity: 7000,
        ticketPrice: 55.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 100
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Après une tournée mondiale, Gad Elmaleh revient avec un spectacle inédit. L\'humoriste partagera ses observations sur la société contemporaine avec son style unique et ses personnages mémorables.',
    links: ['https://www.lezenith.fr/spectacles/gad-elmaleh'],
    mainPhotoUrl: 'https://picsum.photos/seed/event6/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event6b/800/400',
      'https://picsum.photos/seed/event6c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-01T10:15:00'),
    updatedAt: new Date('2025-02-25T15:30:00')
  },
  {
    id: 7,
    name: 'Cirque du Soleil: Nouvelle Création',
    category: { id: 6, name: 'Festival' },
    shortDescription: 'Le Cirque du Soleil présente son nouveau spectacle révolutionnaire.',
    tags: ['cirque', 'acrobatie', 'spectacle visuel'],
    startDate: new Date('2025-11-20T20:00:00'),
    endDate: new Date('2025-11-30T22:30:00'),
    address: {
      street: 'Avenue Corentin Cariou 211',
      city: 'Paris',
      zipCode: '75019',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 110,
        name: 'Catégorie 1',
        areaId: 2,
        maxCapacity: 2000,
        ticketPrice: 90.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 100
      },
      {
        id: 111,
        name: 'Catégorie 2',
        areaId: 3,
        maxCapacity: 3000,
        ticketPrice: 70.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 100
      },
      {
        id: 112,
        name: 'Catégorie 3',
        areaId: 4,
        maxCapacity: 2000,
        ticketPrice: 50.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 100
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Cirque du Soleil revient avec une création époustouflante qui repousse les limites de l\'imagination. Un voyage poétique mêlant acrobaties, musique originale et effets visuels révolutionnaires.',
    links: ['https://www.lezenith.fr/spectacles/cirque-soleil'],
    mainPhotoUrl: 'https://picsum.photos/seed/event7/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event7b/800/400',
      'https://picsum.photos/seed/event7c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-15T09:00:00'),
    updatedAt: new Date('2025-03-05T11:45:00')
  },
  {
    id: 8,
    name: 'Festival de Hip-Hop',
    category: { id: 6, name: 'Festival' },
    shortDescription: 'Un festival réunissant les meilleurs artistes hip-hop nationaux et internationaux.',
    tags: ['hip-hop', 'rap', 'danse urbaine'],
    startDate: new Date('2025-12-05T18:00:00'),
    endDate: new Date('2025-12-08T23:00:00'),
    address: {
      street: 'Avenue Corentin Cariou 211',
      city: 'Paris',
      zipCode: '75019',
      country: 'France'
    },
    structureId: 1,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 113,
        name: 'Fosse',
        areaId: 1,
        maxCapacity: 4000,
        ticketPrice: 150.00, // Pass 3 jours
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 114,
        name: 'Gradins',
        areaId: 2,
        maxCapacity: 3000,
        ticketPrice: 180.00, // Pass 3 jours
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 100
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Festival de Hip-Hop propose trois jours dédiés à la culture urbaine avec des concerts, des battles de breakdance, des ateliers de graffiti et des conférences. Une vingtaine d\'artistes nationaux et internationaux se produiront sur scène.',
    links: ['https://www.lezenith.fr/festivals/hip-hop'],
    mainPhotoUrl: 'https://picsum.photos/seed/event8/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event8b/800/400',
      'https://picsum.photos/seed/event8c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-01T10:45:00'),
    updatedAt: new Date('2025-03-20T14:15:00')
  },

  // Structure 2: Théâtre de la Ville (eventsCount: 6)
  {
    id: 9,
    name: 'Hamlet - Version Contemporaine',
    category: { id: 2, name: 'Theater' },
    shortDescription: 'Une réinterprétation moderne du chef-d\'œuvre de Shakespeare.',
    tags: ['théâtre', 'classique revisité', 'drame'],
    startDate: new Date('2025-05-10T19:30:00'),
    endDate: new Date('2025-05-10T22:30:00'),
    address: {
      street: 'Place du Châtelet 2',
      city: 'Paris',
      zipCode: '75004',
      country: 'France'
    },
    structureId: 2,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 115,
        name: 'Orchestre',
        areaId: 5,
        maxCapacity: 500,
        ticketPrice: 45.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 25,
        seatsPerRow: 20
      },
      {
        id: 116,
        name: 'Balcon',
        areaId: 6,
        maxCapacity: 300,
        ticketPrice: 35.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 15,
        seatsPerRow: 20
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Une version audacieuse et contemporaine du drame shakespearien, mise en scène par Thomas Ostermeier. Cette relecture situe l\'action dans un monde d\'entreprise moderne où pouvoir et corruption s\'entremêlent.',
    links: ['https://www.theatredelaville-paris.com/spectacles/hamlet'],
    mainPhotoUrl: 'https://picsum.photos/seed/event9/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event9b/800/400',
      'https://picsum.photos/seed/event9c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-11-15T09:30:00'),
    updatedAt: new Date('2025-01-10T11:20:00')
  },
  {
    id: 10,
    name: 'Le Misanthrope - Comédie Classique',
    category: { id: 2, name: 'Theater' },
    shortDescription: 'La célèbre pièce de Molière dans une mise en scène fidèle à l\'esprit du XVIIe siècle.',
    tags: ['théâtre classique', 'comédie', 'Molière'],
    startDate: new Date('2025-06-15T19:30:00'),
    endDate: new Date('2025-06-15T22:00:00'),
    address: {
      street: 'Place du Châtelet 2',
      city: 'Paris',
      zipCode: '75004',
      country: 'France'
    },
    structureId: 2,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 117,
        name: 'Orchestre',
        areaId: 5,
        maxCapacity: 500,
        ticketPrice: 42.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 25,
        seatsPerRow: 20
      },
      {
        id: 118,
        name: 'Balcon',
        areaId: 6,
        maxCapacity: 300,
        ticketPrice: 32.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 15,
        seatsPerRow: 20
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Redécouvrez le chef-d\'œuvre de Molière dans une mise en scène respectueuse de l\'œuvre originale, avec costumes d\'époque et décors inspirés des théâtres du XVIIe siècle.',
    links: ['https://www.theatredelaville-paris.com/spectacles/misanthrope'],
    mainPhotoUrl: 'https://picsum.photos/seed/event10/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event10b/800/400',
      'https://picsum.photos/seed/event10c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-12-10T13:45:00'),
    updatedAt: new Date('2025-01-15T10:30:00')
  },
  {
    id: 11,
    name: 'Danse Contemporaine: Corps et Mouvements',
    category: { id: 7, name: 'Other' },
    shortDescription: 'Un spectacle de danse contemporaine par la Compagnie Preljocaj.',
    tags: ['danse', 'contemporain', 'chorégraphie'],
    startDate: new Date('2025-07-20T20:30:00'),
    endDate: new Date('2025-07-20T22:00:00'),
    address: {
      street: 'Place du Châtelet 2',
      city: 'Paris',
      zipCode: '75004',
      country: 'France'
    },
    structureId: 2,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 119,
        name: 'Orchestre',
        areaId: 5,
        maxCapacity: 500,
        ticketPrice: 38.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 25,
        seatsPerRow: 20
      },
      {
        id: 120,
        name: 'Balcon',
        areaId: 6,
        maxCapacity: 300,
        ticketPrice: 28.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 15,
        seatsPerRow: 20
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'La Compagnie Preljocaj présente sa nouvelle création, une exploration du mouvement et de l\'espace. Les danseurs repousseront les limites du corps à travers une chorégraphie innovante accompagnée d\'une musique électronique originale.',
    links: ['https://www.theatredelaville-paris.com/spectacles/corps-mouvements'],
    mainPhotoUrl: 'https://picsum.photos/seed/event11/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event11b/800/400',
      'https://picsum.photos/seed/event11c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-05T11:30:00'),
    updatedAt: new Date('2025-02-10T09:15:00')
  },
  {
    id: 12,
    name: 'Macbeth - Tragédie Shakespearienne',
    category: { id: 2, name: 'Theater' },
    shortDescription: 'Une interprétation sombre et mystique de la célèbre tragédie.',
    tags: ['théâtre', 'tragédie', 'classique'],
    startDate: new Date('2025-08-25T19:30:00'),
    endDate: new Date('2025-08-25T22:30:00'),
    address: {
      street: 'Place du Châtelet 2',
      city: 'Paris',
      zipCode: '75004',
      country: 'France'
    },
    structureId: 2,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 121,
        name: 'Orchestre',
        areaId: 5,
        maxCapacity: 500,
        ticketPrice: 45.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 25,
        seatsPerRow: 20
      },
      {
        id: 122,
        name: 'Balcon',
        areaId: 6,
        maxCapacity: 300,
        ticketPrice: 35.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 15,
        seatsPerRow: 20
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    fullDescription: 'Cette nouvelle mise en scène de Macbeth explore les thèmes de l\'ambition, de la culpabilité et de la destinée à travers une esthétique gothique et onirique. Les éléments surnaturels de la pièce sont mis en valeur par des effets visuels et sonores innovants.',
    links: ['https://www.theatredelaville-paris.com/spectacles/macbeth'],
    mainPhotoUrl: 'https://picsum.photos/seed/event12/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event12b/800/400',
      'https://picsum.photos/seed/event12c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-05T14:20:00'),
    updatedAt: new Date('2025-03-10T10:45:00')
  },
  {
    id: 13,
    name: 'Festival de Théâtre Émergent',
    category: { id: 6, name: 'Festival' },
    shortDescription: 'Une semaine dédiée aux nouvelles créations théâtrales et aux compagnies émergentes.',
    tags: ['théâtre contemporain', 'festival', 'jeunes artistes'],
    startDate: new Date('2025-09-15T14:00:00'),
    endDate: new Date('2025-09-22T22:00:00'),
    address: {
      street: 'Place du Châtelet 2',
      city: 'Paris',
      zipCode: '75004',
      country: 'France'
    },
    structureId: 2,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 123,
        name: 'Accès Festival',
        areaId: 5,
        maxCapacity: 800,
        ticketPrice: 20.00, // Par représentation
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 25,
        seatsPerRow: 20
      },
      {
        id: 124,
        name: 'Pass Festival',
        areaId: 7,
        maxCapacity: 500,
        ticketPrice: 100.00, // Pass pour tout le festival
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Festival de Théâtre Émergent met en lumière les créations de jeunes compagnies et d\'auteurs contemporains. Au programme: une quinzaine de spectacles, des lectures, des rencontres avec les artistes et des ateliers d\'écriture.',
    links: ['https://www.theatredelaville-paris.com/festival-emergent'],
    mainPhotoUrl: 'https://picsum.photos/seed/event13/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event13b/800/400',
      'https://picsum.photos/seed/event13c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-01T09:45:00'),
    updatedAt: new Date('2025-03-25T16:30:00')
  },
  {
    id: 14,
    name: 'Les Trois Sœurs - Théâtre Russe',
    category: { id: 2, name: 'Theater' },
    shortDescription: 'Le chef-d\'œuvre de Tchekhov dans une production franco-russe.',
    tags: ['théâtre russe', 'Tchekhov', 'drame'],
    startDate: new Date('2025-10-10T19:30:00'),
    endDate: new Date('2025-10-10T22:30:00'),
    address: {
      street: 'Place du Châtelet 2',
      city: 'Paris',
      zipCode: '75004',
      country: 'France'
    },
    structureId: 2,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 125,
        name: 'Orchestre',
        areaId: 5,
        maxCapacity: 500,
        ticketPrice: 40.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 25,
        seatsPerRow: 20
      },
      {
        id: 126,
        name: 'Balcon',
        areaId: 6,
        maxCapacity: 300,
        ticketPrice: 30.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 15,
        seatsPerRow: 20
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Cette production exceptionnelle des "Trois Sœurs" réunit des acteurs français et russes pour une interprétation authentique et émouvante de l\'œuvre de Tchekhov. La mise en scène privilégie la profondeur psychologique des personnages et l\'atmosphère mélancolique propre à l\'auteur.',
    links: ['https://www.theatredelaville-paris.com/spectacles/trois-soeurs'],
    mainPhotoUrl: 'https://picsum.photos/seed/event14/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event14b/800/400',
      'https://picsum.photos/seed/event14c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-15T10:20:00'),
    updatedAt: new Date('2025-04-05T11:15:00')
  },

  // Et je continue avec les autres structures en respectant leurs eventsCount respectifs...
  // Structure 3: Centre des Congrès (eventsCount: 5)
  {
    id: 15,
    name: 'Conférence Internationale sur l\'Intelligence Artificielle',
    category: { id: 4, name: 'Conference' },
    shortDescription: 'Rencontre des experts mondiaux de l\'IA pour explorer les dernières avancées et leurs impacts.',
    tags: ['technologie', 'IA', 'innovation', 'conférence'],
    startDate: new Date('2025-05-20T09:00:00'),
    endDate: new Date('2025-05-22T18:00:00'),
    address: {
      street: 'Quai Charles de Gaulle 50',
      city: 'Lyon',
      zipCode: '69006',
      country: 'France'
    },
    structureId: 3,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 127,
        name: 'Pass Standard',
        areaId: 8,
        maxCapacity: 1500,
        ticketPrice: 450.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 128,
        name: 'Pass Premium',
        areaId: 9,
        maxCapacity: 500,
        ticketPrice: 850.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'La Conférence Internationale sur l\'Intelligence Artificielle réunit chercheurs, entrepreneurs et décideurs pour trois jours d\'échanges sur les avancées de l\'IA. Au programme: keynotes, tables rondes, ateliers pratiques et sessions de networking.',
    links: ['https://www.ccc-lyon.com/conferences/ia-international'],
    mainPhotoUrl: 'https://picsum.photos/seed/event15/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event15b/800/400',
      'https://picsum.photos/seed/event15c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-11-10T08:30:00'),
    updatedAt: new Date('2025-01-15T14:20:00')
  },
// Suite de Structure 3: Centre des Congrès (eventsCount: 5)
  {
    id: 16,
    name: 'Salon des Entrepreneurs',
    category: { id: 4, name: 'Conference' },
    shortDescription: 'Le plus grand rendez-vous des créateurs et dirigeants d\'entreprise.',
    tags: ['entrepreneuriat', 'business', 'startups', 'networking'],
    startDate: new Date('2025-06-18T09:00:00'),
    endDate: new Date('2025-06-19T18:00:00'),
    address: {
      street: 'Quai Charles de Gaulle 50',
      city: 'Lyon',
      zipCode: '69006',
      country: 'France'
    },
    structureId: 3,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 129,
        name: 'Accès Salon',
        areaId: 8,
        maxCapacity: 5000,
        ticketPrice: 50.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 130,
        name: 'Pass VIP',
        areaId: 9,
        maxCapacity: 500,
        ticketPrice: 150.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Le Salon des Entrepreneurs est l\'événement de référence pour tous les porteurs de projet et dirigeants d\'entreprise. Pendant deux jours, bénéficiez de conseils personnalisés, de conférences thématiques et de rencontres avec des experts pour développer votre activité.',
    links: ['https://www.ccc-lyon.com/salons/entrepreneurs'],
    mainPhotoUrl: 'https://picsum.photos/seed/event16/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event16b/800/400',
      'https://picsum.photos/seed/event16c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-12-05T09:45:00'),
    updatedAt: new Date('2025-01-20T11:30:00')
  },
  {
    id: 17,
    name: 'Forum Médical International',
    category: { id: 4, name: 'Conference' },
    shortDescription: 'Congrès médical réunissant chercheurs et praticiens autour des dernières avancées médicales.',
    tags: ['médecine', 'santé', 'recherche', 'innovation'],
    startDate: new Date('2025-07-15T08:30:00'),
    endDate: new Date('2025-07-18T17:00:00'),
    address: {
      street: 'Quai Charles de Gaulle 50',
      city: 'Lyon',
      zipCode: '69006',
      country: 'France'
    },
    structureId: 3,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 131,
        name: 'Accès Standard',
        areaId: 8,
        maxCapacity: 2000,
        ticketPrice: 550.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 132,
        name: 'Accès Premium',
        areaId: 9,
        maxCapacity: 500,
        ticketPrice: 950.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    fullDescription: 'Le Forum Médical International rassemble spécialistes et chercheurs du monde entier pour partager les dernières avancées dans tous les domaines de la médecine. Un programme riche de conférences, présentations de recherches et sessions pratiques vous attend.',
    links: ['https://www.ccc-lyon.com/congres/forum-medical'],
    mainPhotoUrl: 'https://picsum.photos/seed/event17/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event17b/800/400',
      'https://picsum.photos/seed/event17c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-10T11:15:00'),
    updatedAt: new Date('2025-02-05T09:20:00')
  },
  {
    id: 18,
    name: 'Sommet Développement Durable',
    category: { id: 4, name: 'Conference' },
    shortDescription: 'Conférence internationale sur les enjeux environnementaux et les solutions durables.',
    tags: ['écologie', 'climat', 'développement durable', 'environnement'],
    startDate: new Date('2025-08-25T09:00:00'),
    endDate: new Date('2025-08-27T17:30:00'),
    address: {
      street: 'Quai Charles de Gaulle 50',
      city: 'Lyon',
      zipCode: '69006',
      country: 'France'
    },
    structureId: 3,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 133,
        name: 'Pass Général',
        areaId: 8,
        maxCapacity: 1800,
        ticketPrice: 380.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 134,
        name: 'Pass ONG',
        areaId: 9,
        maxCapacity: 700,
        ticketPrice: 180.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Sommet Développement Durable réunit experts, décideurs et militants pour trois jours de débats sur les stratégies face aux défis environnementaux. Conférences, ateliers collaboratifs et expositions de solutions innovantes sont au programme.',
    links: ['https://www.ccc-lyon.com/conferences/sommet-developpement-durable'],
    mainPhotoUrl: 'https://picsum.photos/seed/event18/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event18b/800/400',
      'https://picsum.photos/seed/event18c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-10T08:45:00'),
    updatedAt: new Date('2025-03-05T16:30:00')
  },
  {
    id: 19,
    name: 'Congrès International des Technologies Éducatives',
    category: { id: 4, name: 'Conference' },
    shortDescription: 'Exploration des innovations technologiques au service de l\'éducation.',
    tags: ['éducation', 'technologie', 'pédagogie', 'numérique'],
    startDate: new Date('2025-09-10T09:00:00'),
    endDate: new Date('2025-09-12T17:00:00'),
    address: {
      street: 'Quai Charles de Gaulle 50',
      city: 'Lyon',
      zipCode: '69006',
      country: 'France'
    },
    structureId: 3,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 135,
        name: 'Pass Complet',
        areaId: 8,
        maxCapacity: 1500,
        ticketPrice: 320.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 136,
        name: 'Pass Enseignant',
        areaId: 9,
        maxCapacity: 1000,
        ticketPrice: 200.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Le Congrès International des Technologies Éducatives s\'adresse aux professionnels et chercheurs en éducation. Découvrez les dernières innovations pédagogiques, outils numériques et méthodes d\'enseignement à travers conférences, démonstrations et ateliers pratiques.',
    links: ['https://www.ccc-lyon.com/congres/technologies-educatives'],
    mainPhotoUrl: 'https://picsum.photos/seed/event19/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event19b/800/400',
      'https://picsum.photos/seed/event19c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-25T10:30:00'),
    updatedAt: new Date('2025-03-20T14:15:00')
  },

  // Structure 4: La Cité des Arts (eventsCount: 7) - Début
  {
    id: 20,
    name: 'Exposition: Art Numérique & Réalité Virtuelle',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Une immersion dans l\'art digital avec des installations interactives et expériences VR.',
    tags: ['art numérique', 'réalité virtuelle', 'interactif', 'exposition'],
    startDate: new Date('2025-05-01T10:00:00'),
    endDate: new Date('2025-06-30T19:00:00'),
    address: {
      street: 'Boulevard Louis Blanc 25',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France'
    },
    structureId: 4,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 137,
        name: 'Entrée Exposition',
        areaId: 10,
        maxCapacity: 300,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 138,
        name: 'Pass Famille',
        areaId: 10,
        maxCapacity: 100,
        ticketPrice: 40.00, // Pour 4 personnes
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Cette exposition d\'envergure présente les œuvres de 25 artistes numériques internationaux. Des installations interactives, sculptures digitales et expériences en réalité virtuelle transforment l\'espace d\'exposition en un voyage immersif à travers l\'art du futur.',
    links: ['https://www.cite-arts-montpellier.fr/expositions/art-numerique-vr'],
    mainPhotoUrl: 'https://picsum.photos/seed/event20/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event20b/800/400',
      'https://picsum.photos/seed/event20c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-11-20T09:15:00'),
    updatedAt: new Date('2025-01-10T11:45:00')
  },
  {
    id: 21,
    name: 'Festival de Musique Contemporaine',
    category: { id: 6, name: 'Festival' },
    shortDescription: 'Une semaine dédiée aux compositeurs contemporains avec concerts et masterclasses.',
    tags: ['musique contemporaine', 'classique', 'composition', 'festival'],
    startDate: new Date('2025-06-10T18:00:00'),
    endDate: new Date('2025-06-17T22:00:00'),
    address: {
      street: 'Boulevard Louis Blanc 25',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France'
    },
    structureId: 4,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 139,
        name: 'Concert Individuel',
        areaId: 11,
        maxCapacity: 400,
        ticketPrice: 25.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 20
      },
      {
        id: 140,
        name: 'Pass Festival',
        areaId: 11,
        maxCapacity: 200,
        ticketPrice: 120.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Festival de Musique Contemporaine offre un panorama des créations actuelles à travers 12 concerts, des rencontres avec les compositeurs et des masterclasses ouvertes au public. Un événement incontournable pour les amateurs de musique classique d\'aujourd\'hui.',
    links: ['https://www.cite-arts-montpellier.fr/festivals/musique-contemporaine'],
    mainPhotoUrl: 'https://picsum.photos/seed/event21/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event21b/800/400',
      'https://picsum.photos/seed/event21c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-12-15T11:30:00'),
    updatedAt: new Date('2025-02-05T13:45:00')
  },
  {
    id: 22,
    name: 'Workshop Photographie Documentaire',
    category: { id: 4, name: 'Conference' },
    shortDescription: 'Atelier intensif de photographie documentaire dirigé par des professionnels reconnus.',
    tags: ['photographie', 'documentaire', 'formation', 'atelier'],
    startDate: new Date('2025-07-05T09:00:00'),
    endDate: new Date('2025-07-09T18:00:00'),
    address: {
      street: 'Boulevard Louis Blanc 25',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France'
    },
    structureId: 4,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 141,
        name: 'Participation Atelier',
        areaId: 12,
        maxCapacity: 30,
        ticketPrice: 450.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Ce workshop de 5 jours s\'adresse aux photographes amateurs et professionnels souhaitant approfondir leur pratique du documentaire. Encadrés par des photographes reconnus, vous développerez un projet personnel tout en bénéficiant de retours critiques et conseils techniques.',
    links: ['https://www.cite-arts-montpellier.fr/ateliers/photographie-documentaire'],
    mainPhotoUrl: 'https://picsum.photos/seed/event22/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event22b/800/400',
      'https://picsum.photos/seed/event22c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-15T14:30:00'),
    updatedAt: new Date('2025-02-20T10:15:00')
  },
  {
    id: 23,
    name: 'Spectacle de Danse: Frontières',
    category: { id: 7, name: 'Other' },
    shortDescription: 'Une création contemporaine explorant les notions de territoires et d\'identités.',
    tags: ['danse contemporaine', 'création', 'spectacle vivant'],
    startDate: new Date('2025-08-15T20:30:00'),
    endDate: new Date('2025-08-15T22:00:00'),
    address: {
      street: 'Boulevard Louis Blanc 25',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France'
    },
    structureId: 4,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 142,
        name: 'Salle de Spectacle',
        areaId: 11,
        maxCapacity: 400,
        ticketPrice: 22.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 20
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: '"Frontières" est une création chorégraphique qui interroge les notions de limites, de territoires et d\'identités dans notre monde contemporain. Cinq danseurs évoluent dans un espace en constante mutation, accompagnés d\'une musique originale et de projections visuelles.',
    links: ['https://www.cite-arts-montpellier.fr/spectacles/frontieres'],
    mainPhotoUrl: 'https://picsum.photos/seed/event23/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event23b/800/400',
      'https://picsum.photos/seed/event23c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-10T09:45:00'),
    updatedAt: new Date('2025-03-05T16:20:00')
  },
  {
    id: 24,
    name: 'Exposition: Jeunes Talents Régionaux',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Découverte des œuvres de la nouvelle génération d\'artistes de la région.',
    tags: ['art contemporain', 'jeunes artistes', 'local', 'exposition'],
    startDate: new Date('2025-09-05T10:00:00'),
    endDate: new Date('2025-10-15T19:00:00'),
    address: {
      street: 'Boulevard Louis Blanc 25',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France'
    },
    structureId: 4,
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 143,
        name: 'Espace d\'Exposition',
        areaId: 10,
        maxCapacity: 300,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Cette exposition collective présente les œuvres de 15 jeunes artistes émergents de la région Occitanie. Peinture, sculpture, photographie, installations: découvrez la diversité et la richesse de la création contemporaine locale.',
    links: ['https://www.cite-arts-montpellier.fr/expositions/jeunes-talents'],
    mainPhotoUrl: 'https://picsum.photos/seed/event24/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event24b/800/400',
      'https://picsum.photos/seed/event24c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-01T10:30:00'),
    updatedAt: new Date('2025-03-20T15:45:00')
  },
  // Structure 4: La Cité des Arts (suite - dernier événement des 7)
  {
    id: 25,
    name: 'Concert Jazz Fusion',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Une soirée jazz avec un quintet explorant les frontières entre jazz, électro et world music.',
    tags: ['jazz', 'fusion', 'concert', 'musique live'],
    startDate: new Date('2025-10-25T21:00:00'),
    endDate: new Date('2025-10-25T23:30:00'),
    address: {
      street: 'Boulevard Louis Blanc 25',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France'
    },
    structureId: 4,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 144,
        name: 'Salle de Concert',
        areaId: 11,
        maxCapacity: 400,
        ticketPrice: 18.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 20
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Le quintet "Fifth Element" vous invite à une expérience musicale unique, fusionnant le jazz avec des sonorités électroniques et des influences world. Ces musiciens virtuoses créent des paysages sonores captivants, entre improvisation et compositions originales.',
    links: ['https://www.cite-arts-montpellier.fr/concerts/jazz-fusion'],
    mainPhotoUrl: 'https://picsum.photos/seed/event25/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event25b/800/400',
      'https://picsum.photos/seed/event25c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-15T13:45:00'),
    updatedAt: new Date('2025-04-02T10:20:00')
  },

  // Structure 5: Le Dôme (eventsCount: 3)
  {
    id: 26,
    name: 'Soirée Électro: Techno Underground',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Une nuit de techno avec des DJs internationaux et locaux dans une ambiance industrielle.',
    tags: ['techno', 'électro', 'nightlife', 'DJ set'],
    startDate: new Date('2025-06-14T23:00:00'),
    endDate: new Date('2025-06-15T06:00:00'),
    address: {
      street: 'Rue Augustin Daumas 12',
      city: 'Marseille',
      zipCode: '13009',
      country: 'France'
    },
    structureId: 5,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 145,
        name: 'Entrée Standard',
        areaId: 13,
        maxCapacity: 800,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 146,
        name: 'VIP / Espace Mezzanine',
        areaId: 14,
        maxCapacity: 100,
        ticketPrice: 35.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Le Dôme vous invite à une nuit techno avec une programmation pointue. À l\'affiche: l\'artiste allemand Klaudia Gawlas, accompagnée de talents locaux de la scène marseillaise. Une expérience sonore immersive dans notre salle à l\'acoustique exceptionnelle et aux jeux de lumière hypnotiques.',
    links: ['https://www.ledomemarseille.com/events/techno-underground'],
    mainPhotoUrl: 'https://picsum.photos/seed/event26/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event26b/800/400',
      'https://picsum.photos/seed/event26c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-20T11:30:00'),
    updatedAt: new Date('2025-02-15T14:45:00')
  },
  {
    id: 27,
    name: 'Concert Live: Rock Indépendant',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Une soirée avec trois groupes de la scène rock indépendante française.',
    tags: ['rock indé', 'concert', 'musique live', 'scène française'],
    startDate: new Date('2025-07-18T20:30:00'),
    endDate: new Date('2025-07-19T01:00:00'),
    address: {
      street: 'Rue Augustin Daumas 12',
      city: 'Marseille',
      zipCode: '13009',
      country: 'France'
    },
    structureId: 5,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 147,
        name: 'Entrée Générale',
        areaId: 13,
        maxCapacity: 800,
        ticketPrice: 12.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Trois groupes émergents de la scène rock indépendante française se produiront sur notre scène pour une soirée énergique et authentique. Au programme: Les Valentins, Wild Raccoon et Emeraude, pour un voyage musical entre post-punk, garage rock et indie pop.',
    links: ['https://www.ledomemarseille.com/events/rock-independant'],
    mainPhotoUrl: 'https://picsum.photos/seed/event27/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event27b/800/400',
      'https://picsum.photos/seed/event27c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-10T09:15:00'),
    updatedAt: new Date('2025-03-05T16:40:00')
  },
  {
    id: 28,
    name: 'DJ Set: House & Disco',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Une soirée groovy mêlant house et disco avec le collectif Tropical Disco Records.',
    tags: ['house', 'disco', 'DJ set', 'dance'],
    startDate: new Date('2025-08-22T22:00:00'),
    endDate: new Date('2025-08-23T05:00:00'),
    address: {
      street: 'Rue Augustin Daumas 12',
      city: 'Marseille',
      zipCode: '13009',
      country: 'France'
    },
    structureId: 5,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 148,
        name: 'Entrée Standard',
        areaId: 13,
        maxCapacity: 800,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 149,
        name: 'VIP / Espace Mezzanine',
        areaId: 14,
        maxCapacity: 100,
        ticketPrice: 35.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le collectif britannique Tropical Disco Records pose ses platines au Dôme pour une nuit de house et disco ensoleillée. Des rythmes entraînants, des lignes de basse profondes et des samples vintage vous feront danser jusqu\'au petit matin dans une ambiance festive et conviviale.',
    links: ['https://www.ledomemarseille.com/events/house-disco'],
    mainPhotoUrl: 'https://picsum.photos/seed/event28/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event28b/800/400',
      'https://picsum.photos/seed/event28c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-01T10:30:00'),
    updatedAt: new Date('2025-03-25T15:20:00')
  },

  // Structure 6: Cinéma Lumière (eventsCount: 4)
  {
    id: 29,
    name: 'Festival du Film Indépendant',
    category: { id: 6, name: 'Festival' },
    shortDescription: 'Une semaine dédiée au cinéma indépendant international avec projections et rencontres.',
    tags: ['cinéma', 'films indépendants', 'festival', 'projection'],
    startDate: new Date('2025-05-25T10:00:00'),
    endDate: new Date('2025-06-01T22:00:00'),
    address: {
      street: 'Rue Georges Bonnac 5',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France'
    },
    structureId: 6,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 150,
        name: 'Billet Simple',
        areaId: 15,
        maxCapacity: 200,
        ticketPrice: 8.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 10
      },
      {
        id: 151,
        name: 'Pass Festival',
        areaId: 15,
        maxCapacity: 100,
        ticketPrice: 40.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Festival du Film Indépendant présente une sélection internationale de films hors des sentiers battus. Au programme: 30 longs-métrages et 20 courts-métrages venus du monde entier, des rencontres avec les réalisateurs et des masterclasses sur la production indépendante.',
    links: ['https://www.cinema-lumiere.com/festival-film-independant'],
    mainPhotoUrl: 'https://picsum.photos/seed/event29/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event29b/800/400',
      'https://picsum.photos/seed/event29c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-12-15T09:30:00'),
    updatedAt: new Date('2025-02-10T14:15:00')
  },
  {
    id: 30,
    name: 'Rétrospective Hitchcock',
    category: { id: 7, name: 'Other' },
    shortDescription: 'Cycle complet des films d\'Alfred Hitchcock, accompagné de conférences sur son œuvre.',
    tags: ['cinéma', 'Hitchcock', 'classique', 'cycle'],
    startDate: new Date('2025-07-01T14:00:00'),
    endDate: new Date('2025-07-31T22:00:00'),
    address: {
      street: 'Rue Georges Bonnac 5',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France'
    },
    structureId: 6,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 152,
        name: 'Billet Simple',
        areaId: 15,
        maxCapacity: 200,
        ticketPrice: 7.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 10
      },
      {
        id: 153,
        name: 'Pass Rétrospective',
        areaId: 15,
        maxCapacity: 50,
        ticketPrice: 50.00,
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Redécouvrez l\'œuvre du maître du suspense à travers une rétrospective complète de ses films, des premiers muets aux classiques en Technicolor. Chaque projection sera précédée d\'une introduction par un spécialiste du cinéma, et des conférences thématiques seront organisées chaque week-end.',
    links: ['https://www.cinema-lumiere.com/retrospective-hitchcock'],
    mainPhotoUrl: 'https://picsum.photos/seed/event30/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event30b/800/400',
      'https://picsum.photos/seed/event30c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-20T11:45:00'),
    updatedAt: new Date('2025-03-05T10:30:00')
  },
  {
    id: 31,
    name: 'Ciné-Concert: Metropolis',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Projection du chef-d\'œuvre de Fritz Lang accompagné d\'une performance musicale live.',
    tags: ['ciné-concert', 'film muet', 'musique live', 'classique'],
    startDate: new Date('2025-09-15T20:00:00'),
    endDate: new Date('2025-09-15T22:30:00'),
    address: {
      street: 'Rue Georges Bonnac 5',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France'
    },
    structureId: 6,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 154,
        name: 'Place Unique',
        areaId: 15,
        maxCapacity: 200,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 10
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Une expérience cinématographique et musicale unique: la projection du chef-d\'œuvre expressionniste de Fritz Lang, "Metropolis" (1927), accompagnée en direct par un ensemble de musiciens qui interprèteront une partition originale mêlant électronique, instruments classiques et bruitages.',
    links: ['https://www.cinema-lumiere.com/cine-concerts/metropolis'],
    mainPhotoUrl: 'https://picsum.photos/seed/event31/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event31b/800/400',
      'https://picsum.photos/seed/event31c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-25T09:15:00'),
    updatedAt: new Date('2025-03-20T14:30:00')
  },
  {
    id: 32,
    name: 'Nuit du Cinéma Fantastique',
    category: { id: 7, name: 'Other' },
    shortDescription: 'Marathon nocturne de films fantastiques et d\'horreur cultes.',
    tags: ['cinéma', 'fantastique', 'horreur', 'marathon'],
    startDate: new Date('2025-10-31T20:00:00'),
    endDate: new Date('2025-11-01T08:00:00'),
    address: {
      street: 'Rue Georges Bonnac 5',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France'
    },
    structureId: 6,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 155,
        name: 'Pass Nuit Complète',
        areaId: 15,
        maxCapacity: 200,
        ticketPrice: 20.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 10
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Pour Halloween, le Cinéma Lumière vous propose une nuit blanche avec cinq films cultes du cinéma fantastique et d\'horreur. Frissons garantis de 20h à l\'aube! Collations et boissons disponibles toute la nuit, et prix pour les meilleurs costumes.',
    links: ['https://www.cinema-lumiere.com/nuit-fantastique'],
    mainPhotoUrl: 'https://picsum.photos/seed/event32/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event32b/800/400',
      'https://picsum.photos/seed/event32c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-15T10:45:00'),
    updatedAt: new Date('2025-04-05T09:30:00')
  },

  // Structure 7: Musée d'Art Contemporain (eventsCount: 2)
  {
    id: 33,
    name: 'Exposition: Frontières du Réel',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Une exposition collective explorant les limites entre réalité et fiction dans l\'art contemporain.',
    tags: ['art contemporain', 'exposition', 'réalité augmentée', 'multimédia'],
    startDate: new Date('2025-06-10T10:00:00'),
    endDate: new Date('2025-09-15T18:00:00'),
    address: {
      street: 'Place Hans-Jean Arp 1',
      city: 'Strasbourg',
      zipCode: '67000',
      country: 'France'
    },
    structureId: 7,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 156,
        name: 'Entrée Standard',
        areaId: 16,
        maxCapacity: 500,
        ticketPrice: 12.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 157,
        name: 'Entrée Réduite',
        areaId: 16,
        maxCapacity: 300,
        ticketPrice: 8.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: '"Frontières du Réel" réunit vingt artistes internationaux dont les œuvres questionnent notre perception de la réalité à l\'ère numérique. Installations immersives, réalité augmentée, art génératif et sculptures hyperréalistes se côtoient dans un parcours qui brouille les frontières entre le tangible et le virtuel.',
    links: ['https://www.mac-strasbourg.eu/expositions/frontieres-du-reel'],
    mainPhotoUrl: 'https://picsum.photos/seed/event33/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event33b/800/400',
      'https://picsum.photos/seed/event33c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-10T09:30:00'),
    updatedAt: new Date('2025-02-20T14:15:00')
  },
  {
    id: 34,
    name: 'Retrospective: Louise Bourgeois',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Une exposition majeure consacrée à l\'œuvre de Louise Bourgeois, figure incontournable de l\'art contemporain.',
    tags: ['art contemporain', 'rétrospective', 'sculpture', 'féminisme'],
    startDate: new Date('2025-10-05T10:00:00'),
    endDate: new Date('2026-01-15T18:00:00'),
    address: {
      street: 'Place Hans-Jean Arp 1',
      city: 'Strasbourg',
      zipCode: '67000',
      country: 'France'
    },
    structureId: 7,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 158,
        name: 'Entrée Standard',
        areaId: 16,
        maxCapacity: 500,
        ticketPrice: 14.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 159,
        name: 'Entrée Réduite',
        areaId: 16,
        maxCapacity: 300,
        ticketPrice: 10.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Cette rétrospective d\'envergure internationale présente plus de 100 œuvres de Louise Bourgeois, depuis ses premiers dessins jusqu\'à ses célèbres sculptures monumentales. L\'exposition révèle comment l\'artiste a exploré tout au long de sa longue carrière les thèmes de la mémoire, de l\'identité et de la féminité.',
    links: ['https://www.mac-strasbourg.eu/expositions/louise-bourgeois'],
    mainPhotoUrl: 'https://picsum.photos/seed/event34/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event34b/800/400',
      'https://picsum.photos/seed/event34c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-05T10:45:00'),
    updatedAt: new Date('2025-04-10T13:30:00')
  },

  // Structure 8: Stade Vélodrome (évènements 1 à 3 sur 8)
  {
    id: 35,
    name: 'Match Ligue 1: OM vs PSG',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'Le Classique: l\'Olympique de Marseille affronte le Paris Saint-Germain dans ce derby national.',
    tags: ['football', 'Ligue 1', 'OM', 'match'],
    startDate: new Date('2025-05-10T21:00:00'),
    endDate: new Date('2025-05-10T23:00:00'),
    address: {
      street: 'Boulevard Michelet 3',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France'
    },
    structureId: 8,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 160,
        name: 'Virage Nord',
        areaId: 17,
        maxCapacity: 15000,
        ticketPrice: 35.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 150,
        seatsPerRow: 100
      },
      {
        id: 161,
        name: 'Virage Sud',
        areaId: 18,
        maxCapacity: 15000,
        ticketPrice: 35.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 150,
        seatsPerRow: 100
      },
      {
        id: 162,
        name: 'Tribune Ganay',
        areaId: 19,
        maxCapacity: 22000,
        ticketPrice: 50.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 100,
        seatsPerRow: 220
      },
      {
        id: 163,
        name: 'Tribune Jean Bouin',
        areaId: 20,
        maxCapacity: 15000,
        ticketPrice: 80.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 75,
        seatsPerRow: 200
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le match le plus attendu de la saison de Ligue 1 opposera l\'Olympique de Marseille au Paris Saint-Germain. Ce "Classique" du football français promet une ambiance électrique et un spectacle de haut niveau dans un Vélodrome à guichets fermés.',
    links: ['https://www.velodrome-marseille.com/matches/om-psg-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event35/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event35b/800/400',
      'https://picsum.photos/seed/event35c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-12-10T09:15:00'),
    updatedAt: new Date('2025-02-05T14:30:00')
  },
  {
    id: 36,
    name: 'Concert Stadium Tour: Coldplay',
    category: { id: 1, name: 'Music' },
    shortDescription: 'La superstar britannique Coldplay fait étape au Vélodrome dans le cadre de sa tournée mondiale.',
    tags: ['concert', 'pop-rock', 'tournée mondiale', 'stade'],
    startDate: new Date('2025-06-20T20:00:00'),
    endDate: new Date('2025-06-20T23:30:00'),
    address: {
      street: 'Boulevard Michelet 3',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France'
    },
    structureId: 8,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 164,
        name: 'Pelouse / Fosse',
        areaId: 21,
        maxCapacity: 25000,
        ticketPrice: 85.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 165,
        name: 'Gradins',
        areaId: 17,
        maxCapacity: 42000,
        ticketPrice: 75.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 300,
        seatsPerRow: 140
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Coldplay revient en France dans le cadre de sa tournée mondiale "Music of the Spheres". Le groupe britannique promet un spectacle grandiose et écologique avec effets visuels, bracelets LED, et leur répertoire de tubes planétaires pour une expérience musicale immersive.',
    links: ['https://www.velodrome-marseille.com/concerts/coldplay-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event36/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event36b/800/400',
      'https://picsum.photos/seed/event36c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-05T11:30:00'),
    updatedAt: new Date('2025-02-15T09:45:00')
  },
  {
    id: 37,
    name: 'Match Rugby Top 14: RC Toulon vs Stade Toulousain',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'Choc du Top 14 entre le RC Toulon et le Stade Toulousain délocalisé au Vélodrome.',
    tags: ['rugby', 'Top 14', 'match'],
    startDate: new Date('2025-07-12T15:00:00'),
    endDate: new Date('2025-07-12T17:00:00'),
    address: {
      street: 'Boulevard Michelet 3',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France'
    },
    structureId: 8,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 166,
        name: 'Virage Nord',
        areaId: 17,
        maxCapacity: 15000,
        ticketPrice: 30.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 150,
        seatsPerRow: 100
      },
      {
        id: 167,
        name: 'Virage Sud',
        areaId: 18,
        maxCapacity: 15000,
        ticketPrice: 30.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 150,
        seatsPerRow: 100
      },
      {
        id: 168,
        name: 'Tribune Ganay',
        areaId: 19,
        maxCapacity: 22000,
        ticketPrice: 45.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 100,
        seatsPerRow: 220
      },
      {
        id: 169,
        name: 'Tribune Jean Bouin',
        areaId: 20,
        maxCapacity: 15000,
        ticketPrice: 65.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 75,
        seatsPerRow: 200
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Le RC Toulon a choisi le Stade Vélodrome pour accueillir son match contre le Stade Toulousain, champion en titre du Top 14. Une affiche de prestige qui s\'annonce électrique entre deux des meilleures équipes françaises de rugby.',
    links: ['https://www.velodrome-marseille.com/matches/toulon-toulouse-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event37/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event37b/800/400',
      'https://picsum.photos/seed/event37c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-01T10:15:00'),
    updatedAt: new Date('2025-03-10T13:45:00')
  },
  {
    id: 38,
    name: 'Concert Stadium Tour: Rihanna',
    category: { id: 1, name: 'Music' },
    shortDescription: 'La superstar Rihanna présente son nouveau spectacle dans le cadre de sa tournée mondiale.',
    tags: ['concert', 'pop', 'R&B', 'tournée mondiale'],
    startDate: new Date('2025-08-05T21:00:00'),
    endDate: new Date('2025-08-05T23:30:00'),
    address: {
      street: 'Boulevard Michelet 3',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France'
    },
    structureId: 8,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    seatingZones: [
      {
        id: 170,
        name: 'Pelouse / Fosse',
        areaId: 21,
        maxCapacity: 25000,
        ticketPrice: 95.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 171,
        name: 'Gradins',
        areaId: 17,
        maxCapacity: 42000,
        ticketPrice: 85.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 300,
        seatsPerRow: 140
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Après plusieurs années d\'absence sur scène, Rihanna fait son grand retour avec une tournée mondiale exceptionnelle. Un show pharaonique associant ses plus grands tubes et les chansons de son dernier album, accompagné de danseurs, effets visuels et surprises.',
    links: ['https://www.velodrome-marseille.com/concerts/rihanna-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event38/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event38b/800/400',
      'https://picsum.photos/seed/event38c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-15T09:30:00'),
    updatedAt: new Date('2025-03-20T14:15:00')
  },
  {
    id: 39,
    name: 'Match Ligue 1: OM vs OL',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'L\'Olympique de Marseille reçoit l\'Olympique Lyonnais pour un choc du championnat.',
    tags: ['football', 'Ligue 1', 'OM', 'match'],
    startDate: new Date('2025-09-21T20:45:00'),
    endDate: new Date('2025-09-21T22:45:00'),
    address: {
      street: 'Boulevard Michelet 3',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France'
    },
    structureId: 8,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 172,
        name: 'Virage Nord',
        areaId: 17,
        maxCapacity: 15000,
        ticketPrice: 30.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 150,
        seatsPerRow: 100
      },
      {
        id: 173,
        name: 'Virage Sud',
        areaId: 18,
        maxCapacity: 15000,
        ticketPrice: 30.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 150,
        seatsPerRow: 100
      },
      {
        id: 174,
        name: 'Tribune Ganay',
        areaId: 19,
        maxCapacity: 22000,
        ticketPrice: 45.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 100,
        seatsPerRow: 220
      },
      {
        id: 175,
        name: 'Tribune Jean Bouin',
        areaId: 20,
        maxCapacity: 15000,
        ticketPrice: 65.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 75,
        seatsPerRow: 200
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'L\'un des grands classiques du championnat de France: l\'OM affronte l\'OL dans un match qui s\'annonce disputé. Rivalité historique entre ces deux clubs, cette rencontre promet intensité et spectacle dans un Vélodrome en ébullition.',
    links: ['https://www.velodrome-marseille.com/matches/om-ol-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event39/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event39b/800/400',
      'https://picsum.photos/seed/event39c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-01T11:30:00'),
    updatedAt: new Date('2025-04-05T09:15:00')
  },
  // Structure 8: Stade Vélodrome (suite et fin - événements 6 à 8 sur 8)
  {
    id: 40,
    name: 'Marathon de Marseille',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'Le grand marathon annuel de Marseille avec arrivée au Stade Vélodrome.',
    tags: ['marathon', 'course', 'running', 'sport'],
    startDate: new Date('2025-10-19T08:30:00'),
    endDate: new Date('2025-10-19T14:00:00'),
    address: {
      street: 'Boulevard Michelet 3',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France'
    },
    structureId: 8,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 176,
        name: 'Participation Marathon',
        areaId: 21,
        maxCapacity: 10000,
        ticketPrice: 45.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 177,
        name: 'Semi-Marathon',
        areaId: 21,
        maxCapacity: 8000,
        ticketPrice: 30.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 178,
        name: 'Course 10km',
        areaId: 21,
        maxCapacity: 12000,
        ticketPrice: 20.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Le Marathon de Marseille offre un parcours exceptionnel à travers la cité phocéenne, avec une arrivée spectaculaire au Stade Vélodrome. Trois formats sont proposés: marathon complet, semi-marathon et course de 10km. Un événement sportif populaire qui attire coureurs amateurs et confirmés.',
    links: ['https://www.velodrome-marseille.com/marathon-marseille-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event40/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event40b/800/400',
      'https://picsum.photos/seed/event40c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-20T09:45:00'),
    updatedAt: new Date('2025-04-15T11:30:00')
  },
  {
    id: 41,
    name: 'Festival de Musique Électronique',
    category: { id: 6, name: 'Festival' },
    shortDescription: 'Un jour entier dédié à la musique électronique avec les plus grands DJs internationaux.',
    tags: ['électronique', 'techno', 'festival', 'DJ set'],
    startDate: new Date('2025-11-15T16:00:00'),
    endDate: new Date('2025-11-16T04:00:00'),
    address: {
      street: 'Boulevard Michelet 3',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France'
    },
    structureId: 8,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 179,
        name: 'Accès Festival',
        areaId: 21,
        maxCapacity: 45000,
        ticketPrice: 65.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 180,
        name: 'VIP',
        areaId: 20,
        maxCapacity: 2000,
        ticketPrice: 120.00,
        isActive: true,
        seatingType: SeatingType.MIXED
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Stade Vélodrome se transforme en temple de la musique électronique pour une journée exceptionnelle. Sur trois scènes, retrouvez plus de 30 artistes internationaux représentant toutes les facettes de la musique électronique: techno, house, trance, drum & bass... Une expérience sensorielle unique avec des installations lumineuses et visuelles spectaculaires.',
    links: ['https://www.velodrome-marseille.com/festival-electro-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event41/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event41b/800/400',
      'https://picsum.photos/seed/event41c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-04-01T14:15:00'),
    updatedAt: new Date('2025-04-20T09:30:00')
  },
  {
    id: 42,
    name: 'Match Coupe d\'Europe: OM vs Bayern Munich',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'L\'Olympique de Marseille affronte le FC Bayern Munich en quart de finale de Ligue des Champions.',
    tags: ['football', 'coupe d\'Europe', 'champions league', 'OM'],
    startDate: new Date('2025-12-10T21:00:00'),
    endDate: new Date('2025-12-10T23:00:00'),
    address: {
      street: 'Boulevard Michelet 3',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France'
    },
    structureId: 8,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 181,
        name: 'Virage Nord',
        areaId: 17,
        maxCapacity: 15000,
        ticketPrice: 50.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 150,
        seatsPerRow: 100
      },
      {
        id: 182,
        name: 'Virage Sud',
        areaId: 18,
        maxCapacity: 15000,
        ticketPrice: 50.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 150,
        seatsPerRow: 100
      },
      {
        id: 183,
        name: 'Tribune Ganay',
        areaId: 19,
        maxCapacity: 22000,
        ticketPrice: 75.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 100,
        seatsPerRow: 220
      },
      {
        id: 184,
        name: 'Tribune Jean Bouin',
        areaId: 20,
        maxCapacity: 15000,
        ticketPrice: 100.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 75,
        seatsPerRow: 200
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Affrontement au sommet du football européen avec ce quart de finale de Ligue des Champions. L\'OM tentera de faire tomber le géant bavarois dans un Vélodrome en fusion. Un match qui s\'annonce historique et passionnant entre deux clubs légendaires du football continental.',
    links: ['https://www.velodrome-marseille.com/matches/om-bayern-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event42/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event42b/800/400',
      'https://picsum.photos/seed/event42c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-04-15T10:30:00'),
    updatedAt: new Date('2025-05-01T13:45:00')
  },

  // Structure 9: Galerie Lumière (eventsCount: 5)
  {
    id: 43,
    name: 'Exposition: Photographie Contemporaine Japonaise',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Une exposition collective regroupant les œuvres de 8 photographes japonais contemporains.',
    tags: ['photographie', 'Japon', 'art contemporain', 'exposition'],
    startDate: new Date('2025-06-05T10:00:00'),
    endDate: new Date('2025-08-15T19:00:00'),
    address: {
      street: 'Rue des Arts 17',
      city: 'Nice',
      zipCode: '06000',
      country: 'France'
    },
    structureId: 9,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 185,
        name: 'Entrée Exposition',
        areaId: 22,
        maxCapacity: 100,
        ticketPrice: 8.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Cette exposition met en lumière la scène photographique japonaise contemporaine à travers les œuvres de huit artistes majeurs. Explorant des thématiques variées - urbaines, intimes, conceptuelles ou documentaires - les photographies exposées offrent un regard singulier sur le Japon d\'aujourd\'hui et ses transformations sociales et culturelles.',
    links: ['https://www.galerielumiere.fr/expositions/photographie-japonaise'],
    mainPhotoUrl: 'https://picsum.photos/seed/event43/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event43b/800/400',
      'https://picsum.photos/seed/event43c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-15T11:30:00'),
    updatedAt: new Date('2025-02-10T14:45:00')
  },
  {
    id: 44,
    name: 'Installation: "Fragments" par Camille Leroy',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Installation immersive mêlant sculptures, projections vidéo et sons.',
    tags: ['installation', 'art contemporain', 'multimédia', 'immersif'],
    startDate: new Date('2025-09-10T10:00:00'),
    endDate: new Date('2025-10-25T19:00:00'),
    address: {
      street: 'Rue des Arts 17',
      city: 'Nice',
      zipCode: '06000',
      country: 'France'
    },
    structureId: 9,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 186,
        name: 'Entrée Exposition',
        areaId: 22,
        maxCapacity: 50,
        ticketPrice: 10.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    fullDescription: '"Fragments" est une installation immersive créée spécifiquement pour la Galerie Lumière par l\'artiste Camille Leroy. L\'œuvre transforme l\'espace d\'exposition en un environnement sensoriel où se mêlent sculptures suspendues, projections vidéo et paysage sonore, invitant le visiteur à une expérience méditative sur la notion de mémoire et de perception.',
    links: ['https://www.galerielumiere.fr/expositions/fragments-camille-leroy'],
    mainPhotoUrl: 'https://picsum.photos/seed/event44/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event44b/800/400',
      'https://picsum.photos/seed/event44c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-20T09:15:00'),
    updatedAt: new Date('2025-03-15T13:20:00')
  },
  {
    id: 45,
    name: 'Exposition: Nouveaux Talents Méditerranéens',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Découverte de cinq jeunes artistes émergents du bassin méditerranéen.',
    tags: ['art émergent', 'méditerranée', 'peinture', 'sculpture'],
    startDate: new Date('2025-11-05T10:00:00'),
    endDate: new Date('2025-12-20T19:00:00'),
    address: {
      street: 'Rue des Arts 17',
      city: 'Nice',
      zipCode: '06000',
      country: 'France'
    },
    structureId: 9,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 187,
        name: 'Entrée Exposition',
        areaId: 22,
        maxCapacity: 100,
        ticketPrice: 6.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'La Galerie Lumière confirme son engagement en faveur de l\'art émergent avec cette exposition collective présentant cinq jeunes talents du bassin méditerranéen. Sélectionnés pour leur approche novatrice et leur ancrage dans les problématiques contemporaines, ces artistes originaires d\'Espagne, d\'Italie, du Maroc, de Tunisie et de Grèce proposent un panorama stimulant de la création actuelle.',
    links: ['https://www.galerielumiere.fr/expositions/talents-mediterraneens'],
    mainPhotoUrl: 'https://picsum.photos/seed/event45/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event45b/800/400',
      'https://picsum.photos/seed/event45c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-10T14:30:00'),
    updatedAt: new Date('2025-04-05T10:15:00')
  },
  {
    id: 46,
    name: 'Vernissage: Rétrospective Elena Dumont',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Soirée d\'ouverture de l\'exposition consacrée à l\'œuvre d\'Elena Dumont.',
    tags: ['vernissage', 'peinture', 'art contemporain', 'soirée'],
    startDate: new Date('2026-01-15T18:00:00'),
    endDate: new Date('2026-01-15T21:00:00'),
    address: {
      street: 'Rue des Arts 17',
      city: 'Nice',
      zipCode: '06000',
      country: 'France'
    },
    structureId: 9,
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 188,
        name: 'Entrée Vernissage',
        areaId: 22,
        maxCapacity: 150,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'La Galerie Lumière a l\'honneur d\'accueillir l\'artiste Elena Dumont pour une rétrospective majeure couvrant 25 ans de création. Venez rencontrer l\'artiste lors du vernissage en présence de nombreuses personnalités du monde culturel. Un cocktail sera servi et l\'artiste donnera une conférence à 19h sur son parcours et sa démarche artistique.',
    links: ['https://www.galerielumiere.fr/vernissage-elena-dumont'],
    mainPhotoUrl: 'https://picsum.photos/seed/event46/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event46b/800/400',
      'https://picsum.photos/seed/event46c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-04-05T11:45:00'),
    updatedAt: new Date('2025-04-25T15:30:00')
  },
  {
    id: 47,
    name: 'Conférence: L\'Art à l\'Ère Numérique',
    category: { id: 4, name: 'Conference' },
    shortDescription: 'Table ronde sur l\'impact des technologies numériques dans l\'art contemporain.',
    tags: ['conférence', 'art numérique', 'NFT', 'technologies'],
    startDate: new Date('2026-02-05T18:30:00'),
    endDate: new Date('2026-02-05T20:30:00'),
    address: {
      street: 'Rue des Arts 17',
      city: 'Nice',
      zipCode: '06000',
      country: 'France'
    },
    structureId: 9,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 189,
        name: 'Place Conférence',
        areaId: 23,
        maxCapacity: 60,
        ticketPrice: 5.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 6,
        seatsPerRow: 10
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Cette conférence réunit artistes, critiques et experts du marché de l\'art pour explorer comment les technologies numériques transforment la création artistique contemporaine. Au programme: discussions sur l\'art génératif, les NFTs, la réalité virtuelle et les nouveaux modèles économiques émergents dans le monde de l\'art.',
    links: ['https://www.galerielumiere.fr/conferences/art-numerique'],
    mainPhotoUrl: 'https://picsum.photos/seed/event47/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event47b/800/400',
      'https://picsum.photos/seed/event47c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-04-20T09:30:00'),
    updatedAt: new Date('2025-05-10T11:15:00')
  },

  // Structure 10: Complexe Sportif Jean Bouin (eventsCount: 6) - Début
  {
    id: 48,
    name: 'Tournoi de Tennis Amateur',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'Compétition de tennis ouverte aux joueurs amateurs de tous niveaux.',
    tags: ['tennis', 'tournoi', 'amateur', 'sport'],
    startDate: new Date('2025-05-15T09:00:00'),
    endDate: new Date('2025-05-17T18:00:00'),
    address: {
      street: 'Rue Jean Bouin 10',
      city: 'Dijon',
      zipCode: '21000',
      country: 'France'
    },
    structureId: 10,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 190,
        name: 'Inscription Tournoi',
        areaId: 24,
        maxCapacity: 128,
        ticketPrice: 25.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 191,
        name: 'Accès Public',
        areaId: 25,
        maxCapacity: 500,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Le Complexe Sportif Jean Bouin organise son tournoi annuel de tennis ouvert aux amateurs. Quatre catégories sont proposées selon les niveaux (débutant à confirmé), en simple et en double. Les matchs se dérouleront sur trois jours dans une ambiance conviviale, avec animations et buvette sur place.',
    links: ['https://www.complexejeanbouin.fr/tournoi-tennis-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event48/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event48b/800/400',
      'https://picsum.photos/seed/event48c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2024-12-10T14:30:00'),
    updatedAt: new Date('2025-01-15T16:45:00')
  },
  {
    id: 49,
    name: 'Challenge Natation Jeunes',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'Compétition de natation régionale pour les jeunes de 8 à 16 ans.',
    tags: ['natation', 'compétition', 'jeunesse', 'sport'],
    startDate: new Date('2025-06-07T10:00:00'),
    endDate: new Date('2025-06-08T17:00:00'),
    address: {
      street: 'Rue Jean Bouin 10',
      city: 'Dijon',
      zipCode: '21000',
      country: 'France'
    },
    structureId: 10,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 192,
        name: 'Inscription Nageurs',
        areaId: 26,
        maxCapacity: 200,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 193,
        name: 'Tribune Spectateurs',
        areaId: 27,
        maxCapacity: 800,
        ticketPrice: 5.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 40
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Le Challenge Natation Jeunes rassemble les meilleurs espoirs de la région dans des épreuves adaptées à chaque catégorie d\'âge. Organisé sur deux jours, il comprend toutes les nages olympiques ainsi que des relais par équipe. Un événement familial qui met en valeur la relève de la natation régionale.',
    links: ['https://www.complexejeanbouin.fr/challenge-natation-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event49/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event49b/800/400',
      'https://picsum.photos/seed/event49c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-20T10:15:00'),
    updatedAt: new Date('2025-02-25T13:30:00')
  },
  // Structure 10: Complexe Sportif Jean Bouin (suite - événements 3 à 6 sur 6)
  {
    id: 50,
    name: 'Tournoi International de Basket-ball',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'Compétition de basket-ball réunissant des équipes juniors internationales.',
    tags: ['basket-ball', 'international', 'junior', 'tournoi'],
    startDate: new Date('2025-07-10T09:00:00'),
    endDate: new Date('2025-07-13T19:00:00'),
    address: {
      street: 'Rue Jean Bouin 10',
      city: 'Dijon',
      zipCode: '21000',
      country: 'France'
    },
    structureId: 10,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 194,
        name: 'Tribunes Latérales',
        areaId: 28,
        maxCapacity: 1200,
        ticketPrice: 10.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 40
      },
      {
        id: 195,
        name: 'Tribunes Centrales',
        areaId: 28,
        maxCapacity: 800,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 20,
        seatsPerRow: 40
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Tournoi International de Basket-ball Junior rassemble 16 équipes U18 venues d\'Europe, d\'Amérique et d\'Asie. Pendant quatre jours, assistez à des rencontres de haut niveau et découvrez les futures stars du basket mondial. En marge de la compétition, des animations, démonstrations et séances de dédicaces sont prévues.',
    links: ['https://www.complexejeanbouin.fr/tournoi-basket-international'],
    mainPhotoUrl: 'https://picsum.photos/seed/event50/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event50b/800/400',
      'https://picsum.photos/seed/event50c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-10T11:30:00'),
    updatedAt: new Date('2025-03-05T15:45:00')
  },
  {
    id: 51,
    name: 'Gala de Gymnastique Artistique',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'Spectacle annuel des clubs de gymnastique de la région présentant leurs meilleurs athlètes.',
    tags: ['gymnastique', 'gala', 'spectacle', 'sport'],
    startDate: new Date('2025-08-30T19:00:00'),
    endDate: new Date('2025-08-30T22:00:00'),
    address: {
      street: 'Rue Jean Bouin 10',
      city: 'Dijon',
      zipCode: '21000',
      country: 'France'
    },
    structureId: 10,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 196,
        name: 'Placement Standard',
        areaId: 28,
        maxCapacity: 2000,
        ticketPrice: 12.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 50,
        seatsPerRow: 40
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Le Gala de Gymnastique Artistique met en lumière les performances des gymnastes de la région, des plus jeunes talents aux athlètes confirmés. Au programme: démonstrations aux différents agrès, chorégraphies au sol et numéros spéciaux combinant acrobaties et expression artistique.',
    links: ['https://www.complexejeanbouin.fr/gala-gymnastique-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event51/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event51b/800/400',
      'https://picsum.photos/seed/event51c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-05T10:15:00'),
    updatedAt: new Date('2025-03-30T14:20:00')
  },
  {
    id: 52,
    name: 'Course Solidaire 10km',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'Course à pied caritative au profit de la recherche contre le cancer.',
    tags: ['course', 'solidarité', 'santé', 'caritatif'],
    startDate: new Date('2025-09-21T10:00:00'),
    endDate: new Date('2025-09-21T13:00:00'),
    address: {
      street: 'Rue Jean Bouin 10',
      city: 'Dijon',
      zipCode: '21000',
      country: 'France'
    },
    structureId: 10,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 197,
        name: 'Inscription Course',
        areaId: 24,
        maxCapacity: 3000,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 198,
        name: 'Marche Solidaire',
        areaId: 24,
        maxCapacity: 2000,
        ticketPrice: 10.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Participez à la 5ème édition de la Course Solidaire, dont l\'intégralité des bénéfices sera reversée à la recherche contre le cancer. Au choix: course chronométrée de 10km ou marche solidaire de 5km. Chaque participant recevra un t-shirt commémoratif et contribuera directement à cette noble cause.',
    links: ['https://www.complexejeanbouin.fr/course-solidaire-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event52/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event52b/800/400',
      'https://picsum.photos/seed/event52c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-20T09:30:00'),
    updatedAt: new Date('2025-04-10T13:45:00')
  },
  {
    id: 53,
    name: 'Meeting d\'Athlétisme Régional',
    category: { id: 3, name: 'Sport' },
    shortDescription: 'Compétition d\'athlétisme regroupant les meilleurs athlètes de la région.',
    tags: ['athlétisme', 'compétition', 'sport', 'régional'],
    startDate: new Date('2025-10-11T13:00:00'),
    endDate: new Date('2025-10-11T18:00:00'),
    address: {
      street: 'Rue Jean Bouin 10',
      city: 'Dijon',
      zipCode: '21000',
      country: 'France'
    },
    structureId: 10,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 199,
        name: 'Tribune Principale',
        areaId: 29,
        maxCapacity: 1500,
        ticketPrice: 8.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 50
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Le Meeting d\'Athlétisme Régional offre une journée complète de compétition avec toutes les disciplines olympiques: sprint, demi-fond, fond, sauts, lancers et épreuves combinées. Venez encourager les meilleurs athlètes de la région dans une ambiance conviviale et festive.',
    links: ['https://www.complexejeanbouin.fr/meeting-athletisme-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event53/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event53b/800/400',
      'https://picsum.photos/seed/event53c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-04-01T11:15:00'),
    updatedAt: new Date('2025-04-25T09:30:00')
  },

  // Structure 11: Abbaye de Sénanque (eventsCount: 4)
  {
    id: 54,
    name: 'Concert Musique Sacrée',
    category: { id: 1, name: 'Music' },
    shortDescription: 'Concert de musique sacrée médiévale dans le cadre acoustique exceptionnel de l\'abbaye.',
    tags: ['musique sacrée', 'médiéval', 'concert', 'abbaye'],
    startDate: new Date('2025-06-15T21:00:00'),
    endDate: new Date('2025-06-15T22:30:00'),
    address: {
      street: 'Route de Sénanque',
      city: 'Gordes',
      zipCode: '84220',
      country: 'France'
    },
    structureId: 11,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 200,
        name: 'Église Abbatiale',
        areaId: 30,
        maxCapacity: 300,
        ticketPrice: 25.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 30,
        seatsPerRow: 10
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'L\'ensemble "Vox Clamantis" interprète un répertoire de chants grégoriens et polyphonies médiévales dans l\'église abbatiale de Sénanque. L\'acoustique exceptionnelle du lieu et la mise en lumière sobre mettent en valeur ce programme spirituel qui résonne particulièrement dans ce monastère cistercien du XIIe siècle.',
    links: ['https://www.abbayedesenanque.com/concerts/musique-sacree-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event54/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event54b/800/400',
      'https://picsum.photos/seed/event54c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-10T14:30:00'),
    updatedAt: new Date('2025-02-15T11:45:00')
  },
  {
    id: 55,
    name: 'Exposition: Photographies "Silence et Lumière"',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Exposition photographique explorant la vie monastique et l\'architecture cistercienne.',
    tags: ['photographie', 'art sacré', 'exposition', 'architecture'],
    startDate: new Date('2025-07-01T10:00:00'),
    endDate: new Date('2025-08-31T18:00:00'),
    address: {
      street: 'Route de Sénanque',
      city: 'Gordes',
      zipCode: '84220',
      country: 'France'
    },
    structureId: 11,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 201,
        name: 'Entrée Exposition',
        areaId: 31,
        maxCapacity: 100,
        ticketPrice: 5.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Le photographe Michel Laurent présente une série d\'images saisissantes sur la vie monastique et l\'architecture cistercienne. Ses clichés en noir et blanc capturent les jeux de lumière dans les édifices religieux et témoignent de la spiritualité des lieux. L\'exposition est présentée dans l\'ancien dortoir des moines, récemment restauré.',
    links: ['https://www.abbayedesenanque.com/expositions/silence-et-lumiere'],
    mainPhotoUrl: 'https://picsum.photos/seed/event55/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event55b/800/400',
      'https://picsum.photos/seed/event55c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-05T09:45:00'),
    updatedAt: new Date('2025-03-10T13:20:00')
  },
  {
    id: 56,
    name: 'Conférence: Histoire de l\'Art Cistercien',
    category: { id: 4, name: 'Conference' },
    shortDescription: 'Cycle de conférences sur l\'architecture et l\'art des monastères cisterciens.',
    tags: ['histoire de l\'art', 'architecture', 'conférence', 'patrimoine'],
    startDate: new Date('2025-09-13T14:30:00'),
    endDate: new Date('2025-09-13T17:00:00'),
    address: {
      street: 'Route de Sénanque',
      city: 'Gordes',
      zipCode: '84220',
      country: 'France'
    },
    structureId: 11,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 202,
        name: 'Salle du Chapitre',
        areaId: 32,
        maxCapacity: 80,
        ticketPrice: 12.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 8,
        seatsPerRow: 10
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'La professeure Marie Dumont, spécialiste de l\'art médiéval, propose une série de trois conférences sur l\'architecture cistercienne, ses principes et son influence. La journée comprend également une visite guidée approfondie de l\'abbaye pour comprendre in situ les caractéristiques de cet art où simplicité et lumière jouent un rôle essentiel.',
    links: ['https://www.abbayedesenanque.com/conferences/art-cistercien'],
    mainPhotoUrl: 'https://picsum.photos/seed/event56/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event56b/800/400',
      'https://picsum.photos/seed/event56c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-01T10:30:00'),
    updatedAt: new Date('2025-03-25T16:15:00')
  },
  {
    id: 57,
    name: 'Retraite Spirituelle: Silence et Méditation',
    category: { id: 7, name: 'Other' },
    shortDescription: 'Week-end de ressourcement spirituel dans la tradition cistercienne.',
    tags: ['spiritualité', 'méditation', 'retraite', 'bien-être'],
    startDate: new Date('2025-10-17T16:00:00'),
    endDate: new Date('2025-10-19T14:00:00'),
    address: {
      street: 'Route de Sénanque',
      city: 'Gordes',
      zipCode: '84220',
      country: 'France'
    },
    structureId: 11,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 203,
        name: 'Participation Retraite',
        areaId: 33,
        maxCapacity: 25,
        ticketPrice: 180.00, // Avec hébergement et repas
        isActive: true,
        seatingType: SeatingType.SEATED
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Cette retraite de deux jours propose une immersion dans le silence et la méditation, inspirée par la tradition cistercienne. Guidée par Frère Jean et une enseignante de méditation, elle alterne temps de pratique, enseignements, et participation aux offices. L\'hébergement et les repas sont inclus, dans le respect de la simplicité monastique.',
    links: ['https://www.abbayedesenanque.com/retraites/silence-meditation'],
    mainPhotoUrl: 'https://picsum.photos/seed/event57/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event57b/800/400',
      'https://picsum.photos/seed/event57c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-20T11:45:00'),
    updatedAt: new Date('2025-04-10T09:30:00')
  },

  // Structure 12: École Nationale Supérieure d'Art (eventsCount: 7)
  {
    id: 58,
    name: 'Exposition des Diplômés',
    category: { id: 5, name: 'Exhibition' },
    shortDescription: 'Présentation des projets de fin d\'études des étudiants diplômés.',
    tags: ['art contemporain', 'jeunes artistes', 'exposition', 'diplômes'],
    startDate: new Date('2025-06-20T18:00:00'),
    endDate: new Date('2025-07-15T19:00:00'),
    address: {
      street: 'Rue des Beaux-Arts 5',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France'
    },
    structureId: 12,
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 204,
        name: 'Galerie de l\'École',
        areaId: 34,
        maxCapacity: 200,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'L\'exposition annuelle des diplômés présente les projets de fin d\'études des étudiants de l\'École Nationale Supérieure d\'Art. Peinture, sculpture, installations, vidéo, design, photographie: découvrez la diversité et la créativité de cette nouvelle génération d\'artistes à travers plus de 50 projets répartis dans les espaces d\'exposition de l\'école.',
    links: ['https://www.ensa-toulouse.fr/expositions/diplomes-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event58/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event58b/800/400',
      'https://picsum.photos/seed/event58c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-01-15T10:30:00'),
    updatedAt: new Date('2025-02-10T14:15:00')
  },
  {
    id: 59,
    name: 'Festival Arts Numériques',
    category: { id: 6, name: 'Festival' },
    shortDescription: 'Week-end dédié aux arts numériques avec installations interactives et performances.',
    tags: ['art numérique', 'interactif', 'festival', 'technologie'],
    startDate: new Date('2025-07-25T14:00:00'),
    endDate: new Date('2025-07-27T22:00:00'),
    address: {
      street: 'Rue des Beaux-Arts 5',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France'
    },
    structureId: 12,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 205,
        name: 'Pass Festival',
        areaId: 34,
        maxCapacity: 500,
        ticketPrice: 15.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 206,
        name: 'Pass Journée',
        areaId: 34,
        maxCapacity: 300,
        ticketPrice: 8.00,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: 'Le Festival Arts Numériques transforme l\'école en un laboratoire d\'expérimentations interactives. Au programme: installations immersives, performances audiovisuelles, ateliers de création assistée par ordinateur, et conférences sur les nouvelles technologies dans l\'art. Un événement qui questionne notre relation au numérique à travers des œuvres ludiques et réflexives.',
    links: ['https://www.ensa-toulouse.fr/festival-arts-numeriques'],
    mainPhotoUrl: 'https://picsum.photos/seed/event59/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event59b/800/400',
      'https://picsum.photos/seed/event59c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-10T11:45:00'),
    updatedAt: new Date('2025-03-05T10:30:00')
  },
  {
    id: 60,
    name: 'Workshop Photo Documentaire',
    category: { id: 7, name: 'Other' },
    shortDescription: 'Atelier de photographie documentaire dirigé par le photographe Thomas Pesquet.',
    tags: ['photographie', 'documentaire', 'formation', 'workshop'],
    startDate: new Date('2025-08-18T09:00:00'),
    endDate: new Date('2025-08-22T18:00:00'),
    address: {
      street: 'Rue des Beaux-Arts 5',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France'
    },
    structureId: 12,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 207,
        name: 'Participation Workshop',
        areaId: 35,
        maxCapacity: 20,
        ticketPrice: 350.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 4,
        seatsPerRow: 5
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Ce workshop intensif de 5 jours, dirigé par le célèbre photographe Thomas Pesquet, est ouvert aux étudiants et professionnels qui souhaitent approfondir leur pratique de la photographie documentaire. À travers des sessions théoriques, des critiques de portfolio et un projet sur le terrain, les participants développeront leur regard et leur approche narrative.',
    links: ['https://www.ensa-toulouse.fr/workshops/photo-documentaire'],
    mainPhotoUrl: 'https://picsum.photos/seed/event60/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event60b/800/400',
      'https://picsum.photos/seed/event60c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-02-25T14:15:00'),
    updatedAt: new Date('2025-03-20T09:40:00')
  },
  {
    id: 61,
    name: 'Conférence: Design et Écologie',
    category: { id: 4, name: 'Conference' },
    shortDescription: 'Série de conférences sur les pratiques durables et éthiques en design.',
    tags: ['design', 'écologie', 'conférence', 'développement durable'],
    startDate: new Date('2025-09-25T14:00:00'),
    endDate: new Date('2025-09-26T18:00:00'),
    address: {
      street: 'Rue des Beaux-Arts 5',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France'
    },
    structureId: 12,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 208,
        name: 'Amphithéâtre',
        areaId: 36,
        maxCapacity: 150,
        ticketPrice: 10.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 15,
        seatsPerRow: 10
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Ce cycle de conférences réunit designers, chercheurs et entrepreneurs pour explorer les enjeux écologiques dans le design contemporain. Comment concevoir des objets et services plus durables? Quels matériaux privilégier? Comment repenser les cycles de production et de consommation? Deux jours de réflexion et de partage d\'expériences pour imaginer un design plus responsable.',
    links: ['https://www.ensa-toulouse.fr/conferences/design-ecologie'],
    mainPhotoUrl: 'https://picsum.photos/seed/event61/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event61b/800/400',
      'https://picsum.photos/seed/event61c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-10T11:30:00'),
    updatedAt: new Date('2025-04-05T15:45:00')
  },
  {
    id: 62,
    name: 'Portes Ouvertes ENSA',
    category: { id: 7, name: 'Other' },
    shortDescription: 'Journée de découverte des formations et installations de l\'École Nationale Supérieure d\'Art.',
    tags: ['formation', 'art', 'portes ouvertes', 'orientation'],
    startDate: new Date('2025-10-18T10:00:00'),
    endDate: new Date('2025-10-18T18:00:00'),
    address: {
      street: 'Rue des Beaux-Arts 5',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France'
    },
    structureId: 12,
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    seatingZones: [
      {
        id: 209,
        name: 'Accès Libre',
        areaId: 37,
        maxCapacity: 800,
        ticketPrice: 0,
        isActive: true,
        seatingType: SeatingType.STANDING
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    fullDescription: 'Les Portes Ouvertes annuelles permettent de découvrir l\'école, ses formations et ses installations. Au programme: présentation des cursus, visite des ateliers, exposition des travaux d\'étudiants, démonstrations techniques et rencontres avec enseignants et étudiants. Une occasion unique d\'en savoir plus sur les métiers de la création et les modalités d\'admission.',
    links: ['https://www.ensa-toulouse.fr/portes-ouvertes-2025'],
    mainPhotoUrl: 'https://picsum.photos/seed/event62/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event62b/800/400',
      'https://picsum.photos/seed/event62c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-03-25T09:15:00'),
    updatedAt: new Date('2025-04-15T11:30:00')
  },
  {
    id: 63,
    name: 'Projection: Cinéma Expérimental',
    category: { id: 2, name: 'Cinema' },
    shortDescription: 'Soirée de projections dédiée au cinéma expérimental et d\'avant-garde.',
    tags: ['cinéma expérimental', 'projection', 'avant-garde', 'art vidéo'],
    startDate: new Date('2025-11-07T19:30:00'),
    endDate: new Date('2025-11-07T22:30:00'),
    address: {
      street: 'Rue des Beaux-Arts 5',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France'
    },
    structureId: 12,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 210,
        name: 'Salle de Projection',
        areaId: 38,
        maxCapacity: 100,
        ticketPrice: 6.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 10,
        seatsPerRow: 10
      }
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    fullDescription: 'Cette soirée propose un panorama du cinéma expérimental, de ses origines à ses formes contemporaines. Au programme: courts-métrages d\'avant-garde historiques, films abstraits, ciné-poèmes et art vidéo. La séance sera suivie d\'une discussion avec deux réalisateurs présents et un historien du cinéma expérimental.',
    links: ['https://www.ensa-toulouse.fr/projections/cinema-experimental'],
    mainPhotoUrl: 'https://picsum.photos/seed/event63/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event63b/800/400',
      'https://picsum.photos/seed/event63c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-04-05T13:45:00'),
    updatedAt: new Date('2025-04-25T10:30:00')
  },
  {
    id: 64,
    name: 'Performance: "Traversées"',
    category: { id: 7, name: 'Other' },
    shortDescription: 'Performance interdisciplinaire mêlant danse, arts visuels et musique électronique.',
    tags: ['performance', 'danse contemporaine', 'arts visuels', 'musique électronique'],
    startDate: new Date('2025-12-05T20:00:00'),
    endDate: new Date('2025-12-05T21:30:00'),
    address: {
      street: 'Rue des Beaux-Arts 5',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France'
    },
    structureId: 12,
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    seatingZones: [
      {
        id: 211,
        name: 'Espace Performance',
        areaId: 39,
        maxCapacity: 120,
        ticketPrice: 12.00,
        isActive: true,
        seatingType: SeatingType.SEATED,
        rowCount: 12,
        seatsPerRow: 10
      }
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    fullDescription: '"Traversées" est une création collective issue d\'une collaboration entre étudiants et enseignants de l\'ENSA. Cette performance hybride explore les thèmes du déplacement et des frontières à travers une expérience immersive où corps en mouvement, projections vidéo et compositions électroniques dialoguent dans l\'espace.',
    links: ['https://www.ensa-toulouse.fr/performances/traversees'],
    mainPhotoUrl: 'https://picsum.photos/seed/event64/800/400',
    eventPhotoUrls: [
      'https://picsum.photos/seed/event64b/800/400',
      'https://picsum.photos/seed/event64c/800/400'
    ],
    status: 'published',
    createdAt: new Date('2025-04-20T10:15:00'),
    updatedAt: new Date('2025-05-10T13:45:00')
  }
];
