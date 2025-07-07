import {Component, DestroyRef, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {FriendshipService} from '../../../../core/services/domain/user/friendship.service';
import {catchError, of, Subject} from 'rxjs';
import {FriendParticipantDto} from '../../../../core/models/friendship/friend-participant.dto';
import {takeUntil} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-event-social-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './event-social-section.component.html',
  styleUrl: './event-social-section.component.scss'
})
export class EventSocialSectionComponent implements OnInit {
  @Input() eventId: number = 0;

  private destroyRef = inject(DestroyRef);
  private friendshipService = inject(FriendshipService)

  attendingFriends: FriendParticipantDto[] = [];
  isLoading = false;
  hasError = false;


  ngOnInit(): void {
    if (this.eventId) {
      this.loadFriendsAttending();
    }
  }

  loadFriendsAttending(): void {
    this.isLoading = true;
    this.hasError = false;

    this.friendshipService.getFriendsAttendingEvent(this.eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(
        catchError(() => {
          this.hasError = true;
          return of([]);
        })
      )
      .subscribe(friends => {
        this.attendingFriends = friends;
        this.isLoading = false;
      });
  }
}
