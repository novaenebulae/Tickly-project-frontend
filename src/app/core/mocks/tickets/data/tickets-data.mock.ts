import {v4 as uuidv4} from 'uuid';
import {TicketModel} from '../../../models/tickets/ticket.model';
import {TicketStatus} from '../../../models/tickets/ticket-status.enum'; // Ajustez le chemin si nécessaire
import {SeatingType} from '../../../models/event/event-audience-zone.model'; // Ajustez le chemin si nécessaire

// Helper pour générer des dates (similaire à events.mock.ts)
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const today = new Date();

// Simuler quelques événements et utilisateurs pour l'exemple.
// Dans votre application, vous importeriez allMockEvents et mockUsers.
// Pour cet exemple autonome, je vais définir des stubs ici.
const MOCK_EVENT_1 = { // Festival Rock en Seine (id: 1), structureId: 1
  id: 1,
  name: 'Festival Rock en Seine',
  startDate: addDays(today, 30),
  endDate: addDays(today, 32),
  address: { street: 'Domaine National de Saint-Cloud', city: 'Saint-Cloud', zipCode: '92210', country: 'France' },
  mainPhotoUrl: `https://picsum.photos/seed/event1/800/400`,
  audienceZones: [
    { id: 1001, name: 'Fosse Or - Scène Principale', seatingType: SeatingType.STANDING },
    { id: 1002, name: 'Pelouse Scène Principale', seatingType: SeatingType.STANDING },
  ]
};
const MOCK_EVENT_2 = { // Concert Symphonique (id: 2), structureId: 2
  id: 2,
  name: 'Concert Symphonique : Les Quatre Saisons',
  startDate: addDays(today, 45),
  endDate: addDays(today, 45), // Fin le même jour
  address: { street: 'Auditorium Maurice Ravel', city: 'Lyon', zipCode: '69003', country: 'France' },
  mainPhotoUrl: `https://picsum.photos/seed/event2/800/400`,
  audienceZones: [
    { id: 2001, name: 'Parterre Central', seatingType: SeatingType.SEATED },
  ]
};
const MOCK_EVENT_4 = { // Match de Championnat (id: 4), structureId: 4
  id: 4,
  name: 'Match de Championnat - FC Local vs Étoile FC',
  startDate: addDays(today, 7),
  endDate: addDays(today, 7),
  address: { street: 'Stade Municipal', city: 'Bordeaux', zipCode: '33000', country: 'France' },
  mainPhotoUrl: `https://picsum.photos/seed/event4/800/400`,
  audienceZones: [
    { id: 4001, name: 'Tribune Nord', seatingType: SeatingType.SEATED },
  ]
};

const MOCK_USER_1 = { id: 1, firstName: 'Alice', lastName: 'Spectateur', email: 'alice.spectateur@example.com' }; // Alice (current mock user)
const MOCK_USER_2 = { id: 2, firstName: 'Bob', lastName: 'AdminStruct', email: 'bob.adminstruct@example.com', structureId: 1 }; // Bob, admin de structure 1
const MOCK_USER_6 = { id: 6, firstName: 'Frank', lastName: 'Dupont', email: 'frank.dupont@example.com' };
const MOCK_USER_9 = { id: 9, firstName: 'Hugo', lastName: 'Sportif', email: 'hugo.sportif@example.com', structureId: 4 }; // Hugo, admin de structure 4


export const mockTickets: TicketModel[] = [
  // --- Billet 1: Pour Alice (utilisateur connecté mock), Événement 1 (Rock en Seine) ---
  {
    id: uuidv4(),
    eventId: MOCK_EVENT_1.id,
    eventSnapshot: {
      name: MOCK_EVENT_1.name,
      startDate: MOCK_EVENT_1.startDate,
      endDate: MOCK_EVENT_1.endDate,
      address: MOCK_EVENT_1.address,
      mainPhotoUrl: MOCK_EVENT_1.mainPhotoUrl,
    },
    audienceZoneId: MOCK_EVENT_1.audienceZones[0].id, // Fosse Or
    audienceZoneSnapshot: {
      name: MOCK_EVENT_1.audienceZones[0].name,
      seatingType: MOCK_EVENT_1.audienceZones[0].seatingType,
    },
    participantInfo: {
      firstName: MOCK_USER_1.firstName,
      lastName: MOCK_USER_1.lastName,
      email: MOCK_USER_1.email,
    },
    qrCodeData: `TICKET_VALIDATE_URL/${/* this.id - sera remplacé par l'id réel */ 'ticket1_qr'}`,
    status: TicketStatus.VALID,
    issuedAt: addDays(today, -10),
    bookedByUserId: MOCK_USER_1.id,
  },
  // --- Billet 2: Pour Alice, autre billet pour Événement 1 (Rock en Seine) ---
  {
    id: uuidv4(),
    eventId: MOCK_EVENT_1.id,
    eventSnapshot: {
      name: MOCK_EVENT_1.name,
      startDate: MOCK_EVENT_1.startDate,
      endDate: MOCK_EVENT_1.endDate,
      address: MOCK_EVENT_1.address,
      mainPhotoUrl: MOCK_EVENT_1.mainPhotoUrl,
    },
    audienceZoneId: MOCK_EVENT_1.audienceZones[1].id, // Pelouse
    audienceZoneSnapshot: {
      name: MOCK_EVENT_1.audienceZones[1].name,
      seatingType: MOCK_EVENT_1.audienceZones[1].seatingType,
    },
    participantInfo: { // Participant différent pour ce billet
      firstName: 'Chloé',
      lastName: 'AmieDAlicia',
      email: 'chloe.amie@example.com',
    },
    qrCodeData: `TICKET_VALIDATE_URL/${'ticket2_qr'}`,
    status: TicketStatus.VALID,
    issuedAt: addDays(today, -10),
    bookedByUserId: MOCK_USER_1.id,
  },
  // --- Billet 3: Pour Bob (Admin Structure 1), mais pour un événement d'une AUTRE structure (Concert Symphonique, Event 2, Structure 2) ---
  {
    id: uuidv4(),
    eventId: MOCK_EVENT_2.id,
    eventSnapshot: {
      name: MOCK_EVENT_2.name,
      startDate: MOCK_EVENT_2.startDate,
      endDate: MOCK_EVENT_2.endDate,
      address: MOCK_EVENT_2.address,
      mainPhotoUrl: MOCK_EVENT_2.mainPhotoUrl,
    },
    audienceZoneId: MOCK_EVENT_2.audienceZones[0].id, // Parterre Central
    audienceZoneSnapshot: {
      name: MOCK_EVENT_2.audienceZones[0].name,
      seatingType: MOCK_EVENT_2.audienceZones[0].seatingType,
    },
    participantInfo: {
      firstName: MOCK_USER_2.firstName,
      lastName: MOCK_USER_2.lastName,
      email: MOCK_USER_2.email,
    },
    qrCodeData: `TICKET_VALIDATE_URL/${'ticket3_qr'}`,
    status: TicketStatus.VALID,
    issuedAt: addDays(today, -5),
    bookedByUserId: MOCK_USER_2.id,
  },
  // --- Billet 4: Pour Frank (Spectateur), Événement 4 (Match), billet UTILISÉ ---
  {
    id: uuidv4(),
    eventId: MOCK_EVENT_4.id,
    eventSnapshot: {
      name: MOCK_EVENT_4.name,
      startDate: MOCK_EVENT_4.startDate,
      endDate: MOCK_EVENT_4.endDate,
      address: MOCK_EVENT_4.address,
      mainPhotoUrl: MOCK_EVENT_4.mainPhotoUrl,
    },
    audienceZoneId: MOCK_EVENT_4.audienceZones[0].id, // Tribune Nord
    audienceZoneSnapshot: {
      name: MOCK_EVENT_4.audienceZones[0].name,
      seatingType: MOCK_EVENT_4.audienceZones[0].seatingType,
    },
    participantInfo: {
      firstName: MOCK_USER_6.firstName,
      lastName: MOCK_USER_6.lastName,
      email: MOCK_USER_6.email,
    },
    qrCodeData: `TICKET_VALIDATE_URL/${'ticket4_qr'}`,
    status: TicketStatus.USED, // Statut utilisé
    issuedAt: addDays(today, -15),
    usedAt: addDays(MOCK_EVENT_4.startDate, 0), // Utilisé le jour de l'événement
    bookedByUserId: MOCK_USER_6.id,
  },
  // --- Billet 5: Pour Hugo (Admin Structure 4), mais pour un événement de la Structure 1 (Rock en Seine, Event 1) ---
  // Ceci est pour tester qu'un admin de structure peut acheter des billets pour des événements d'autres structures.
  {
    id: uuidv4(),
    eventId: MOCK_EVENT_1.id,
    eventSnapshot: {
      name: MOCK_EVENT_1.name,
      startDate: MOCK_EVENT_1.startDate,
      endDate: MOCK_EVENT_1.endDate,
      address: MOCK_EVENT_1.address,
      mainPhotoUrl: MOCK_EVENT_1.mainPhotoUrl,
    },
    audienceZoneId: MOCK_EVENT_1.audienceZones[0].id, // Fosse Or
    audienceZoneSnapshot: {
      name: MOCK_EVENT_1.audienceZones[0].name,
      seatingType: MOCK_EVENT_1.audienceZones[0].seatingType,
    },
    participantInfo: {
      firstName: MOCK_USER_9.firstName,
      lastName: MOCK_USER_9.lastName,
      email: MOCK_USER_9.email,
    },
    qrCodeData: `TICKET_VALIDATE_URL/${'ticket5_qr'}`,
    status: TicketStatus.VALID,
    issuedAt: addDays(today, -3),
    bookedByUserId: MOCK_USER_9.id,
  },
];

// Remplacer les placeholders pour qrCodeData avec les IDs réels des tickets
mockTickets.forEach(ticket => {
  ticket.qrCodeData = `TICKET_VALIDATE_URL/${ticket.id}`;
});
