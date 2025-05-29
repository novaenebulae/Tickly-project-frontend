// src/app/shared/components/dialogs/manage-friends-dialog/manage-friends-dialog.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

import { FriendshipService } from '../../../../core/services/domain/user/friendship.service';
import {FriendModel, } from '../../../../core/models/friendship/friend.model';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';

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
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // Signaux pour l'état du composant
  isLoadingFriends = signal(false);
  isLoadingRequests = signal(false);
  isLoadingSearch = signal(false);
  isSendingRequest = signal(false);

  // Utiliser les computed values du service
  readonly friendsData = this.friendshipService.friends;
  readonly pendingRequestsData = this.friendshipService.pendingRequests;
  readonly sentRequestsData = this.friendshipService.sentRequests;

  // Données locales pour compatibilité avec template
  friends = signal<FriendModel[]>([]);
  pendingRequests = signal<FriendRequestModel[]>([]);
  sentRequests = signal<FriendRequestModel[]>([]);
  searchResults = signal<any[]>([]);

  // Formulaires
  searchControl = new FormControl('');
  addFriendForm!: FormGroup;

  ngOnInit(): void {
    this.loadFriends();
    this.loadPendingRequests();
    this.loadSentRequests();
    this.setupSearch();
    this.initAddFriendForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initAddFriendForm(): void {
    this.addFriendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
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
        // Mettre à jour à la fois les données locales et utiliser celles du service
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


  sendFriendRequestByEmail(): void {
    if (this.addFriendForm.invalid) {
      return;
    }

    const email = this.addFriendForm.get('email')?.value;

    this.isSendingRequest.set(true);
    this.friendshipService.sendFriendRequestByEmail(email).subscribe({
      next: () => {
        this.isSendingRequest.set(false);
        this.notificationService.displayNotification(
          'Demande d\'amitié envoyée avec succès',
          'valid',
          'Fermer'
        );
        this.addFriendForm.reset();
        this.loadSentRequests();
      },
      error: (error) => {
        this.isSendingRequest.set(false);
        console.error('Erreur lors de l\'envoi de la demande d\'amitié', error);
        this.notificationService.displayNotification(
          'Erreur lors de l\'envoi de la demande d\'amitié',
          'error',
          'Fermer'
        );
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

  // Vérifie si un utilisateur est déjà ami - utilise le computed signal du service
  isFriend(userId: number): boolean {
    // On peut utiliser soit les données du service soit les données locales
    return this.friendsData().some(friend => friend.id === userId);
  }

  // Vérifie si une demande est en attente pour cet utilisateur - utilise le computed signal du service
  isPendingRequest(userId: number): boolean {
    // On peut utiliser soit les données du service soit les données locales
    return this.sentRequestsData().some(request =>
      request.user.id === userId && request.status === 'pending'
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}
