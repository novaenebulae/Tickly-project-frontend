import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BrowserCloseService} from './core/services/domain/utilities/browser-close.service';
import {MainLayoutComponent} from './shared/layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'tickly-frontend';
  private browserCloseService = inject(BrowserCloseService);

  constructor() {
    this.browserCloseService.setPerformCleanupOnClose(true);
  }
}
