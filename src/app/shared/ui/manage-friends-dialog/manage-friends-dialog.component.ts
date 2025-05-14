import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Nécessaire pour @if, @for, etc.

import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

// Interfaces pour structurer les données
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarLetter?: string;
}

export interface FriendRequest {
  id: string; // ID de la relation/demande
  requestingUser: UserProfile;
  requestedAt: Date;
}

export interface Friendship {
  id: string; // ID de la relation
  friend: UserProfile;
  friendsSince: Date;
}

@Component({
  selector: 'app-manage-friends-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatTabsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './manage-friends-dialog.component.html',
  styleUrl: './manage-friends-dialog.component.scss'
})
export class ManageFriendsDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<ManageFriendsDialogComponent>);

  addFriendForm!: FormGroup;

  // Données simulées (à remplacer par des appels de service réels)
  incomingRequests: FriendRequest[] = [];
  currentFriends: Friendship[] = [];

  ngOnInit(): void {
    this.addFriendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.loadMockData();
  }

  loadMockData(): void {
    // Simuler le chargement des données
    const user1: UserProfile = { id: '1', firstName: 'Alice', lastName: 'Dubois', email: 'alice.dubois@example.com' };
    const user2: UserProfile = { id: '2', firstName: 'Bob', lastName: 'Martin', email: 'bob.martin@example.com' };
    const user3: UserProfile = { id: '3', firstName: 'Charlie', lastName: 'Leroy', email: 'charlie.leroy@example.com' };
    const user4: UserProfile = { id: '4', firstName: 'Diana', lastName: 'Moreau', email: 'diana.moreau@example.com' };

    this.incomingRequests = [
      { id: 'req1', requestingUser: this.prepareUser(user1), requestedAt: new Date() },
      { id: 'req2', requestingUser: this.prepareUser(user2), requestedAt: new Date(Date.now() - 86400000) } // Hier
    ];

    this.currentFriends = [
      { id: 'friend1', friend: this.prepareUser(user3), friendsSince: new Date(Date.now() - 86400000 * 10) }, // Ami depuis 10 jours
      { id: 'friend2', friend: this.prepareUser(user4), friendsSince: new Date(Date.now() - 86400000 * 5) }
    ];
  }

  prepareUser(user: UserProfile): UserProfile {
    return {
      ...user,
      avatarLetter: this.getAvatarLetter(user.firstName, user.lastName)
    };
  }

  getAvatarLetter(firstName?: string, lastName?: string): string {
    const fn = firstName?.charAt(0).toUpperCase();
    const ln = lastName?.charAt(0).toUpperCase();
    if (fn && ln) return fn + ln;
    if (fn) return fn;
    if (ln) return ln;
    return '?';
  }

  onSendFriendRequest(): void {
    if (this.addFriendForm.valid) {
      const email = this.addFriendForm.value.email;
      console.log('Demande d\'ami envoyée à :', email);
      // Ici, vous appelleriez votre service pour envoyer la demande
      this.addFriendForm.reset();
      // Optionnel: Afficher une notification/snackbar
    }
  }

  onAcceptRequest(requestId: string): void {
    console.log('Demande acceptée :', requestId);
    // Logique pour accepter la demande (appel service)
    // Puis mettre à jour les listes this.incomingRequests et this.currentFriends
    const requestIndex = this.incomingRequests.findIndex(req => req.id === requestId);
    if (requestIndex > -1) {
      const acceptedUser = this.incomingRequests[requestIndex].requestingUser;
      this.currentFriends.push({
        id: `friend-${Date.now()}`, // Générer un nouvel ID pour l'amitié
        friend: acceptedUser,
        friendsSince: new Date()
      });
      this.incomingRequests.splice(requestIndex, 1);
    }
  }

  onRefuseRequest(requestId: string): void {
    console.log('Demande refusée :', requestId);
    // Logique pour refuser la demande
    this.incomingRequests = this.incomingRequests.filter(req => req.id !== requestId);
  }

  onRemoveFriend(friendshipId: string): void {
    console.log('Ami supprimé :', friendshipId);
    // Logique pour supprimer l'ami
    this.currentFriends = this.currentFriends.filter(friend => friend.id !== friendshipId);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
