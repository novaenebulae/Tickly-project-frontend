import {SeatingType} from '../../../models/event/event-audience-zone.model';
import {MockApiEventDto} from '../events.mock';
import {EventStatus} from '../../../models/event/event.model';

// Helper pour générer des dates futures relatives
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const today = new Date();

export const allMockEvents: MockApiEventDto[] = [
  {
    id: 1,
    name: 'Festival Rock en Seine',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Le plus grand festival rock de Paris revient pour une édition explosive !',
    fullDescription: 'Vibrez au son des meilleures guitares du moment avec des têtes d\'affiche internationales et des découvertes prometteuses. Trois jours de musique non-stop, de rencontres et d\'ambiance électrique au cœur du Domaine National de Saint-Cloud.',
    tags: ['rock', 'pop', 'live', 'paris', 'festival'],
    startDate: addDays(today, 30).toISOString(),
    endDate: addDays(today, 32).toISOString(),
    address: {
      street: 'Domaine National de Saint-Cloud',
      city: 'Saint-Cloud',
      zipCode: '92210',
      country: 'France',
    },
    structureId: 1,
    areas: [
      {id: 101, name: 'Grande Scène Park'},
      {id: 102, name: 'Scène Cascade Park'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {
        id: 1001,
        name: 'Fosse Or - Scène Principale',
        areaId: 101,
        maxCapacity: 5000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 1002,
        name: 'Pelouse Scène Principale',
        areaId: 101,
        maxCapacity: 15000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 1003,
        name: 'Gradins Scène Cascade',
        areaId: 102,
        maxCapacity: 2000,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    links: ['https://www.rockenseine.com/'],
    mainPhotoUrl: `https://picsum.photos/seed/event1/800/400`,
    eventPhotoUrls: [`https://picsum.photos/seed/event1_gallery1/600/350`, `https://picsum.photos/seed/event1_gallery2/600/350`],
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -60).toISOString(),
    updatedAt: addDays(today, -10).toISOString(),
  },
  {
    id: 2,
    name: 'Concert Symphonique : Les Quatre Saisons',
    category: {id: 1, name: 'Concert'},
    shortDescription: 'Redécouvrez le chef-d\'œuvre de Vivaldi par l\'Orchestre Philharmonique.',
    fullDescription: 'Une soirée magique vous attend avec l\'interprétation vibrante des Quatre Saisons de Vivaldi, suivie d\'autres pièces maîtresses du répertoire classique. Un moment de pure émotion musicale à ne pas manquer.',
    tags: ['classique', 'vivaldi', 'orchestre', 'lyon'],
    startDate: addDays(today, 45).toISOString(),
    endDate: addDays(today, 45).toISOString().replace('T18', 'T20'),
    address: {
      street: 'Auditorium Maurice Ravel, 149 Rue Garibaldi',
      city: 'Lyon',
      zipCode: '69003',
      country: 'France',
    },
    structureId: 2,
    areas: [
      {id: 201, name: 'Grande Salle Symphonique'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 2001,
        name: 'Parterre Central',
        areaId: 201,
        maxCapacity: 800,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 2002,
        name: 'Balcon Premier',
        areaId: 201,
        maxCapacity: 400,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event2/800/400`,
    eventPhotoUrls: [],
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -90).toISOString(),
    updatedAt: addDays(today, -5).toISOString(),
  },
  {
    id: 3,
    name: 'Exposition "Art Numérique Rétrospectif"',
    category: {id: 4, name: 'Exposition'},
    shortDescription: 'Un voyage à travers l\'évolution de l\'art numérique.',
    fullDescription: 'Découvrez les pionniers et les œuvres marquantes qui ont façonné l\'art numérique, des premières expérimentations aux créations immersives d\'aujourd\'hui. Une exposition interactive pour tous les âges.',
    tags: ['art', 'numérique', 'exposition', 'marseille', 'technologie'],
    startDate: addDays(today, -15).toISOString(),
    endDate: addDays(today, 60).toISOString(),
    address: {
      street: 'La Friche Belle de Mai, 41 Rue Jobin',
      city: 'Marseille',
      zipCode: '13003',
      country: 'France',
    },
    structureId: 3,
    areas: [
      {id: 301, name: 'Galerie Principale (Exposition)'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 3001,
        name: 'Salle Principale Expo',
        areaId: 301,
        maxCapacity: 300,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event3/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -120).toISOString(),
  },
  {
    id: 4,
    name: 'Match de Championnat - FC Local vs Étoile FC',
    category: {id: 5, name: 'Sport'},
    shortDescription: 'Le derby tant attendu pour la suprématie locale !',
    fullDescription: 'Venez supporter votre équipe dans ce match crucial du championnat. Ambiance garantie dans les tribunes pour ce face-à-face qui promet des étincelles et du beau jeu.',
    tags: ['football', 'sport', 'match', 'local', 'championnat'],
    startDate: addDays(today, 7).toISOString().replace('T18', 'T20:30'),
    endDate: addDays(today, 7).toISOString().replace('T18', 'T22:30'),
    address: {
      street: 'Stade Municipal',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France',
    },
    structureId: 4,
    areas: [
      {id: 401, name: 'Terrain Principal et Tribunes'},
      {id: 402, name: 'Virages (Zones Debout)'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {id: 4001, name: 'Tribune Nord', areaId: 401, maxCapacity: 5000, isActive: true, seatingType: SeatingType.SEATED},
      {id: 4002, name: 'Tribune Sud', areaId: 401, maxCapacity: 5000, isActive: true, seatingType: SeatingType.SEATED},
      {
        id: 4003,
        name: 'Virage Est (Debout)',
        areaId: 402,
        maxCapacity: 3000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event4/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -30).toISOString(),
  },
  {
    id: 5,
    name: 'Conférence : L\'Avenir de l\'IA',
    category: {id: 6, name: 'Conférence'},
    shortDescription: 'Experts et chercheurs débattent des prochaines révolutions de l\'IA.',
    fullDescription: 'Participez à une journée de discussions éclairantes sur les avancées, les défis éthiques et les impacts sociétaux de l\'intelligence artificielle. Keynotes, tables rondes et sessions de Q&R.',
    tags: ['ia', 'technologie', 'conférence', 'débat', 'futur'],
    startDate: addDays(today, 90).toISOString().replace('T18', 'T09:00'),
    endDate: addDays(today, 90).toISOString().replace('T18', 'T17:00'),
    address: {
      street: 'Palais des Congrès, 2 Pl de la Porte Maillot',
      city: 'Paris',
      zipCode: '75017',
      country: 'France',
    },
    structureId: 1,
    areas: [
      {id: 103, name: 'Amphithéâtre Principal (Intérieur)'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 5001,
        name: 'Amphithéâtre Principal',
        areaId: 103,
        maxCapacity: 1200,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event5/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -45).toISOString(),
  },
  {
    id: 6,
    name: 'Spectacle de Danse Contemporaine "Échos"',
    category: {id: 7, name: 'Danse'},
    shortDescription: 'Une performance envoûtante explorant les résonances du corps et de l\'espace.',
    fullDescription: 'La compagnie XYZ présente sa dernière création, "Échos", une pièce chorégraphique puissante et poétique. Laissez-vous emporter par la fluidité des mouvements et la scénographie innovante.',
    tags: ['danse', 'contemporain', 'spectacle', 'performance', 'toulouse'],
    startDate: addDays(today, 25).toISOString().replace('T18', 'T20:00'),
    endDate: addDays(today, 25).toISOString().replace('T18', 'T21:30'),
    address: {
      street: 'Théâtre de la Cité, 1 Rue Pierre Baudis',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France',
    },
    structureId: 5,
    areas: [
      {id: 501, name: 'Salle Principale du Théâtre'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {id: 6001, name: 'Orchestre', areaId: 501, maxCapacity: 300, isActive: true, seatingType: SeatingType.SEATED},
      {id: 6002, name: 'Balcon', areaId: 501, maxCapacity: 150, isActive: true, seatingType: SeatingType.SEATED},
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event6/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -50).toISOString(),
  },
  {
    id: 7,
    name: 'Cinéma en Plein Air : Classiques d\'Été',
    category: {id: 8, name: 'Cinéma en plein air'},
    shortDescription: 'Revivez vos films préférés sous les étoiles.',
    fullDescription: 'Chaque semaine, un grand classique du cinéma projeté en plein air dans le parc municipal. Apportez vos couvertures et profitez d\'une soirée cinéma conviviale et gratuite.',
    tags: ['cinéma', 'plein air', 'gratuit', 'été', 'famille', 'nice'],
    startDate: addDays(today, 14).toISOString().replace('T18', 'T21:00'),
    endDate: addDays(today, 14).toISOString().replace('T18', 'T23:30'),
    address: {
      street: 'Parc de la Colline du Château',
      city: 'Nice',
      zipCode: '06300',
      country: 'France',
    },
    structureId: 6,
    areas: [
      {id: 601, name: 'Kiosque à Musique et Pelouse'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 7001,
        name: 'Zone de Projection Principale',
        areaId: 601,
        maxCapacity: 1000,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event7/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -20).toISOString(),
  },
  {
    id: 8,
    name: 'Marché des Créateurs Nocturne',
    category: {id: 9, name: 'Marché Artisanal'},
    shortDescription: 'Artisanat local, bijoux, déco et gourmandises en soirée.',
    fullDescription: 'Flânez parmi les stands des artisans locaux et découvrez des pièces uniques. Une ambiance chaleureuse et musicale pour vos emplettes de soirée.',
    tags: ['marché', 'artisanal', 'créateurs', 'nocturne', 'local', 'strasbourg'],
    startDate: addDays(today, 3).toISOString().replace('T18:00', 'T18:00'),
    endDate: addDays(today, 3).toISOString().replace('T18:00', 'T23:00'),
    address: {
      street: 'Place Kléber',
      city: 'Strasbourg',
      zipCode: '67000',
      country: 'France',
    },
    structureId: 7,
    areas: [
      {id: 701, name: 'Place Centrale (Marché)'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {
        id: 8001,
        name: 'Zone du Marché',
        areaId: 701,
        maxCapacity: 2000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event8/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -10).toISOString(),
  },
  {
    id: 9,
    name: 'Atelier d\'Initiation à la Poterie',
    category: {id: 10, name: 'Atelier Créatif'},
    shortDescription: 'Mettez les mains à la terre et créez vos propres objets.',
    fullDescription: 'Un atelier convivial pour découvrir les bases de la poterie : modelage, tournage et décoration. Repartez avec vos créations ! Matériel fourni.',
    tags: ['poterie', 'atelier', 'créatif', 'diy', 'artisanat', 'lille'],
    startDate: addDays(today, 20).toISOString().replace('T18', 'T14:00'),
    endDate: addDays(today, 20).toISOString().replace('T18', 'T17:00'),
    address: {
      street: 'L\'Atelier des Arts, 5 Rue des Tanneurs',
      city: 'Lille',
      zipCode: '59000',
      country: 'France',
    },
    structureId: 8,
    areas: [
      {id: 801, name: 'Salle d\'Atelier Polyvalente'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 9001,
        name: 'Salle Atelier Poterie',
        areaId: 801,
        maxCapacity: 12,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event9/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -40).toISOString(),
  },
  {
    id: 10,
    name: 'Grand Bal Populaire Annulé',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Le traditionnel bal du 14 juillet est annulé cette année.',
    fullDescription: 'En raison des conditions météorologiques défavorables annoncées, nous sommes au regret de vous informer de l\'annulation du Grand Bal Populaire. Nous vous remercions de votre compréhension.',
    tags: ['bal', 'populaire', 'gratuit', 'annulé'],
    startDate: addDays(today, -2).toISOString(),
    endDate: addDays(today, -2).toISOString(),
    address: {
      street: 'Place de la Mairie',
      city: 'Rennes',
      zipCode: '35000',
      country: 'France',
    },
    structureId: 9,
    areas: [
      {id: 901, name: 'Parvis de la Mairie (Bal)'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {id: 10001, name: 'Place du Bal', areaId: 901, maxCapacity: 500, isActive: false, seatingType: SeatingType.MIXED},
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event10/800/400`,
    status: EventStatus.CANCELLED,
    createdAt: addDays(today, -60).toISOString(),
    updatedAt: addDays(today, -1).toISOString(),
  },
  {
    id: 11,
    name: 'Tournoi eSport "Arena Legends" - Terminé',
    category: {id: 5, name: 'Sport'},
    shortDescription: 'La grande finale du tournoi Arena Legends a eu lieu le mois dernier.',
    fullDescription: 'Félicitations aux champions de l\'édition 2025 du tournoi Arena Legends ! Revivez les meilleurs moments et consultez les résultats sur notre site web.',
    tags: ['esport', 'gaming', 'tournoi', 'compétition', 'terminé'],
    startDate: addDays(today, -40).toISOString(),
    endDate: addDays(today, -38).toISOString(),
    address: {
      street: 'Gaming Center XYZ',
      city: 'Paris',
      zipCode: '75015',
      country: 'France',
    },
    structureId: 1,
    areas: [
      {id: 104, name: 'Arène eSport Alpha'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 11001,
        name: 'Arène eSport Principale',
        areaId: 104,
        maxCapacity: 500,
        isActive: false,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event11/800/400`,
    status: EventStatus.COMPLETED,
    createdAt: addDays(today, -100).toISOString(),
    updatedAt: addDays(today, -37).toISOString(),
  },
  {
    id: 12,
    name: 'Salon du Livre Ancien et Moderne',
    category: {id: 4, name: 'Exposition'},
    shortDescription: 'Des trésors de la littérature et des éditions rares à découvrir.',
    fullDescription: 'Amateurs de beaux livres et collectionneurs, ce salon est pour vous. Rencontrez des libraires passionnés, découvrez des manuscrits uniques et enrichissez votre bibliothèque.',
    tags: ['livres', 'salon', 'littérature', 'collection', 'rare', 'paris'],
    startDate: addDays(today, 50).toISOString(),
    endDate: addDays(today, 53).toISOString(),
    address: {
      street: 'Grand Palais Éphémère, Place Joffre',
      city: 'Paris',
      zipCode: '75007',
      country: 'France',
    },
    structureId: 1,
    areas: [
      {id: 105, name: 'Hall d\'Exposition A'},
      {id: 106, name: 'Salle de Conférences "Victor Hugo"'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 12001,
        name: 'Espace Exposants A',
        areaId: 105,
        maxCapacity: 1000,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
      {
        id: 12002,
        name: 'Salle de Conférences',
        areaId: 106,
        maxCapacity: 200,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event12/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -70).toISOString(),
  },
  {
    id: 13,
    name: 'Course Cycliste "Le Tour des Collines"',
    category: {id: 5, name: 'Sport'},
    shortDescription: 'Épreuve reine pour les grimpeurs et les passionnés de cyclisme.',
    fullDescription: 'Suivez les coureurs sur un parcours exigeant à travers des paysages magnifiques. Animations et village départ/arrivée pour toute la famille.',
    tags: ['cyclisme', 'course', 'sport', 'montagne', 'compétition', 'alpes'],
    startDate: addDays(today, 75).toISOString().replace('T18', 'T10:00'),
    endDate: addDays(today, 75).toISOString().replace('T18', 'T17:00'),
    address: {
      street: 'Place du Village',
      city: 'Annecy',
      zipCode: '74000',
      country: 'France',
    },
    structureId: 10,
    areas: [
      {id: 1001, name: 'Zone Arrivée Course Cycliste'},
      {id: 1002, name: 'Point de Vue Montagne (Course)'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {
        id: 13001,
        name: 'Zone Arrivée',
        areaId: 1001,
        maxCapacity: 5000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 13002,
        name: 'Col de la Forclaz (Point de vue)',
        areaId: 1002,
        maxCapacity: 1000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event13/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -90).toISOString(),
  },
  {
    id: 14,
    name: 'Théâtre Immersif "Le Secret du Manoir"',
    category: {id: 3, name: 'Théâtre'},
    shortDescription: 'Plongez au cœur d\'une énigme policière où vous êtes le détective.',
    fullDescription: 'Une expérience théâtrale unique où le public déambule dans un manoir et interagit avec les personnages pour résoudre un mystère. Chaque représentation est différente !',
    tags: ['théâtre', 'immersif', 'enquête', 'mystère', 'interactif', 'nantes'],
    startDate: addDays(today, 60).toISOString().replace('T18', 'T19:30'),
    endDate: addDays(today, 90).toISOString().replace('T18', 'T22:00'),
    address: {
      street: 'Château de Goulaine',
      city: 'Haute-Goulaine',
      zipCode: '44115',
      country: 'France',
    },
    structureId: 2,
    areas: [
      {id: 202, name: 'Espace Château (pour théâtre immersif)'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 14001,
        name: 'Parcours Immersif Global',
        areaId: 202,
        maxCapacity: 50,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event14/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -50).toISOString(),
  },
  {
    id: 15,
    name: 'Brouillon : Fête de la Musique Quartier X',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Préparation de la fête de la musique.',
    fullDescription: 'Organisation en cours pour la Fête de la Musique du quartier. Recherche de groupes, définition des scènes. Plus d\'informations à venir.',
    tags: ['musique', 'fête', 'local', 'brouillon'],
    startDate: addDays(today, 120).toISOString(),
    endDate: addDays(today, 120).toISOString(),
    address: {
      street: 'Rue Principale',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France',
    },
    structureId: 7,
    areas: [
      {id: 701, name: 'Place Centrale (Marché)'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event15/800/400`,
    status: EventStatus.DRAFT,
    createdAt: addDays(today, -5).toISOString(),
  },
  {
    id: 16,
    name: 'Atelier de Cuisine : Pâtisseries Françaises',
    category: {id: 10, name: 'Atelier Créatif'},
    shortDescription: 'Apprenez à réaliser macarons, éclairs et autres délices.',
    fullDescription: 'Guidé par un chef pâtissier, cet atelier pratique vous enseignera les techniques pour réussir les classiques de la pâtisserie française. Dégustation à la fin !',
    tags: ['cuisine', 'pâtisserie', 'atelier', 'gourmand', 'français', 'bordeaux'],
    startDate: addDays(today, 28).toISOString().replace('T18', 'T10:00'),
    endDate: addDays(today, 28).toISOString().replace('T18', 'T13:00'),
    address: {
      street: 'L\'École des Gourmets, 15 Quai des Chartrons',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France',
    },
    structureId: 8,
    areas: [
      {id: 801, name: 'Salle d\'Atelier Polyvalente'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 16001,
        name: 'Cuisine Atelier Principal',
        areaId: 801,
        maxCapacity: 10,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event16/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -35).toISOString(),
  },
  {
    id: 17,
    name: 'Festival de Jazz de Marciac - Soirée d\'Ouverture',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Lancement du célèbre festival de jazz avec des artistes de renommée.',
    fullDescription: 'Le festival Jazz in Marciac ouvre ses portes pour plusieurs semaines de concerts exceptionnels. La soirée d\'ouverture promet une ambiance festive et des performances inoubliables sous le chapiteau.',
    tags: ['jazz', 'festival', 'musique', 'live', 'marciac', 'gers'],
    startDate: addDays(today, 100).toISOString().replace('T18', 'T21:00'),
    endDate: addDays(today, 100).toISOString().replace('T18', 'T23:59'),
    address: {
      street: 'Chapiteau Principal, Place de l\'Hôtel de Ville',
      city: 'Marciac',
      zipCode: '32230',
      country: 'France',
    },
    structureId: 10,
    areas: [
      {id: 1003, name: 'Chapiteau Festival Jazz Marciac'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 17001,
        name: 'Carré Or (Chapiteau)',
        areaId: 1003,
        maxCapacity: 500,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 17002,
        name: 'Places Assises (Chapiteau)',
        areaId: 1003,
        maxCapacity: 2500,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event17/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -150).toISOString(),
  },
  {
    id: 18,
    name: 'Projection "Blade Runner" - Version Final Cut (Plein Air)',
    category: {id: 8, name: 'Cinéma en plein air'},
    shortDescription: 'Un classique de la science-fiction à (re)voir sur écran géant.',
    fullDescription: 'Profitez d\'une soirée estivale pour découvrir ou redécouvrir Blade Runner dans sa version "Final Cut", projeté en haute définition dans un cadre unique.',
    tags: ['cinéma', 'sf', 'plein air', 'culte', 'rétrospective', 'lille'],
    startDate: addDays(today, 22).toISOString().replace('T18', 'T21:30'),
    endDate: addDays(today, 22).toISOString().replace('T18', 'T23:45'),
    address: {
      street: 'Parc de la Citadelle',
      city: 'Lille',
      zipCode: '59000',
      country: 'France',
    },
    structureId: 6,
    areas: [
      {id: 602, name: 'Clairière des Projections'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 18001,
        name: 'Pelouse Centrale Projection',
        areaId: 602,
        maxCapacity: 800,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event18/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -25).toISOString(),
  },
  {
    id: 19,
    name: 'Conférence TEDx "Idées en Mouvement"',
    category: {id: 6, name: 'Conférence'},
    shortDescription: 'Des intervenants inspirants partagent leurs idées pour changer le monde.',
    fullDescription: 'Une journée de conférences courtes et percutantes dans l\'esprit TED. Venez écouter des innovateurs, des artistes et des penseurs qui façonnent l\'avenir.',
    tags: ['tedx', 'conférence', 'inspiration', 'innovation', 'idées', 'strasbourg'],
    startDate: addDays(today, 80).toISOString().replace('T18', 'T09:30'),
    endDate: addDays(today, 80).toISOString().replace('T18', 'T18:00'),
    address: {
      street: 'Palais de la Musique et des Congrès',
      city: 'Strasbourg',
      zipCode: '67000',
      country: 'France',
    },
    structureId: 3,
    areas: [
      {id: 302, name: 'Auditorium (Conférences)'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 19001,
        name: 'Salle de Conférence Principale',
        areaId: 302,
        maxCapacity: 700,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    links: ['https://www.ted.com/tedx'],
    mainPhotoUrl: `https://picsum.photos/seed/event19/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -60).toISOString(),
  },
  {
    id: 20,
    name: 'Compétition de Danse Hip-Hop "Urban Beats"',
    category: {id: 7, name: 'Danse'},
    shortDescription: 'Les meilleurs crews s\'affrontent dans des battles endiablées.',
    fullDescription: 'Assistez à des performances de breakdance, popping, locking et autres styles de danse urbaine. Un jury de professionnels désignera les vainqueurs.',
    tags: ['danse', 'hiphop', 'battle', 'compétition', 'urbain', 'lyon'],
    startDate: addDays(today, 33).toISOString().replace('T18', 'T14:00'),
    endDate: addDays(today, 33).toISOString().replace('T18', 'T20:00'),
    address: {
      street: 'Halle Tony Garnier',
      city: 'Lyon',
      zipCode: '69007',
      country: 'France',
    },
    structureId: 2,
    areas: [
      {id: 203, name: 'Salle Polyvalente "Le Studio"'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 20001,
        name: 'Fosse (Debout)',
        areaId: 203,
        maxCapacity: 1000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 20002,
        name: 'Gradins (Assis)',
        areaId: 203,
        maxCapacity: 1500,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event20/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -42).toISOString(),
  },
  {
    id: 21,
    name: 'Marché de Noël Traditionnel (Édition 2024)',
    category: {id: 9, name: 'Marché Artisanal'},
    shortDescription: 'L\'édition passée du marché de Noël et ses merveilles.',
    fullDescription: 'Revivez la magie du marché de Noël de l\'année dernière avec ses chalets en bois, ses produits artisanaux, son vin chaud et ses animations pour enfants. Merci à tous les visiteurs et exposants !',
    tags: ['marché', 'noël', 'artisanal', 'tradition', 'passé', 'colmar'],
    startDate: addDays(today, -150).toISOString(),
    endDate: addDays(today, -140).toISOString(),
    address: {
      street: 'Place de la Cathédrale',
      city: 'Colmar',
      zipCode: '68000',
      country: 'France',
    },
    structureId: 7,
    areas: [
      {id: 702, name: 'Village de Noël (Place Cathédrale)'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {
        id: 21001,
        name: 'Zone du Marché de Noël',
        areaId: 702,
        maxCapacity: 3000,
        isActive: false,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event21/800/400`,
    status: EventStatus.COMPLETED,
    createdAt: addDays(today, -200).toISOString(),
    updatedAt: addDays(today, -139).toISOString(),
  },
  {
    id: 22,
    name: 'Futur Festival Electro "Synthetica 2026"',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Planification initiale pour un nouveau festival électro.',
    fullDescription: 'Idées et concepts en cours d\'élaboration pour Synthetica 2026. Thème, lieu et artistes à définir. Suivez-nous pour les annonces !',
    tags: ['électro', 'festival', 'futur', 'planification', 'brouillon'],
    startDate: addDays(today, 700).toISOString(),
    endDate: addDays(today, 702).toISOString(),
    address: {
      street: 'À déterminer',
      city: 'À déterminer',
      zipCode: '',
      country: 'France',
    },
    structureId: 11,
    areas: [
      {id: 1101, name: 'Zone en Développement'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event22_draft/800/400`,
    status: EventStatus.DRAFT,
    createdAt: addDays(today, -1).toISOString(),
  },
  {
    id: 23,
    name: 'Concert Acoustique Intimiste - Artiste Émergent',
    category: {id: 1, name: 'Concert'},
    shortDescription: 'Proposition de concert acoustique dans un petit lieu.',
    fullDescription: 'Un set acoustique par un nouvel artiste talentueux. Ambiance chaleureuse et proximité avec le musicien. En attente de validation pour la programmation.',
    tags: ['acoustique', 'concert', 'découverte', 'intimiste', 'musique', 'reims'],
    startDate: addDays(today, 40).toISOString().replace('T18', 'T20:00'),
    endDate: addDays(today, 40).toISOString().replace('T18', 'T22:00'),
    address: {
      street: 'Le Petit Café, 12 Rue de Vesle',
      city: 'Reims',
      zipCode: '51100',
      country: 'France',
    },
    structureId: 12,
    areas: [
      {id: 1201, name: 'Petite Salle Concert Café'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 23001,
        name: 'Salle du Café',
        areaId: 1201,
        maxCapacity: 40,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event23_pending/800/400`,
    status: EventStatus.PENDING_APPROVAL,
    createdAt: addDays(today, -3).toISOString(),
  },
  {
    id: 24,
    name: 'Tournoi Estival de Beach Volley',
    category: {id: 5, name: 'Sport'},
    shortDescription: 'Sable, soleil et smashs ! Inscrivez votre équipe.',
    fullDescription: 'Le tournoi de beach volley revient sur la plage principale. Catégories amateurs et confirmés. Nombreux lots à gagner et ambiance conviviale assurée.',
    tags: ['beach volley', 'sport', 'été', 'plage', 'tournoi', 'la rochelle'],
    startDate: addDays(today, 65).toISOString().replace('T18', 'T09:00'),
    endDate: addDays(today, 66).toISOString().replace('T18', 'T18:00'),
    address: {
      street: 'Plage des Minimes',
      city: 'La Rochelle',
      zipCode: '17000',
      country: 'France',
    },
    structureId: 13,
    areas: [
      {id: 1301, name: 'Terrain Beach Volley Central'},
      {id: 1302, name: 'Terrains Beach Volley Annexes'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {
        id: 24001,
        name: 'Terrain Central',
        areaId: 1301,
        maxCapacity: 200,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 24002,
        name: 'Terrains Annexes',
        areaId: 1302,
        maxCapacity: 500,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event24/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -20).toISOString(),
  },
  {
    id: 25,
    name: 'Regards Croisés : Photographies du Monde',
    category: {id: 4, name: 'Exposition'},
    shortDescription: 'Une sélection de clichés saisissants par des photographes voyageurs.',
    fullDescription: 'Explorez le monde à travers l\'objectif de talentueux photographes. Des paysages époustouflants aux portraits émouvants, une invitation au voyage et à la découverte.',
    tags: ['photographie', 'exposition', 'voyage', 'art', 'culture', 'rennes'],
    startDate: addDays(today, 10).toISOString(),
    endDate: addDays(today, 70).toISOString(),
    address: {
      street: 'Galerie Le Rayon Vert, 22 Rue Hoche',
      city: 'Rennes',
      zipCode: '35000',
      country: 'France',
    },
    structureId: 3,
    areas: [
      {id: 303, name: 'Galerie "Le Rayon Vert"'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 25001,
        name: 'Salle d\'Exposition Principale',
        areaId: 303,
        maxCapacity: 100,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event25/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -15).toISOString(),
  },
  {
    id: 26,
    name: 'Festival des Arts de la Rue "Les Saltimbanques"',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Clowns, acrobates, et comédiens envahissent les places de la ville.',
    fullDescription: 'Un week-end festif dédié aux arts de la rue. Spectacles gratuits pour petits et grands, déambulations, fanfares et bonne humeur garantie !',
    tags: ['théâtre de rue', 'festival', 'gratuit', 'arts', 'famille', 'avignon'],
    startDate: addDays(today, 55).toISOString(),
    endDate: addDays(today, 56).toISOString(),
    address: {
      street: 'Centre Ville Historique',
      city: 'Avignon',
      zipCode: '84000',
      country: 'France',
    },
    structureId: 7,
    areas: [
      {id: 703, name: 'Scène Place de l\'Horloge'},
      {id: 704, name: 'Déambulation Rue des Teinturiers'}
    ],
    isFreeEvent: true,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 26001,
        name: 'Place de l\'Horloge',
        areaId: 703,
        maxCapacity: 1000,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
      {
        id: 26002,
        name: 'Rue des Teinturiers',
        areaId: 704,
        maxCapacity: 500,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event26/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -80).toISOString(),
  },
  {
    id: 27,
    name: 'Atelier d\'Écriture Créative : Nouvelle & Poésie',
    category: {id: 10, name: 'Atelier Créatif'},
    shortDescription: 'Libérez votre plume et explorez différents styles littéraires.',
    fullDescription: 'Un atelier pour stimuler votre créativité, partager vos textes et recevoir des conseils personnalisés. Ouvert à tous les niveaux, des débutants aux auteurs confirmés.',
    tags: ['écriture', 'atelier', 'créatif', 'littérature', 'nouvelle', 'poésie', 'paris'],
    startDate: addDays(today, 38).toISOString().replace('T18', 'T18:30'),
    endDate: addDays(today, 38).toISOString().replace('T18', 'T20:30'),
    address: {
      street: 'Librairie "Les Mots Voyageurs", 7 Rue des Écoles',
      city: 'Paris',
      zipCode: '75005',
      country: 'France',
    },
    structureId: 14,
    areas: [
      {id: 1401, name: 'Salle Arrière (Ateliers)'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 27001,
        name: 'Salle Atelier Écriture',
        areaId: 1401,
        maxCapacity: 15,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event27/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -28).toISOString(),
  },
  {
    id: 28,
    name: 'Release Party - Nouvel Album "Les Échos Urbains"',
    category: {id: 1, name: 'Concert'},
    shortDescription: 'Le groupe local "Les Échos Urbains" fête la sortie de son nouvel opus !',
    fullDescription: 'Venez découvrir en live les nouveaux morceaux du groupe montant de la scène locale. Une soirée rock énergique et festive en perspective.',
    tags: ['concert', 'rock', 'pop', 'release party', 'local', 'toulouse'],
    startDate: addDays(today, 12).toISOString().replace('T18', 'T21:00'),
    endDate: addDays(today, 12).toISOString().replace('T18', 'T23:30'),
    address: {
      street: 'Le Bikini, Parc Technologique du Canal',
      city: 'Ramonville-Saint-Agne',
      zipCode: '31520',
      country: 'France',
    },
    structureId: 5,
    areas: [
      {id: 502, name: 'Salle de Concert "Le Bikini"'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {id: 28001, name: 'Fosse', areaId: 502, maxCapacity: 800, isActive: true, seatingType: SeatingType.STANDING},
      {
        id: 28002,
        name: 'Mezzanine (places limitées)',
        areaId: 502,
        maxCapacity: 100,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event28/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -18).toISOString(),
  },
  {
    id: 29,
    name: 'Festival International de la Bande Dessinée',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Le rendez-vous incontournable des passionnés du 9ème art.',
    fullDescription: 'Rencontrez vos auteurs préférés, assistez à des dédicaces, découvrez des expositions exclusives et participez à des ateliers de dessin. Un événement majeur pour tous les fans de BD.',
    tags: ['bd', 'bande dessinée', 'festival', 'dédicace', 'exposition', 'angoulême'],
    startDate: addDays(today, 200).toISOString(),
    endDate: addDays(today, 203).toISOString(),
    address: {
      street: 'Divers lieux en ville',
      city: 'Angoulême',
      zipCode: '16000',
      country: 'France',
    },
    structureId: 15,
    areas: [
      {id: 1501, name: 'Grand Hall "Espace Bulles"'},
      {id: 1502, name: 'Auditorium Rencontres & Dédicaces'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 29001,
        name: 'Espace Bulles (Exposants)',
        areaId: 1501,
        maxCapacity: 5000,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
      {
        id: 29002,
        name: 'Auditorium Dédicaces',
        areaId: 1502,
        maxCapacity: 300,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event29/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -30).toISOString(),
  },

// --- Événement 29 (Festival de BD) ---
  {
    id: 29,
    name: 'Festival International de la Bande Dessinée',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Le rendez-vous incontournable des passionnés du 9ème art.',
    fullDescription: 'Rencontrez vos auteurs préférés, assistez à des dédicaces, découvrez des expositions exclusives et participez à des ateliers de dessin. Un événement majeur pour tous les fans de BD.',
    tags: ['bd', 'bande dessinée', 'festival', 'dédicace', 'exposition', 'angoulême'],
    startDate: addDays(today, 200).toISOString(), // L'année prochaine
    endDate: addDays(today, 203).toISOString(),
    address: {
      street: 'Divers lieux en ville', // Le festival se déroule dans plusieurs lieux
      city: 'Angoulême',
      zipCode: '16000',
      country: 'France',
    },
    structureId: 15, // ID pour un "Espace Festivalier Multi-sites"
    isFreeEvent: false, // Pass festival
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 29001,
        name: 'Espace Bulles (Exposants)',
        areaId: 1501,
        maxCapacity: 5000,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
      {
        id: 29002,
        name: 'Auditorium Dédicaces',
        areaId: 1502,
        maxCapacity: 300,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event29/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -30).toISOString(),
  },
// --- Événement 29 (déjà fourni) ---
// ... (voir plus haut)

// --- Événement 30 ---
  {
    id: 30,
    name: 'Le Grand Cabaret Magique',
    category: {id: 3, name: 'Théâtre'},
    shortDescription: 'Illusions, mentalisme et grandes évasions pour une soirée époustouflante.',
    fullDescription: 'Laissez-vous émerveiller par les plus grands magiciens internationaux réunis sur scène pour un spectacle familial plein de surprises et de mystère.',
    tags: ['magie', 'spectacle', 'illusion', 'mentalisme', 'cabaret', 'paris'],
    startDate: addDays(today, 85).toISOString().replace('T18', 'T20:30'),
    endDate: addDays(today, 85).toISOString().replace('T18', 'T22:30'),
    address: {
      street: 'Folies Bergère, 32 Rue Richer',
      city: 'Paris',
      zipCode: '75009',
      country: 'France',
    },
    structureId: 1,
    areas: [
      {id: 107, name: 'Salle de Spectacle "Molière"'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {id: 30001, name: 'Orchestre', areaId: 107, maxCapacity: 600, isActive: true, seatingType: SeatingType.SEATED},
      {id: 30002, name: 'Corbeille', areaId: 107, maxCapacity: 400, isActive: true, seatingType: SeatingType.SEATED},
      {id: 30003, name: 'Balcon', areaId: 107, maxCapacity: 300, isActive: true, seatingType: SeatingType.SEATED},
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event30/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -75).toISOString(),
  },

// --- Événement 31 ---
  {
    id: 31,
    name: 'Randonnée Découverte : Les Calanques Secrètes',
    category: {id: 5, name: 'Sport'},
    shortDescription: 'Explorez les sentiers cachés et les criques isolées des Calanques.',
    fullDescription: 'Une randonnée accompagnée par un guide local pour découvrir la faune, la flore et les panoramas exceptionnels du Parc National des Calanques, loin des sentiers battus.',
    tags: ['randonnée', 'nature', 'calanques', 'découverte', 'sport', 'marseille'],
    startDate: addDays(today, 18).toISOString().replace('T18', 'T09:00'),
    endDate: addDays(today, 18).toISOString().replace('T18', 'T16:00'),
    address: {
      street: 'Parking de la Gardiole, Route de la Gineste',
      city: 'Marseille',
      zipCode: '13009',
      country: 'France',
    },
    structureId: 16,
    areas: [
      {id: 1601, name: 'Sentier Principal Randonnée Guidée'}
    ],
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {
        id: 31001,
        name: 'Groupe de Randonnée (Max 15 pers.)',
        areaId: 1601,
        maxCapacity: 15,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event31/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -22).toISOString(),
  },
// --- Événement 32 (Marché aux Puces) ---
  {
    id: 32,
    name: 'Grand Déballage : Marché aux Puces de Printemps',
    category: {id: 9, name: 'Marché Artisanal'}, // Ou "Brocante"
    shortDescription: 'Chinez meubles anciens, objets vintage et trésors cachés.',
    fullDescription: 'Le traditionnel marché aux puces de printemps revient avec des centaines d\'exposants. L\'occasion de trouver des pièces uniques et de faire de bonnes affaires.',
    tags: ['marché aux puces', 'brocante', 'vintage', 'antiquités', 'chine', 'lille'],
    startDate: addDays(today, 42).toISOString().replace('T18', 'T08:00'),
    endDate: addDays(today, 43).toISOString().replace('T18', 'T18:00'), // Sur un week-end
    address: {
      street: 'Champ de Mars',
      city: 'Lille',
      zipCode: '59000',
      country: 'France',
    },
    structureId: 7, // Grand espace public
    isFreeEvent: true, // Entrée libre pour les visiteurs
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {
        id: 32001,
        name: 'Zone Exposants A',
        areaId: 705,
        maxCapacity: 2000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 32002,
        name: 'Zone Exposants B',
        areaId: 706,
        maxCapacity: 2000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event32/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -65).toISOString(),
  },
// --- Événement 33 (Concert Jazz Manouche) ---
  {
    id: 33,
    name: 'Soirée Jazz Manouche avec "Les Cordes Vibrantes"',
    category: {id: 1, name: 'Concert'},
    shortDescription: 'Swing et virtuosité pour une ambiance chaleureuse et entraînante.',
    fullDescription: 'Le trio "Les Cordes Vibrantes" vous transporte dans l\'univers du jazz manouche, revisitant les standards de Django Reinhardt et proposant leurs compositions originales.',
    tags: ['jazz', 'manouche', 'swing', 'concert', 'guitare', 'paris'],
    startDate: addDays(today, 58).toISOString().replace('T18', 'T21:30'),
    endDate: addDays(today, 58).toISOString().replace('T18', 'T23:30'),
    address: {
      street: 'Le Caveau de la Huchette, 5 Rue de la Huchette',
      city: 'Paris',
      zipCode: '75005',
      country: 'France',
    },
    structureId: 12, // Un club de jazz
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 33001,
        name: 'Salle Club (Tables et Chaises)',
        areaId: 1202,
        maxCapacity: 80,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event33/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -48).toISOString(),
  },
// --- Événement 34 (Salon du Bien-Être) ---
  {
    id: 34,
    name: 'Salon "Zen & Nature" - Bien-Être et Thérapies Douces',
    category: {id: 4, name: 'Exposition'}, // Ou "Salon"
    shortDescription: 'Découvrez les dernières tendances en matière de bien-être et de développement personnel.',
    fullDescription: 'Un espace de rencontre avec des professionnels du bien-être : thérapeutes, coachs, produits bio et naturels, ateliers de yoga et méditation. Prenez soin de vous !',
    tags: ['bien-être', 'salon', 'nature', 'thérapies douces', 'yoga', 'méditation', 'lyon'],
    startDate: addDays(today, 95).toISOString(),
    endDate: addDays(today, 96).toISOString(),
    address: {
      street: 'Eurexpo Lyon, Boulevard de l\'Europe',
      city: 'Chassieu', // Près de Lyon
      zipCode: '69680',
      country: 'France',
    },
    structureId: 3, // Centre d'exposition
    isFreeEvent: false, // Entrée au salon
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 34001,
        name: 'Hall Exposants Bien-Être',
        areaId: 304,
        maxCapacity: 3000,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
      {
        id: 34002,
        name: 'Salle Ateliers Yoga',
        areaId: 305,
        maxCapacity: 50,
        isActive: true,
        seatingType: SeatingType.STANDING
      }, // Pour le yoga
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event34/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -100).toISOString(),
  },
// --- Événement 35 (Tournoi de Jeux de Société) ---
  {
    id: 35,
    name: 'Tournoi Intergalactique de Jeux de Société',
    category: {id: 5, name: 'Sport'}, // Ou une catégorie "Jeux"
    shortDescription: 'Affrontez d\'autres joueurs sur vos jeux de plateau préférés !',
    fullDescription: 'Un week-end entier dédié aux jeux de société : tournois, démonstrations, prototypes à tester et rencontres avec des auteurs de jeux. Ambiance conviviale garantie.',
    tags: ['jeux de société', 'tournoi', 'jeux', 'stratégie', 'convivial', 'toulouse'],
    startDate: addDays(today, 70).toISOString(),
    endDate: addDays(today, 71).toISOString(),
    address: {
      street: 'Ludothèque Le Pion Malin, 33 Rue des Filatiers',
      city: 'Toulouse',
      zipCode: '31000',
      country: 'France',
    },
    structureId: 17, // ID d'une ludothèque ou espace de jeux
    isFreeEvent: false, // Inscription au tournoi
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 35001,
        name: 'Salle de Tournoi Principal',
        areaId: 1701,
        maxCapacity: 100,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 35002,
        name: 'Espace Jeux Libres',
        areaId: 1702,
        maxCapacity: 50,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event35/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -55).toISOString(),
  },
// --- Événement 36 (Spectacle de Cirque Moderne) ---
  {
    id: 36,
    name: 'Nouveau Cirque "Étoiles Filantes"',
    category: {id: 7, name: 'Danse'}, // Ou "Spectacle", "Cirque"
    shortDescription: 'Acrobaties aériennes, jonglerie poétique et clowns nouvelle génération.',
    fullDescription: 'Le cirque se réinvente avec "Étoiles Filantes", un spectacle qui mêle tradition et modernité pour émerveiller petits et grands. Une production époustouflante sous chapiteau.',
    tags: ['cirque', 'spectacle', 'acrobatie', 'jonglerie', 'famille', 'bordeaux'],
    startDate: addDays(today, 25).toISOString().replace('T18', 'T16:00'), // Plusieurs représentations sur une période
    endDate: addDays(today, 40).toISOString().replace('T18', 'T18:00'),
    address: {
      street: 'Chapiteau - Quai des Queyries',
      city: 'Bordeaux',
      zipCode: '33100',
      country: 'France',
    },
    structureId: 18, // ID pour un "Chapiteau de Cirque" (structure temporaire ou dédiée)
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 36001,
        name: 'Gradins A (Face)',
        areaId: 1801,
        maxCapacity: 400,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 36002,
        name: 'Gradins B (Côté)',
        areaId: 1801,
        maxCapacity: 300,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event36/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -30).toISOString(),
  },
// --- Événement 37 (Festival du Film Court) ---
  {
    id: 37,
    name: 'Festival du Court Métrage "Instantanés"',
    category: {id: 8, name: 'Cinéma en plein air'}, // Ou "Festival Cinéma"
    shortDescription: 'Découvrez la créativité et la diversité du format court.',
    fullDescription: 'Projections de courts métrages du monde entier, rencontres avec les réalisateurs, et compétitions. Un panorama du cinéma de demain.',
    tags: ['cinéma', 'court métrage', 'festival', 'projection', 'création', 'clermont-ferrand'],
    startDate: addDays(today, 150).toISOString(),
    endDate: addDays(today, 155).toISOString(),
    address: {
      street: 'La Comédie de Clermont, Scène Nationale',
      city: 'Clermont-Ferrand',
      zipCode: '63000',
      country: 'France',
    },
    structureId: 5, // Un théâtre ou cinéma
    isFreeEvent: false, // Pass festival ou billets par séance
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 37001,
        name: 'Salle de Projection 1',
        areaId: 503,
        maxCapacity: 300,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 37002,
        name: 'Salle de Projection 2',
        areaId: 504,
        maxCapacity: 150,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event37/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -60).toISOString(),
  },
// --- Événement 38 (Atelier DIY Cosmétiques Naturels) ---
  {
    id: 38,
    name: 'Atelier DIY : Créez Vos Cosmétiques Naturels',
    category: {id: 10, name: 'Atelier Créatif'},
    shortDescription: 'Apprenez à fabriquer baumes, crèmes et savons avec des ingrédients bio.',
    fullDescription: 'Un atelier ludique et pratique pour découvrir les bases de la cosmétique maison. Repartez avec vos produits personnalisés et des recettes simples à refaire chez vous.',
    tags: ['diy', 'cosmétiques', 'naturel', 'bio', 'atelier', 'santé', 'nice'],
    startDate: addDays(today, 48).toISOString().replace('T18', 'T14:30'),
    endDate: addDays(today, 48).toISOString().replace('T18', 'T17:00'),
    address: {
      street: 'Boutique "Essence Nature", 10 Rue Masséna',
      city: 'Nice',
      zipCode: '06000',
      country: 'France',
    },
    structureId: 8, // Un atelier ou une boutique spécialisée
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 38001,
        name: 'Espace Atelier Cosmétique',
        areaId: 802,
        maxCapacity: 10,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event38/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -32).toISOString(),
  },
// --- Événement 39 (Salon du Manga et de la Culture Japonaise) ---
  {
    id: 39,
    name: 'Japan Expo Sud - Édition Printemps',
    category: {id: 2, name: 'Festival'}, // Ou Salon
    shortDescription: 'Le meilleur de la culture japonaise : manga, anime, cosplay, jeux vidéo.',
    fullDescription: 'Plongez dans l\'univers de la culture japonaise avec des invités prestigieux, des stands d\'exposants, des concours de cosplay, des tournois de jeux vidéo et des démonstrations d\'arts martiaux.',
    tags: ['japan expo', 'manga', 'anime', 'cosplay', 'japon', 'jeux vidéo', 'marseille'],
    startDate: addDays(today, 110).toISOString(),
    endDate: addDays(today, 112).toISOString(),
    address: {
      street: 'Parc Chanot - Palais des Congrès et des Expositions',
      city: 'Marseille',
      zipCode: '13008',
      country: 'France',
    },
    structureId: 3, // Un grand centre d'exposition
    isFreeEvent: false, // Billet d'entrée
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 39001,
        name: 'Hall Principal (Exposants & Scènes)',
        areaId: 306,
        maxCapacity: 10000,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
      {
        id: 39002,
        name: 'Salle de Projection Anime',
        areaId: 307,
        maxCapacity: 400,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event39/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -90).toISOString(),
  },
// --- Événement 40 (Concert Rock en Plein Air - Annulé Récemment) ---
  {
    id: 40,
    name: 'Rock en Parc - Édition Estivale (ANNULÉ)',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Concert rock en plein air annulé en raison de problèmes techniques.',
    fullDescription: 'Nous sommes au regret d\'annoncer l\'annulation du concert "Rock en Parc" prévu ce week-end en raison de problèmes techniques imprévus avec la scène. Les détenteurs de billets seront remboursés.',
    tags: ['rock', 'concert', 'plein air', 'annulé', 'parc'],
    startDate: addDays(today, 2).toISOString(), // Était prévu pour ce week-end
    endDate: addDays(today, 2).toISOString(),
    address: {
      street: 'Parc de la Tête d\'Or',
      city: 'Lyon',
      zipCode: '69006',
      country: 'France',
    },
    structureId: 6, // Parc
    isFreeEvent: false, // Était payant
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {
        id: 40001,
        name: 'Zone Scène Principale',
        areaId: 603,
        maxCapacity: 8000,
        isActive: false,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: false, // Ne plus afficher
    isFeaturedEvent: false, // Ne plus mettre en avant
    mainPhotoUrl: `https://picsum.photos/seed/event40_cancelled/800/400`,
    status: EventStatus.CANCELLED,
    createdAt: addDays(today, -50).toISOString(),
    updatedAt: addDays(today, -1).toISOString(), // Mis à jour pour l'annulation
  },
// --- Événement 41 (Théâtre Classique - Comédie) ---
  {
    id: 41,
    name: 'Molière : Le Bourgeois Gentilhomme',
    category: {id: 3, name: 'Théâtre'},
    shortDescription: 'Un grand classique de la comédie française par la troupe XYZ.',
    fullDescription: 'Redécouvrez l\'œuvre intemporelle de Molière dans une mise en scène enlevée et fidèle à l\'esprit de l\'auteur. Une soirée de rires et de finesse garantie.',
    tags: ['théâtre', 'classique', 'molière', 'comédie', 'culture', 'paris'],
    startDate: addDays(today, 68).toISOString().replace('T18', 'T20:00'),
    endDate: addDays(today, 68).toISOString().replace('T18', 'T22:30'),
    address: {
      street: 'Théâtre du Ranelagh, 5 Rue des Vignes',
      city: 'Paris',
      zipCode: '75016',
      country: 'France',
    },
    structureId: 1, // Un théâtre parisien
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {id: 41001, name: 'Orchestre', areaId: 108, maxCapacity: 200, isActive: true, seatingType: SeatingType.SEATED},
      {id: 41002, name: 'Balcon', areaId: 108, maxCapacity: 100, isActive: true, seatingType: SeatingType.SEATED},
    ],
    displayOnHomepage: true,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event41/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -60).toISOString(),
  },
// --- Événement 42 (Conférence Scientifique - Astronomie) ---
  {
    id: 42,
    name: 'Nuit des Étoiles : Conférence et Observation',
    category: {id: 6, name: 'Conférence'},
    shortDescription: 'Explorez les mystères de l\'univers avec des astronomes passionnés.',
    fullDescription: 'Une soirée dédiée à l\'astronomie avec une conférence sur les dernières découvertes spatiales, suivie d\'une séance d\'observation au télescope (si la météo le permet).',
    tags: ['astronomie', 'science', 'conférence', 'observation', 'étoiles', 'espace', 'toulouse'],
    startDate: addDays(today, 130).toISOString().replace('T18', 'T20:00'),
    endDate: addDays(today, 130).toISOString().replace('T18', 'T23:59'),
    address: {
      street: 'Cité de l\'Espace, Avenue Jean Gonord',
      city: 'Toulouse',
      zipCode: '31500',
      country: 'France',
    },
    structureId: 5, // Supposons que la Cité de l'Espace soit une structure
    isFreeEvent: true,
    defaultSeatingType: SeatingType.SEATED, // Pour la conférence
    audienceZones: [
      {
        id: 42001,
        name: 'Planétarium (Conférence)',
        areaId: 505,
        maxCapacity: 250,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
      {
        id: 42002,
        name: 'Zone d\'Observation Extérieure',
        areaId: 506,
        maxCapacity: 300,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event42/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -80).toISOString(),
  },
// --- Événement 43 (Sport - Marathon) ---
  {
    id: 43,
    name: 'Marathon de la Côte d\'Azur',
    category: {id: 5, name: 'Sport'},
    shortDescription: 'Courez le long de la Méditerranée dans un cadre exceptionnel.',
    fullDescription: 'Participez à l\'un des plus beaux marathons de France, avec un parcours longeant la mer de Nice à Cannes. Plusieurs distances disponibles : marathon, semi-marathon, 10km.',
    tags: ['marathon', 'course à pied', 'sport', 'compétition', 'côte d\'azur', 'nice', 'cannes'],
    startDate: addDays(today, 250).toISOString().replace('T18', 'T08:00'),
    endDate: addDays(today, 250).toISOString().replace('T18', 'T14:00'),
    address: { // Adresse du départ
      street: 'Promenade des Anglais',
      city: 'Nice',
      zipCode: '06000',
      country: 'France',
    },
    structureId: 10, // Un "parcours" ou "zone événementielle"
    isFreeEvent: false, // Inscription à la course
    defaultSeatingType: SeatingType.STANDING, // Pour les spectateurs
    audienceZones: [
      {
        id: 43001,
        name: 'Zone Départ/Arrivée Nice',
        areaId: 1004,
        maxCapacity: 10000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 43002,
        name: 'Zone Arrivée Cannes',
        areaId: 1005,
        maxCapacity: 5000,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event43/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -120).toISOString(),
  },
// --- Événement 44 (Exposition de Sculptures en Plein Air) ---
  {
    id: 44,
    name: 'Jardin des Sculptures Éphémères',
    category: {id: 4, name: 'Exposition'},
    shortDescription: 'Des œuvres monumentales et poétiques à découvrir dans un cadre verdoyant.',
    fullDescription: 'Une promenade artistique au cœur d\'un jardin, où des sculptures contemporaines dialoguent avec la nature. Un événement culturel à ciel ouvert.',
    tags: ['sculpture', 'art contemporain', 'exposition', 'plein air', 'jardin', 'bordeaux'],
    startDate: addDays(today, 15).toISOString(),
    endDate: addDays(today, 100).toISOString(), // Longue durée
    address: {
      street: 'Jardin Public de Bordeaux',
      city: 'Bordeaux',
      zipCode: '33000',
      country: 'France',
    },
    structureId: 6, // Un parc/jardin public
    isFreeEvent: true,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 44001,
        name: 'Parcours des Sculptures',
        areaId: 604,
        maxCapacity: 2000,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event44/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -5).toISOString(),
  },
// --- Événement 45 (Festival de Théâtre Amateur) ---
  {
    id: 45,
    name: 'Rencontres Théâtrales Amateurs',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'La passion du théâtre partagée par des troupes de toute la région.',
    fullDescription: 'Un festival convivial mettant en avant la créativité et le talent des comédiens amateurs. Plusieurs pièces présentées sur plusieurs jours, pour tous les goûts.',
    tags: ['théâtre', 'amateur', 'festival', 'spectacle', 'local', 'rennes'],
    startDate: addDays(today, 78).toISOString(),
    endDate: addDays(today, 80).toISOString(),
    address: {
      street: 'Maison de Quartier La Touche',
      city: 'Rennes',
      zipCode: '35000',
      country: 'France',
    },
    structureId: 19, // ID pour une "Maison de Quartier" ou "Petit Théâtre"
    isFreeEvent: true, // Souvent gratuit ou participation libre
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 45001,
        name: 'Salle de Spectacle Polyvalente',
        areaId: 1901,
        maxCapacity: 150,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event45/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -60).toISOString(),
  },
// --- Événement 46 (Atelier de Réparation Vélo - "Repair Café") ---
  {
    id: 46,
    name: 'Repair Café Vélo : Apprenez à Réparer Votre Monture',
    category: {id: 10, name: 'Atelier Créatif'}, // Ou "Service", "Communauté"
    shortDescription: 'Des bénévoles vous aident à diagnostiquer et réparer les petits soucis de votre vélo.',
    fullDescription: 'Ne jetez plus, réparez ! Apportez votre vélo et apprenez les gestes de base pour l\'entretien et les petites réparations, accompagné par des passionnés de mécanique.',
    tags: ['vélo', 'réparation', 'repair café', 'diy', 'écologie', 'atelier', 'strasbourg'],
    startDate: addDays(today, 9).toISOString().replace('T18', 'T10:00'), // Un samedi
    endDate: addDays(today, 9).toISOString().replace('T18', 'T13:00'),
    address: {
      street: 'Centre Socio-Culturel Le Partage, 1 Place du Marché',
      city: 'Strasbourg',
      zipCode: '67200',
      country: 'France',
    },
    structureId: 19, // Un centre socio-culturel
    isFreeEvent: true, // Participation libre
    defaultSeatingType: SeatingType.STANDING, // On travaille sur les vélos
    audienceZones: [
      {
        id: 46001,
        name: 'Zone Atelier Réparation',
        areaId: 1902,
        maxCapacity: 30,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event46/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -15).toISOString(),
  },
// --- Événement 47 (Concert Électro-Swing) ---
  {
    id: 47,
    name: 'Soirée Électro-Swing : "Gatsby Revisited"',
    category: {id: 1, name: 'Concert'},
    shortDescription: 'Plongez dans l\'ambiance des années folles avec une touche moderne !',
    fullDescription: 'DJ set et performances live mêlant swing vintage et beats électroniques. Dress code années 20 apprécié pour une immersion totale.',
    tags: ['électro-swing', 'concert', 'dj set', 'soirée', 'années 20', 'vintage', 'montpellier'],
    startDate: addDays(today, 63).toISOString().replace('T18', 'T22:00'),
    endDate: addDays(today, 64).toISOString().replace('T18', 'T03:00'), // Termine tard
    address: {
      street: 'Le Rockstore, 20 Rue de Verdun',
      city: 'Montpellier',
      zipCode: '34000',
      country: 'France',
    },
    structureId: 5, // Une salle de concert/club
    isFreeEvent: false,
    defaultSeatingType: SeatingType.STANDING,
    audienceZones: [
      {
        id: 47001,
        name: 'Dancefloor Principal',
        areaId: 507,
        maxCapacity: 600,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 47002,
        name: 'Espace Lounge (places assises limitées)',
        areaId: 507,
        maxCapacity: 50,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event47/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -53).toISOString(),
  },
// --- Événement 48 (Festival Gastronomique - Food Trucks) ---
  {
    id: 48,
    name: 'Street Food Festival : Saveurs du Monde',
    category: {id: 2, name: 'Festival'}, // Ou "Gastronomie"
    shortDescription: 'Une farandole de food trucks proposant des spécialités culinaires variées.',
    fullDescription: 'Voyagez à travers les saveurs du monde entier grâce à une sélection de food trucks de qualité. Musique live et animations pour un week-end gourmand.',
    tags: ['food truck', 'street food', 'festival', 'gastronomie', 'cuisine du monde', 'lyon'],
    startDate: addDays(today, 24).toISOString(),
    endDate: addDays(today, 25).toISOString(),
    address: {
      street: 'Quais du Rhône (Berges)',
      city: 'Lyon',
      zipCode: '69002',
      country: 'France',
    },
    structureId: 7, // Espace public type quais
    isFreeEvent: true, // Entrée libre, on paye ce qu'on consomme
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 48001,
        name: 'Zone Food Trucks Principale',
        areaId: 707,
        maxCapacity: 3000,
        isActive: true,
        seatingType: SeatingType.MIXED
      },
      {
        id: 48002,
        name: 'Espace Détente (tables et bancs)',
        areaId: 707,
        maxCapacity: 200,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event48/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -33).toISOString(),
  },
// --- Événement 49 (Pièce de Théâtre Enfant) ---
  {
    id: 49,
    name: 'Le Voyage de Léo le Nuage (Spectacle Jeune Public)',
    category: {id: 3, name: 'Théâtre'},
    shortDescription: 'Une aventure poétique et musicale pour les tout-petits (3-6 ans).',
    fullDescription: 'Suivez Léo, un petit nuage curieux, dans son voyage à travers le ciel. Un spectacle interactif avec marionnettes, chansons et jeux de lumière pour éveiller l\'imaginaire des enfants.',
    tags: ['théâtre', 'enfant', 'jeune public', 'spectacle', 'marionnettes', 'conte', 'nantes'],
    startDate: addDays(today, 36).toISOString().replace('T18', 'T11:00'), // Matinée
    endDate: addDays(today, 36).toISOString().replace('T18', 'T11:45'),
    address: {
      street: 'Théâtre pour Enfants "Le Ballon Rouge", 8 Rue des Petits Murs',
      city: 'Nantes',
      zipCode: '44000',
      country: 'France',
    },
    structureId: 20, // ID pour un théâtre pour enfants
    isFreeEvent: false,
    defaultSeatingType: SeatingType.SEATED,
    audienceZones: [
      {
        id: 49001,
        name: 'Salle Spectacle (Gradins Enfants)',
        areaId: 2001,
        maxCapacity: 80,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: false,
    isFeaturedEvent: false,
    mainPhotoUrl: `https://picsum.photos/seed/event49/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -44).toISOString(),
  },
// --- Événement 50 (Exposition d'Art Abstrait - Vernissage) ---
  {
    id: 50,
    name: 'Vernissage Exposition "Formes & Couleurs" - Artiste X',
    category: {id: 4, name: 'Exposition'},
    shortDescription: 'Découvrez en avant-première les nouvelles œuvres de l\'artiste peintre X.',
    fullDescription: 'La galerie Y a le plaisir de vous convier au vernissage de l\'exposition "Formes & Couleurs", présentant les dernières toiles abstraites de l\'artiste X. En présence de l\'artiste.',
    tags: ['art', 'peinture', 'abstrait', 'exposition', 'vernissage', 'galerie', 'paris'],
    startDate: addDays(today, 7).toISOString().replace('T18', 'T18:30'), // Soirée
    endDate: addDays(today, 7).toISOString().replace('T18', 'T21:00'),
    address: {
      street: 'Galerie Y, 15 Rue de Seine',
      city: 'Paris',
      zipCode: '75006',
      country: 'France',
    },
    structureId: 3, // Galerie d'art
    isFreeEvent: true, // Vernissage souvent gratuit
    defaultSeatingType: SeatingType.STANDING, // On déambule pour un vernissage
    audienceZones: [
      {
        id: 50001,
        name: 'Espace Galerie Principal',
        areaId: 308,
        maxCapacity: 100,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    mainPhotoUrl: `https://picsum.photos/seed/event50/800/400`,
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -10).toISOString(),
  },
// --- Événement 51 (Festival de Musique du Monde - Clôture) ---
  {
    id: 51,
    name: 'Festival "Horizons Sonores" - Soirée de Clôture',
    category: {id: 2, name: 'Festival'},
    shortDescription: 'Grande soirée festive pour clore le festival des musiques du monde.',
    fullDescription: 'Après plusieurs jours de découvertes musicales, le festival "Horizons Sonores" se termine en beauté avec un concert exceptionnel regroupant plusieurs artistes invités. Une célébration de la diversité culturelle.',
    tags: ['musique du monde', 'festival', 'concert', 'clôture', 'diversité', 'marseille'],
    startDate: addDays(today, 92).toISOString().replace('T18', 'T19:00'),
    endDate: addDays(today, 92).toISOString().replace('T18', 'T23:59'),
    address: {
      street: 'Dock des Suds, 12 Rue Urbain V',
      city: 'Marseille',
      zipCode: '13002',
      country: 'France',
    },
    structureId: 2, // Grande salle ou espace événementiel
    isFreeEvent: false,
    defaultSeatingType: SeatingType.MIXED,
    audienceZones: [
      {
        id: 51001,
        name: 'Fosse Concert',
        areaId: 204,
        maxCapacity: 1500,
        isActive: true,
        seatingType: SeatingType.STANDING
      },
      {
        id: 51002,
        name: 'Gradins Latéraux',
        areaId: 204,
        maxCapacity: 500,
        isActive: true,
        seatingType: SeatingType.SEATED
      },
    ],
    displayOnHomepage: true,
    isFeaturedEvent: true,
    links: ['http://horizons-sonores-festival.com'],
    mainPhotoUrl: `https://picsum.photos/seed/event51/800/400`,
    eventPhotoUrls: [`https://picsum.photos/seed/event51_galleryA/600/350`, `https://picsum.photos/seed/event51_galleryB/600/350`],
    status: EventStatus.PUBLISHED,
    createdAt: addDays(today, -110).toISOString(),
    updatedAt: addDays(today, -10).toISOString(),
  }
];
