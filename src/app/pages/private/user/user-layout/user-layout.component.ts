import { Component, inject } from '@angular/core';
import { NavbarComponent } from "../../../../shared/ui/navbar/navbar.component";
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  imports: [NavbarComponent, NavbarComponent, RouterOutlet],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss'
})
export class UserLayoutComponent {

}
