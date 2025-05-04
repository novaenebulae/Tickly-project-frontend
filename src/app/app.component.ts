import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BrowserCloseService} from './core/services/browser-close.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'tickly-frontend';
  private browserCloseService = inject(BrowserCloseService);

  constructor() {
    this.browserCloseService.setNeedLogout(true);
  }
}
