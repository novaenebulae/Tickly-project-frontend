// src/app/shared/components/dialogs/manage-friends-dialog/manage-friends-dialog.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';

import { FriendshipService } from '../../../../core/services/domain/friendship.service';
import { FriendModel, FriendRequestModel } from '../../../../core/models/friendship/friendship.model';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-manage-friends-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './manage-friends-dialog.component.html',
  styleUrls: ['./manage-friends-dialog.component.scss']
})
export class ManageFriendsDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<ManageFriendsDialogComponent>);
  private friendshipService = inject(FriendshipService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  // Signaux pour l'état du composant
  isLoadingFriends = signal(false);
  isLoadingRequests = signal(false);
  isLoadingSearch = signal(false);

  // Données
  friends = signal<FriendModel[]>([]);
  pendingRequests = signal<FriendRequestModel[]>([]);
  sentRequests = signal<FriendRequestModel[]>([]);
  searchResults = signal<any[]>([]);

  // Formulaires
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadFriends();
    this.loadPendingRequests();
    this.loadSentRequests();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      switchMap(value => {
        if (value && value.length >= 3) {
          this.isLoadingSearch.set(true);
          return this.friendshipService.searchUsers(value);
        }
        return [];
      })
    ).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.isLoadingSearch.set(false);
      },
      error: () => {
        this.isLoadingSearch.set(false);
      }
    });
  }

  loadFriends(): void {
    this.isLoadingFriends.set(true);
    this.friendshipService.getFriends(true).subscribe({
      next: (friends) => {
        this.friends.set(friends);
        this.isLoadingFriends.set(false);
      },
      error: () => {
        this.isLoadingFriends.set(false);
      }
    });
  }

  loadPendingRequests(): void {
    this.isLoadingRequests.set(true);
    this.friendshipService.getPendingFriendRequests(true).subscribe({
      next: (requests) => {
        this.pendingRequests.set(requests);
        this.isLoadingRequests.set(false);
      },
      error: () => {
        this.isLoadingRequests.set(false);
      }
    });
  }

  loadSentRequests(): void {
    this.friendshipService.getSentFriendRequests(true).subscribe({
      next: (requests) => this.sentRequests.set(requests)
    });
  }

  sendFriendRequest(userId: number): void {
    this.friendshipService.sendFriendRequest(userId).subscribe({
      next: () => {
        this.loadSentRequests();
        this.searchControl.setValue(''); // Réinitialiser la recherche
        this.searchResults.set([]);
      }
    });
  }

  acceptRequest(requestId: number): void {
    this.friendshipService.acceptFriendRequest(requestId).subscribe({
      next: () => {
        this.loadFriends();
        this.loadPendingRequests();
      }
    });
  }

  rejectRequest(requestId: number): void {
    this.friendshipService.rejectFriendRequest(requestId).subscribe({
      next: () => {
        this.loadPendingRequests();
      }
    });
  }

  removeFriend(friendshipId: number): void {
    this.friendshipService.removeFriend(friendshipId).subscribe({
      next: () => {
        this.loadFriends();
      }
    });
  }

// Vérifie si un utilisateur est déjà ami
  isFriend(userId: number): boolean {
    return this.friends().some(friend => friend.id === userId);
  }

// Vérifie si une demande est en attente pour cet utilisateur
  isPendingRequest(userId: number): boolean {
    return this.sentRequests().some(request =>
      request.user.id === userId && request.status === 'pending'
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}
