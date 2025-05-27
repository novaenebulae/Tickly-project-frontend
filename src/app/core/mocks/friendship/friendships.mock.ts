// src/app/core/mocks/friendship/friendships.mock.ts

import { FriendshipModel, FriendRequestModel, FriendModel } from '../../models/friendship/friendship.model';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {UserModel} from '../../models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class FriendshipMockService {

  /**
   * Génère une liste d'amis mockée
   */
  getMockFriends(): FriendModel[] {
    return [
      {
        id: 101,
        friendshipId: 1001,
        firstName: 'Sophie',
        lastName: 'Martin',
        email: 'sophie.martin@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        id: 102,
        friendshipId: 1002,
        firstName: 'Thomas',
        lastName: 'Bernard',
        email: 'thomas.bernard@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000) // 1 heure
      },
      {
        id: 103,
        friendshipId: 1003,
        firstName: 'Camille',
        lastName: 'Dubois',
        email: 'camille.dubois@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
        isOnline: true,
        lastSeen: new Date()
      },
      {
        id: 104,
        friendshipId: 1004,
        firstName: 'Antoine',
        lastName: 'Petit',
        email: 'antoine.petit@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
        isOnline: false,
        lastSeen: new Date(Date.now() - 86400000) // 1 jour
      }
    ];
  }

  /**
   * Génère des demandes d'amitié en attente mockées
   */
  getMockPendingRequests(): FriendRequestModel[] {
    return [
      {
        id: 2001,
        user: {
          id: 201,
          firstName: 'Léa',
          lastName: 'Moreau',
          email: 'lea.moreau@example.com',
          avatarUrl: 'https://randomuser.me/api/portraits/women/55.jpg'
        },
        createdAt: new Date(Date.now() - 12 * 3600000), // 12 heures
        status: 'pending'
      },
      {
        id: 2002,
        user: {
          id: 202,
          firstName: 'Hugo',
          lastName: 'Roux',
          email: 'hugo.roux@example.com',
          avatarUrl: 'https://randomuser.me/api/portraits/men/23.jpg'
        },
        createdAt: new Date(Date.now() - 2 * 86400000), // 2 jours
        status: 'pending'
      },
      {
        id: 2003,
        user: {
          id: 203,
          firstName: 'Emma',
          lastName: 'Blanc',
          email: 'emma.blanc@example.com',
          avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg'
        },
        createdAt: new Date(Date.now() - 4 * 3600000), // 4 heures
        status: 'pending'
      }
    ];
  }

  /**
   * Génère des demandes d'amitié envoyées mockées
   */
  getMockSentRequests(): FriendRequestModel[] {
    return [
      {
        id: 3001,
        user: {
          id: 301,
          firstName: 'Lucas',
          lastName: 'Girard',
          email: 'lucas.girard@example.com',
          avatarUrl: 'https://randomuser.me/api/portraits/men/34.jpg'
        },
        createdAt: new Date(Date.now() - 5 * 3600000), // 5 heures
        status: 'pending'
      },
      {
        id: 3002,
        user: {
          id: 302,
          firstName: 'Chloé',
          lastName: 'Fournier',
          email: 'chloe.fournier@example.com',
          avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg'
        },
        createdAt: new Date(Date.now() - 3 * 86400000), // 3 jours
        status: 'accepted'
      },
      {
        id: 3003,
        user: {
          id: 303,
          firstName: 'Maxime',
          lastName: 'Lefebvre',
          email: 'maxime.lefebvre@example.com',
          avatarUrl: 'https://randomuser.me/api/portraits/men/88.jpg'
        },
        createdAt: new Date(Date.now() - 5 * 86400000), // 5 jours
        status: 'rejected'
      }
    ];
  }

  /**
   * Génère des résultats de recherche d'utilisateurs mockés
   */
  getMockSearchResults(query: string): any[] {
    // Liste complète des utilisateurs fictifs
    const allUsers = [
      {
        id: 401,
        firstName: 'Marie',
        lastName: 'Lambert',
        email: 'marie.lambert@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/28.jpg'
      },
      {
        id: 402,
        firstName: 'Paul',
        lastName: 'Durand',
        email: 'paul.durand@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/56.jpg'
      },
      {
        id: 403,
        firstName: 'Julie',
        lastName: 'Leroy',
        email: 'julie.leroy@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/42.jpg'
      },
      {
        id: 404,
        firstName: 'Nicolas',
        lastName: 'Faure',
        email: 'nicolas.faure@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg'
      },
      {
        id: 405,
        firstName: 'Laura',
        lastName: 'Mercier',
        email: 'laura.mercier@example.com',
        avatarUrl: 'https://randomuser.me/api/portraits/women/36.jpg'
      }
    ];

    // Filtrer en fonction de la requête
    if (!query || query.trim() === '') {
      return [];
    }

    const lowercaseQuery = query.toLowerCase();

    // Vérifier si c'est une recherche par email exact (contient @ et .)
    if (query.includes('@') && query.includes('.')) {
      // Recherche exacte par email
      return allUsers.filter(user => user.email.toLowerCase() === lowercaseQuery);
    } else {
      // Recherche partielle sur tous les champs
      return allUsers.filter(user =>
        user.firstName.toLowerCase().includes(lowercaseQuery) ||
        user.lastName.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery)
      );
    }
  }

  /**
   * Génère une liste aléatoire d'amis qui participent à un événement
   */
  getMockFriendsAttendingEvent(eventId: number): FriendModel[] {
    // Récupérer la liste des amis mockés
    const allFriends = this.getMockFriends();

    // Sélectionner aléatoirement 0 à N amis qui participent
    const friendCount = Math.floor(Math.random() * (allFriends.length + 1));

    if (friendCount === 0) {
      return [];
    }

    // Mélanger le tableau des amis pour obtenir une sélection aléatoire
    const shuffledFriends = [...allFriends].sort(() => 0.5 - Math.random());

    // Prendre les N premiers amis
    return shuffledFriends.slice(0, friendCount);
  }

}
