import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatCardModule} from '@angular/material/card';

// Services
import {FriendshipService} from '../../../../core/services/domain/user/friendship.service';

// Models
import {FriendModel} from '../../../../core/models/friendship/friend.model';
import {
  ReceivedFriendRequestModel,
  SentFriendRequestModel
} from '../../../../core/models/friendship/friend-request.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
export class ManageFriendsDialogComponent implements OnInit {
  // ✅ Injection moderne
  private dialogRef = inject(MatDialogRef<ManageFriendsDialogComponent>);
  private friendshipService = inject(FriendshipService);
  private fb = inject(FormBuilder);

  private destroyRef = inject(DestroyRef);

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

  ngOnInit(): void {
    this.initForms();
    this.loadInitialData();
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
   * Charge les données initiales au chargement du composant.
   */
  private loadInitialData(): void {
    // On utilise la nouvelle méthode unifiée. Le 'true' force le rechargement à chaque ouverture.
    this.friendshipService.loadFriendsData(true).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  /**
   * Retourne l'URL de l'avatar fourni ou une URL par défaut.
   * @param url - L'URL de l'avatar (optionnel).
   */
  getAvatarUrl(url?: string): string {
    return url || 'assets/images/avatars/avatar-placeholder.png'; // Assurez-vous d'avoir une image par défaut
  }


  sendFriendRequest(): void {
    if (this.addFriendForm.invalid) return;
    this.isSendingRequest.set(true);
    const email = this.addFriendForm.value.email;

    this.friendshipService.sendFriendRequestByEmail(email).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.addFriendForm.reset(),
      error: () => this.isSendingRequest.set(false),
      complete: () => this.isSendingRequest.set(false)
    });
  }

  removeFriend(friend: FriendModel): void {
    this.isPerformingAction.set(true);
    this.friendshipService.removeFriend(friend.friend.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: () => this.isPerformingAction.set(false),
      complete: () => this.isPerformingAction.set(false)
    });
  }

  cancelSentRequest(request: SentFriendRequestModel): void {
    this.isPerformingAction.set(true);
    this.friendshipService.cancelSentRequest(request.friendshipId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: () => this.isPerformingAction.set(false),
      complete: () => this.isPerformingAction.set(false)
    });
  }


  /**
   * Accepts a friend request.
   * @param request The received friend request to accept.
   */
  acceptRequest(request: ReceivedFriendRequestModel): void {
    this.isPerformingAction.set(true);
    this.friendshipService.acceptFriendRequest(request.friendshipId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isPerformingAction.set(false),
        error: () => this.isPerformingAction.set(false)
      });
  }

  /**
   * Rejects a friend request.
   * @param request The received friend request to reject.
   */
  rejectRequest(request: ReceivedFriendRequestModel): void {
    this.isPerformingAction.set(true);
    this.friendshipService.rejectFriendRequest(request.friendshipId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.isPerformingAction.set(false),
        error: () => this.isPerformingAction.set(false)
      });
  }

  /**
   * Ferme le dialogue
   */
  close(): void {
    this.dialogRef.close();
  }

}
