import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';

import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap } from 'rxjs';

// Services
import { FriendshipService } from '../../../../core/services/domain/user/friendship.service';
import { UserService } from '../../../../core/services/domain/user/user.service';
import { NotificationService } from '../../../../core/services/domain/utilities/notification.service';

// Models
import { FriendModel } from '../../../../core/models/friendship/friend.model';
import { ReceivedFriendRequestModel, SentFriendRequestModel } from '../../../../core/models/friendship/friend-request.model';
import { UserModel } from '../../../../core/models/user/user.model';
import { FriendshipStatus } from '../../../../core/models/friendship/friendship-status.enum';

/**
 * Composant de dialogue pour gérer les amis et demandes d'amitié
 * Version entièrement refactorisée utilisant les signaux et la nouvelle architecture
 */
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
    MatTooltipModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatChipsModule,
    MatCardModule
  ],
  templateUrl: './manage-friends-dialog.component.html',
  styleUrls: ['./manage-friends-dialog.component.scss']
})
export class ManageFriendsDialogComponent implements OnInit, OnDestroy {
  // ✅ Injection moderne
  private dialogRef = inject(MatDialogRef<ManageFriendsDialogComponent>);
  private friendshipService = inject(FriendshipService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  private destroy$ = new Subject<void>();

  // ✅ États avec signaux
  isLoadingSearch = signal(false);
  isSendingRequest = signal(false);
  isPerformingAction = signal(false);

  // ✅ Accès direct aux signaux du service
  readonly friends = this.friendshipService.friends;
  readonly pendingRequests = this.friendshipService.pendingRequests;
  readonly sentRequests = this.friendshipService.sentRequests;
  readonly pendingRequestsCount = this.friendshipService.pendingRequestsCount;

  // ✅ Computed values pour l'UI
  readonly hasFriends = computed(() => this.friends().length > 0);
  readonly hasPendingRequests = computed(() => this.pendingRequests().length > 0);
  readonly hasSentRequests = computed(() => this.sentRequests().length > 0);

  // Formulaires
  addFriendForm!: FormGroup;
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.initForms();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialise les formulaires
   */
  private initForms(): void {
    this.addFriendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Charge les données initiales (déjà chargées par le service via effect)
   */
  private loadInitialData(): void {
    // Le service charge automatiquement les données via l'effect dans le constructor
    // On peut forcer un refresh si nécessaire
    this.friendshipService.loadInitialFriendshipData(true).subscribe();
  }

  /**
   * ✅ Envoie une demande d'ami par email
   */
  sendFriendRequestByEmail(): void {
    if (this.addFriendForm.invalid) {
      this.addFriendForm.markAllAsTouched();
      return;
    }

    const email = this.addFriendForm.get('email')?.value;
    this.isSendingRequest.set(true);

    this.friendshipService.sendFriendRequest(email).subscribe({
      next: (result) => {
        this.isSendingRequest.set(false);
        if (result) {
          this.addFriendForm.reset();
          this.searchControl.setValue('');
        }
      },
      error: () => {
        this.isSendingRequest.set(false);
      }
    });
  }


  /**
   * ✅ Accepte une demande d'ami
   */
  acceptFriendRequest(request: ReceivedFriendRequestModel): void {
    this.isPerformingAction.set(true);

    this.friendshipService.acceptFriendRequest(request.friendshipId).subscribe({
      next: () => {
        this.isPerformingAction.set(false);
      },
      error: () => {
        this.isPerformingAction.set(false);
      }
    });
  }

  /**
   * ✅ Rejette une demande d'ami
   */
  rejectFriendRequest(request: ReceivedFriendRequestModel): void {
    this.isPerformingAction.set(true);

    this.friendshipService.rejectFriendRequest(request.friendshipId).subscribe({
      next: () => {
        this.isPerformingAction.set(false);
      },
      error: () => {
        this.isPerformingAction.set(false);
      }
    });
  }

  /**
   * ✅ Supprime un ami (annule l'amitié)
   */
  removeFriend(friend: FriendModel): void {
    this.isPerformingAction.set(true);

    this.friendshipService.cancelFriendship(friend.friendshipId).subscribe({
      next: () => {
        this.isPerformingAction.set(false);
      },
      error: () => {
        this.isPerformingAction.set(false);
      }
    });
  }

  /**
   * ✅ Bloque un utilisateur
   */
  blockUser(friendshipId: number): void {
    this.isPerformingAction.set(true);

    this.friendshipService.blockUser(friendshipId).subscribe({
      next: () => {
        this.isPerformingAction.set(false);
      },
      error: () => {
        this.isPerformingAction.set(false);
      }
    });
  }

  /**
   * ✅ Vérifie si un utilisateur est déjà ami
   */
  isUserAlreadyFriend(userId: number): boolean {
    return this.friends().some(friend => friend.userId === userId);
  }

  /**
   * ✅ Vérifie si une demande d'ami est déjà envoyée à cet utilisateur
   */
  isRequestAlreadySent(userId: number): boolean {
    return this.sentRequests().some(request =>
      request.receiver.id === userId && request.status === FriendshipStatus.PENDING
    );
  }

  /**
   * ✅ Génère l'URL de l'avatar pour un utilisateur
   */
  getAvatarUrl(firstName?: string, lastName?: string): string {
    return this.userService.generateAvatarUrl(firstName, lastName, 40);
  }

  /**
   * ✅ Formate la date relative
   */
  getRelativeDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR');
  }

  /**
   * ✅ Obtient le libellé du statut
   */
  getStatusLabel(status: FriendshipStatus): string {
    switch (status) {
      case FriendshipStatus.PENDING: return 'En attente';
      case FriendshipStatus.ACCEPTED: return 'Accepté';
      case FriendshipStatus.REJECTED: return 'Rejeté';
      case FriendshipStatus.BLOCKED: return 'Bloqué';
      case FriendshipStatus.CANCELLED: return 'Annulé';
      default: return status;
    }
  }

  /**
   * ✅ Obtient la couleur du statut
   */
  getStatusColor(status: FriendshipStatus): string {
    switch (status) {
      case FriendshipStatus.PENDING: return 'orange';
      case FriendshipStatus.ACCEPTED: return 'green';
      case FriendshipStatus.REJECTED: return 'red';
      case FriendshipStatus.BLOCKED: return 'red';
      case FriendshipStatus.CANCELLED: return 'gray';
      default: return 'gray';
    }
  }

  /**
   * Ferme le dialogue
   */
  close(): void {
    this.dialogRef.close();
  }

  // Getters pour l'accès facile aux contrôles de formulaire
  get emailControl() { return this.addFriendForm.get('email'); }
}
