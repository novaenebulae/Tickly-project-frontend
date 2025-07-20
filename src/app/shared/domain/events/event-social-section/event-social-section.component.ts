/**
 * @file Composant de section sociale affichant les amis participant à un événement
 * @licence Proprietary
 * @author VotreNomOuEquipe
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FriendshipService} from '../../../../core/services/domain/user/friendship.service';
import {FriendParticipantDto} from '../../../../core/models/friendship/friend-participant.dto';


@Component({
  selector: 'app-event-social-section',
  standalone: true,
  imports: [CommonModule, MatIconModule, NgOptimizedImage],
  templateUrl: './event-social-section.component.html',
  styleUrls: ['./event-social-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventSocialSectionComponent implements OnInit {

  // Injection des dépendances
  private friendshipService = inject(FriendshipService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  // Input requis pour l'ID de l'événement
  @Input({ required: true }) eventId!: number;

  // Signals pour la gestion d'état
  private attendingFriendsSig: WritableSignal<FriendParticipantDto[]> = signal([]);
  private isLoadingSig: WritableSignal<boolean> = signal(false);
  private hasErrorSig: WritableSignal<boolean> = signal(false);

  // Signals computed en lecture seule pour le template
  public readonly attendingFriends = computed(() => this.attendingFriendsSig());
  public readonly isLoading = computed(() => this.isLoadingSig());
  public readonly hasError = computed(() => this.hasErrorSig());

  // Signal computed pour les statistiques
  public readonly attendanceStats = computed(() => {
    const friends = this.attendingFriendsSig();
    return {
      count: friends.length,
      label: friends.length > 1 ? 'amis participent' : 'ami participe'
    };
  });

  ngOnInit(): void {
    if (this.eventId) {
      this.loadFriendsAttending();
    }
  }

  /**
   * Charge la liste des amis participant à cet événement
   */
  loadFriendsAttending(): void {
    if (!this.eventId) {
      console.warn('EventSocialSectionComponent: eventId manquant');
      return;
    }

    // Mise à jour des états de chargement
    this.isLoadingSig.set(true);
    this.hasErrorSig.set(false);
    this.cdr.markForCheck();

    this.friendshipService.getFriendsAttendingEvent(this.eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (friends: FriendParticipantDto[]) => {
          // Mise à jour du signal avec les données reçues
          this.attendingFriendsSig.set(friends || []);
          this.isLoadingSig.set(false);
          this.hasErrorSig.set(false);

          // Déclenchement manuel de la détection de changements
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des amis participant à l\'événement:', error);

          // Mise à jour des états d'erreur
          this.attendingFriendsSig.set([]);
          this.isLoadingSig.set(false);
          this.hasErrorSig.set(true);

          // Déclenchement manuel de la détection de changements
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Méthode utilitaire pour obtenir les initiales d'un ami
   * @param friend - L'ami dont on veut les initiales
   * @returns Les initiales formatées
   */
  getFriendInitials(friend: FriendParticipantDto): string {
    const firstInitial = friend.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = friend.lastName?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial || '?';
  }

  /**
   * Méthode utilitaire pour obtenir le nom complet d'un ami
   * @param friend - L'ami dont on veut le nom complet
   * @returns Le nom complet formaté
   */
  getFriendFullName(friend: FriendParticipantDto): string {
    return `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || 'Utilisateur';
  }

  trackByFriendId(index: number, friend: FriendParticipantDto): number {
    return friend.userId || friend.userId || index;
  }

  /**
   * Méthode pour rafraîchir manuellement les données
   */
  refresh(): void {
    this.loadFriendsAttending();
  }
}
