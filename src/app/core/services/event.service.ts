// src/app/core/services/event.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Event, EventCategory, EventLocationConfig, EventStatus } from '../models/event.model'; // Correction du chemin

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private mockEvents: Event[] = [
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
      fullDescription: 'Profitez de trois jours de musique live avec des groupes et artistes renommés.',
      links: ['https://festivalmusiqueete.com'],
      mainPhotoUrl: 'https://picsum.photos/seed/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1012/600/400', 'https://picsum.photos/seed/1013/600/400'],
      status: 'published',
      createdByStructureId: 201,
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
      fullDescription: 'Une mise en scène moderne de la célèbre pièce de Shakespeare.',
      links: ['https://theatreroyal.com/romeo-juliette'],
      mainPhotoUrl: 'https://picsum.photos/seed/1021/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1022/600/400'],
      status: 'published',
      createdByStructureId: 202,
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
      fullDescription: 'Venez encourager votre équipe favorite dans ce match décisif.',
      links: ['https://stademunicipal.com/match'],
      mainPhotoUrl: 'https://picsum.photos/seed/1031/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1032/600/400'],
      status: 'published',
      createdByStructureId: 203,
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
      fullDescription: 'Une journée complète de conférences et ateliers sur l\'intelligence artificielle.',
      links: ['https://conferenceia.com'],
      mainPhotoUrl: 'https://picsum.photos/seed/1041/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1042/600/400'],
      status: 'published',
      createdByStructureId: 204,
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
      fullDescription: 'Explorez les dernières tendances de l\'art moderne dans cette exposition.',
      links: ['https://galeriedart.com'],
      mainPhotoUrl: 'https://picsum.photos/seed/1051/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1052/600/400'],
      status: 'published',
      createdByStructureId: 205,
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
      fullDescription: 'Venez écouter les meilleurs musiciens de jazz dans un cadre convivial.',
      links: ['https://concertjazz.com'],
      mainPhotoUrl: 'https://picsum.photos/seed/1061/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1062/600/400'],
      status: 'published',
      createdByStructureId: 206,
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
      fullDescription: 'Une semaine de théâtre contemporain avec des artistes émergents.',
      links: ['https://festivaltheatre.com'],
      mainPhotoUrl: 'https://picsum.photos/seed/1071/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1072/600/400'],
      status: 'published',
      createdByStructureId: 207,
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
      fullDescription: 'Venez encourager les meilleurs skateurs dans cette compétition locale.',
      links: ['https://skateboardcomp.com'],
      mainPhotoUrl: 'https://picsum.photos/seed/1081/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1082/600/400'],
      status: 'published',
      createdByStructureId: 208,
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
      fullDescription: 'Un salon dédié aux passionnés de lecture et d\'écriture.',
      links: ['https://salondulivre.com'],
      mainPhotoUrl: 'https://picsum.photos/seed/1091/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1092/600/400'],
      status: 'published',
      createdByStructureId: 209,
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
      fullDescription: 'Une semaine dédiée au cinéma indépendant avec des projections et débats.',
      links: ['https://festivalcinemaindependant.com'],
      mainPhotoUrl: 'https://picsum.photos/seed/1101/600/400',
      eventPhotoUrls: ['https://picsum.photos/seed/1102/600/400'],
      status: 'published',
      createdByStructureId: 210,
      createdAt: new Date('2025-05-01T10:00:00'),
      updatedAt: new Date('2025-05-10T12:00:00')
    }
  ];

  constructor() {}

  /**
   * Retourne la liste complète des événements mockés.
   */
  getAllEvents(): Observable<Event[]> {
    return of(this.mockEvents);
  }

  /**
   * Retourne les derniers événements ajoutés, limité par count.
   * Les événements sont triés par date de création (createdAt) décroissante.
   * @param count Nombre d'événements à retourner.
   */
  getLatestEvents(count: number): Observable<Event[]> {
    // Crée une copie triée des événements sans modifier l'original
    const sortedEvents = [...this.mockEvents].sort((a, b) => {
      // S'assure que createdAt existe avant de comparer
      const dateA = a.createdAt ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    });
    return of(sortedEvents.slice(0, count));
  }

  /**
   * Retourne un événement par son ID.
   * @param id L'ID de l'événement à récupérer.
   */
  getEventById(id: number): Observable<Event | undefined> {
    const event = this.mockEvents.find(e => e.id === id);
    return of(event);
  }
}
