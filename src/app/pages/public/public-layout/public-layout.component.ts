import { Component } from '@angular/core';
import {NavbarComponent} from '../../../shared/ui/navbar/navbar.component';
import {FooterComponent} from '../../../shared/components/footer/footer.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet
  ],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent {

}
