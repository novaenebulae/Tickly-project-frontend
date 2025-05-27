import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FriendshipService} from '../../../../core/services/domain/user/friendship.service';
import { UserModel } from '../../../../core/models/user/user.model';
import { Observable, catchError, of } from 'rxjs';

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

  attendingFriends: UserModel[] = [];
  isLoading = false;
  hasError = false;

  constructor(private friendshipService: FriendshipService) {}

  ngOnInit(): void {
    if (this.eventId) {
      this.loadFriendsAttending();
    }
  }

  loadFriendsAttending(): void {
    this.isLoading = true;
    this.hasError = false;

    this.friendshipService.getFriendsAttendingEvent(this.eventId)
      .pipe(
        catchError(() => {
          this.hasError = true;
          return of([]);
        })
      )
      .subscribe(friends => {
        console.log('Friends attending:', friends);
        this.attendingFriends = friends;
        this.isLoading = false;
      });
  }
}
