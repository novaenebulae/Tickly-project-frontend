import { Component, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { trigger, transition, animate, style } from '@angular/animations';

export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
};

@Component({
  selector: 'app-menu-item',
  imports: [MatListModule, RouterModule, MatIconModule],
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('500ms ease-in-out', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [
        animate('500ms ease-in-out', style({ opacity: 0, height: '0px' })),
      ]),
    ]),
  ],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
})
export class MenuItemComponent {
  item = input.required<MenuItem>();
  sideNavCollapsed = input(false);
  nestedMenuOpen = signal(false);

  toggleNestedMenu() {
    window.scroll({top: 0, left: 0, behavior: 'instant' });
    this.nestedMenuOpen.set(!this.nestedMenuOpen());
  }
}
