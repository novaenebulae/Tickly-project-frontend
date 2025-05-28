import { StructureAddressModel } from '../../../models/structure/structure-address.model';
import { StructureTypeModel } from '../../../models/structure/structure-type.model';
import {StructureAreaModel} from '../../../models/structure/structure-area.model';
// Nous n'incluons pas areas ici, car mockAreas sera une liste séparée
// et StructureApiMockService les combinera au besoin.

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const today = new Date();


export interface MockApiStructureDto {
  id: number;
  name: string;
  types: StructureTypeModel[]; // L'API retourne les objets types complets
  description?: string;
  address: StructureAddressModel;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  socialsUrl?: string[];
  logoUrl?: string;
  coverUrl?: string;
  createdAt: string;  // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
  importance?: number;
  eventsCount?: number;
  areas?: Partial<StructureAreaModel>[];

  // Note: 'areas' n'est pas inclus ici directement car dans StructureApiMockService,
  // mockGetStructureById ou mockGetStructures ne les attachent pas forcément par défaut.
  // mockGetAreas(structureId) est appelé séparément.
  // Cependant, si votre API *retourne* les areas avec la structure, ajoutez '
}


export const mockStructures: MockApiStructureDto[] = [
  // Structure ID 1: Grand complexe (utilisé par event 1, 5, 11, 12, 30, 41)
  {
    id: 1,
    name: 'Le Grand Complexe Événementiel Parisien',
    types: [{ id: 1, name: 'Salle de Concert / Spectacle' }, { id: 6, name: 'Centre de Congrès / Exposition' }],
    description: 'Un espace modulable capable d\'accueillir les plus grands événements, des concerts rock aux salons professionnels et conférences internationales. Plusieurs salles et espaces extérieurs.',
    address: { street: '15 Avenue des Champs-Élysées', city: 'Paris', zipCode: '75008', country: 'France' },
    phone: '01 23 45 67 89',
    email: 'contact@grandcomplexe-paris.fr',
    websiteUrl: 'https://grandcomplexe-paris.fr',
    socialsUrl: ['https://facebook.com/grandcomplexeparis', 'https://twitter.com/grandcomplexeparis'],
    logoUrl: `https://picsum.photos/seed/structurelogo1/200/200`,
    coverUrl: `https://picsum.photos/seed/structurecover1/1200/400`,
    createdAt: addDays(today, -700).toISOString(),
    updatedAt: addDays(today, -30).toISOString(),
    importance: 5,
    eventsCount: 25 // Nombre total d'événements associés (passés et futurs)
  },
  // Structure ID 2: Auditorium / Grande Salle (utilisé par event 2, 14, 20, 51)
  {
    id: 2,
    name: 'Auditorium Harmonia',
    types: [{ id: 1, name: 'Salle de Concert / Spectacle' }, { id: 2, name: 'Théâtre' }],
    description: 'Salle de concert et de spectacle de renommée internationale, connue pour son acoustique exceptionnelle et sa programmation éclectique.',
    address: { street: '149 Rue Garibaldi', city: 'Lyon', zipCode: '69003', country: 'France' },
    phone: '04 72 82 20 00',
    email: 'info@auditorium-harmonia.ly',
    websiteUrl: 'https://auditorium-harmonia.ly',
    logoUrl: `https://picsum.photos/seed/structurelogo2/200/200`,
    coverUrl: `https://picsum.photos/seed/structurecover2/1200/400`,
    createdAt: addDays(today, -1500).toISOString(),
    importance: 4,
    eventsCount: 45
  },
  // Structure ID 3: Musée / Galerie / Centre Expo (utilisé par event 3, 19, 25, 34, 39, 50)
  {
    id: 3,
    name: 'Espace Culturel "Perspectives"',
    types: [{ id: 3, name: 'Musée / Galerie d\'Art' }, { id: 6, name: 'Centre de Congrès / Exposition' }],
    description: 'Un lieu vibrant dédié à l\'art contemporain, aux expositions thématiques et aux rencontres culturelles. Plusieurs galeries et un auditorium.',
    address: { street: '41 Rue Jobin, La Friche', city: 'Marseille', zipCode: '13003', country: 'France' },
    phone: '04 95 09 30 30',
    email: 'accueil@espace-perspectives.com',
    websiteUrl: 'https://espace-perspectives.com',
    logoUrl: `https://picsum.photos/seed/structurelogo3/200/200`,
    coverUrl: `https://picsum.photos/seed/structurecover3/1200/400`,
    createdAt: addDays(today, -1000).toISOString(),
    importance: 3,
    eventsCount: 18
  },
  // Structure ID 4: Stade (utilisé par event 4)
  {
    id: 4,
    name: 'Stade Municipal de Bordeaux',
    types: [{ id: 4, name: 'Stade / Complexe Sportif' }],
    description: 'Le principal stade de la ville, accueillant des matchs de football, de rugby et d\'autres événements sportifs majeurs.',
    address: { street: 'Cours Jules Ladoumègue', city: 'Bordeaux', zipCode: '33300', country: 'France' },
    phone: '05 56 00 00 00',
    email: 'contact@stade-bordeaux.fr',
    logoUrl: `https://picsum.photos/seed/structurelogo4/200/200`,
    coverUrl: `https://picsum.photos/seed/structurecover4/1200/400`,
    createdAt: addDays(today, -2000).toISOString(),
    importance: 4,
    eventsCount: 30
  },
  // Structure ID 5: Théâtre / Salle de Concert (utilisé par event 6, 37, 42, 47)
  {
    id: 5,
    name: 'Théâtre de la Comète',
    types: [{ id: 2, name: 'Théâtre' }, { id: 1, name: 'Salle de Concert / Spectacle' }],
    description: 'Un théâtre historique proposant une programmation variée, du classique au contemporain, ainsi que des concerts intimistes.',
    address: { street: '1 Rue Pierre Baudis', city: 'Toulouse', zipCode: '31000', country: 'France' },
    phone: '05 61 22 00 00',
    email: 'billetterie@theatre-comete.fr',
    logoUrl: `https://picsum.photos/seed/structurelogo5/200/200`,
    coverUrl: `https://picsum.photos/seed/structurecover5/1200/400`,
    createdAt: addDays(today, -1800).toISOString(),
    importance: 3,
    eventsCount: 22
  },
  // Structure ID 6: Parc / Lieu en Plein Air (utilisé par event 7, 18, 24 (plage!), 40, 44)
  {
    id: 6,
    name: 'Grand Parc Urbain',
    types: [{ id: 5, name: 'Lieu en Plein Air / Parc' }],
    description: 'Vaste parc paysager au cœur de la ville, idéal pour les événements en plein air, les festivals et les activités de loisirs.',
    address: { street: 'Avenue du Parc Central', city: 'Nice', zipCode: '06000', country: 'France' },
    phone: '04 93 00 00 00',
    email: 'parcs-jardins@ville-nice.fr',
    logoUrl: `https://picsum.photos/seed/structurelogo6/200/200`,
    coverUrl: `https://picsum.photos/seed/structurecover6/1200/400`,
    createdAt: addDays(today, -900).toISOString(),
    importance: 2,
    eventsCount: 15
  },
  // Structure ID 7: Place Publique / Espace Urbain (utilisé par event 8, 15, 21, 26, 32, 48)
  {
    id: 7,
    name: 'Place de la République',
    types: [{ id: 7, name: 'Place Publique / Espace Urbain' }],
    description: 'Place centrale animée, accueillant marchés, concerts en plein air et rassemblements populaires.',
    address: { street: 'Place de la République', city: 'Strasbourg', zipCode: '67000', country: 'France' },
    createdAt: addDays(today, -500).toISOString(),
    importance: 3,
    eventsCount: 12
  },
  // Structure ID 8: Atelier / École (utilisé par event 9, 16, 38)
  {
    id: 8,
    name: 'Les Ateliers Créatifs de la Ville',
    types: [{ id: 8, name: 'Atelier / École (Art, Cuisine, etc.)' }],
    description: 'Un lieu dédié à l\'apprentissage et à la pratique artistique et artisanale. Propose des cours et des ateliers pour tous les âges.',
    address: { street: '5 Rue des Tanneurs', city: 'Lille', zipCode: '59000', country: 'France' },
    phone: '03 20 00 00 00',
    email: 'contact@ateliers-creatifs-lille.com',
    logoUrl: `https://picsum.photos/seed/structurelogo8/200/200`,
    createdAt: addDays(today, -400).toISOString(),
    importance: 2,
    eventsCount: 8
  },
  // Structure ID 9: Autre Place Publique (utilisé par event 10)
  {
    id: 9,
    name: 'Place de la Mairie de Rennes',
    types: [{ id: 7, name: 'Place Publique / Espace Urbain' }],
    description: 'La place centrale devant l\'hôtel de ville, souvent utilisée pour des événements publics.',
    address: { street: 'Place de la Mairie', city: 'Rennes', zipCode: '35000', country: 'France' },
    createdAt: addDays(today, -600).toISOString(),
    importance: 2,
    eventsCount: 5
  },
  // Structure ID 10: Lieu Événementiel Majeur / Parcours (utilisé par event 13, 17, 43)
  {
    id: 10,
    name: 'Espace Événementiel "Le Confluent"',
    types: [{ id: 11, name: 'Espace Événementiel Polyvalent' }, { id: 5, name: 'Lieu en Plein Air / Parc' }],
    description: 'Grand espace capable d\'accueillir des festivals, des courses et des événements de grande envergure, avec des infrastructures adaptées.',
    address: { street: 'Route du Lac', city: 'Annecy', zipCode: '74000', country: 'France' },
    logoUrl: `https://picsum.photos/seed/structurelogo10/200/200`,
    createdAt: addDays(today, -300).toISOString(),
    importance: 4,
    eventsCount: 7
  },
  // Ajoutons les IDs de structure utilisés dans event-data.mock.ts et non encore définis :
  // Structure ID 11 (utilisé par event 22)
  {
    id: 11,
    name: 'Site en Développement "Nova Arena"',
    types: [{ id: 11, name: 'Espace Événementiel Polyvalent' }],
    description: 'Futur complexe événementiel en cours de conception, destiné aux grands concerts et événements sportifs.',
    address: { street: 'Zone Industrielle Nord', city: 'Villeurbanne', zipCode: '69100', country: 'France' },
    createdAt: addDays(today, -100).toISOString(),
    importance: 1,
    eventsCount: 0
  },
  // Structure ID 12 (utilisé par event 23, 33)
  {
    id: 12,
    name: 'Le Petit Café Intime',
    types: [{ id: 9, name: 'Café-Concert / Petit Club' }],
    description: 'Un café chaleureux proposant des concerts acoustiques et des soirées jazz dans une ambiance feutrée.',
    address: { street: '12 Rue de Vesle', city: 'Reims', zipCode: '51100', country: 'France' },
    logoUrl: `https://picsum.photos/seed/structurelogo12/200/200`,
    createdAt: addDays(today, -250).toISOString(),
    importance: 2,
    eventsCount: 15
  },
  // Structure ID 13 (utilisé par event 24)
  {
    id: 13,
    name: 'Plage des Corsaires',
    types: [{ id: 13, name: 'Plage Aménagée' }],
    description: 'Plage de sable fin équipée pour les sports nautiques et les tournois de beach-volley.',
    address: { street: 'Avenue de l\'Océan', city: 'Biarritz', zipCode: '64200', country: 'France' },
    createdAt: addDays(today, -180).toISOString(),
    importance: 3,
    eventsCount: 3
  },
  // Structure ID 14 (utilisé par event 27)
  {
    id: 14,
    name: 'Librairie "L\'Encre et la Plume"',
    types: [{ id: 14, name: 'Librairie / Espace Culturel' }],
    description: 'Librairie indépendante proposant une large sélection d\'ouvrages et accueillant régulièrement des ateliers d\'écriture et des rencontres d\'auteurs.',
    address: { street: '7 Rue des Écoles', city: 'Paris', zipCode: '75005', country: 'France' },
    logoUrl: `https://picsum.photos/seed/structurelogo14/200/200`,
    createdAt: addDays(today, -320).toISOString(),
    importance: 2,
    eventsCount: 6
  },
  // Structure ID 15 (utilisé par event 29)
  {
    id: 15,
    name: 'Angoulême - Cité de la BD',
    types: [{ id: 15, name: 'Espace Festivalier Multi-sites' }, { id: 3, name: 'Musée / Galerie d\'Art' }],
    description: 'Ensemble de lieux dédiés à la bande dessinée, comprenant le musée, des espaces d\'exposition et des salles de conférence, particulièrement actifs pendant le Festival International.',
    address: { street: '121 Rue de Bordeaux', city: 'Angoulême', zipCode: '16000', country: 'France' },
    createdAt: addDays(today, -1200).toISOString(),
    importance: 4,
    eventsCount: 40 // Beaucoup d'événements liés au festival
  },
  // Structure ID 16 (utilisé par event 31)
  {
    id: 16,
    name: 'Parc National des Calanques - Point Info',
    types: [{ id: 16, name: 'Parc National / Zone Naturelle' }],
    description: 'Point d\'information et de départ pour les randonnées dans le Parc National des Calanques.',
    address: { street: 'Route de la Gineste', city: 'Marseille', zipCode: '13009', country: 'France' },
    createdAt: addDays(today, -450).toISOString(),
    importance: 3,
    eventsCount: 50 // Randonnées, événements de sensibilisation
  },
  // Structure ID 17 (utilisé par event 35) - déjà utilisé par ID 10, je vais changer pour 17
  // ID 10 est 'Espace Événementiel "Le Confluent"' pour event 13, 17, 43.
  // L'événement 35 (tournoi jeux de société) a besoin d'une Ludothèque.
  {
    id: 17,
    name: 'Ludothèque "Le Dé Pipé"',
    types: [{ id: 12, name: 'Ludothèque / Espace de Jeux' }],
    description: 'Un espace convivial pour jouer à des centaines de jeux de société, participer à des tournois et découvrir de nouvelles pépites ludiques.',
    address: { street: '33 Rue des Filatiers', city: 'Toulouse', zipCode: '31000', country: 'France' },
    logoUrl: `https://picsum.photos/seed/structurelogo17/200/200`,
    createdAt: addDays(today, -280).toISOString(),
    importance: 2,
    eventsCount: 10
  },
  // Structure ID 18 (utilisé par event 36)
  {
    id: 18,
    name: 'Chapiteau Magique - Cirque Itinérant',
    types: [{ id: 18, name: 'Chapiteau de Cirque / Structure Temporaire' }],
    description: 'Un grand chapiteau coloré accueillant des spectacles de cirque traditionnels et modernes lors de ses tournées.',
    address: { street: 'Emplacement variable selon tournée', city: 'Tournée Nationale', zipCode: '', country: 'France' },
    createdAt: addDays(today, -150).toISOString(),
    importance: 3,
    eventsCount: 20 // Sur plusieurs villes
  },
  // Structure ID 19 (utilisé par event 45, 46)
  {
    id: 19,
    name: 'Centre Culturel "Le Lien"',
    types: [{ id: 19, name: 'Centre Socio-Culturel / Maison de Quartier' }, { id: 8, name: 'Atelier / École (Art, Cuisine, etc.)'}],
    description: 'Un lieu de vie et d\'activités pour tous les habitants du quartier, proposant ateliers, spectacles, et services communautaires.',
    address: { street: '1 Place du Marché', city: 'Strasbourg', zipCode: '67200', country: 'France' },
    logoUrl: `https://picsum.photos/seed/structurelogo19/200/200`,
    createdAt: addDays(today, -380).toISOString(),
    importance: 2,
    eventsCount: 25
  },
  // Structure ID 20 (utilisé par event 49)
  {
    id: 20,
    name: 'Théâtre "Les Petits Lutins"',
    types: [{ id: 20, name: 'Théâtre pour Enfants' }],
    description: 'Un théâtre entièrement dédié au jeune public, avec une programmation adaptée aux différentes tranches d\'âge, des contes aux marionnettes.',
    address: { street: '8 Rue des Petits Murs', city: 'Nantes', zipCode: '44000', country: 'France' },
    createdAt: addDays(today, -220).toISOString(),
    importance: 2,
    eventsCount: 30
  },
];

