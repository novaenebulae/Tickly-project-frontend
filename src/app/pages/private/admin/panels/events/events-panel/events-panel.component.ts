import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NotificationService } from '../../../../../../core/services/notification.service';

@Component({
  selector: 'app-events-panel',
  imports: [RouterOutlet],
  templateUrl: './events-panel.component.html',
  styleUrl: './events-panel.component.scss',
})
export class EventsPanelComponent {
  private router = inject(Router);
  private notification = inject(NotificationService);
}
