import {Component, inject, OnInit, viewChild} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common'; // Import nécessaire pour ngIf, ngFor etc.
import {MatIconModule} from '@angular/material/icon'; // Pour les icônes Material
import {MatMenu, MatMenuModule, MatMenuTrigger} from '@angular/material/menu'; // Si vous décidez d'utiliser MatMenu pour le dropdown utilisateur
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {
  EditProfileDialogComponent,
} from '../edit-profile-dialog/edit-profile-dialog.component';
import {ManageFriendsDialogComponent} from '../manage-friends-dialog/manage-friends-dialog.component';
import {AuthService} from '../../../core/services/auth.service'; // Pour les boutons Material

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenu,
    MatMenuModule,
    MatButtonModule // Décommentez si vous utilisez MatButton
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  // Vous pourriez ajouter des propriétés pour le nom de l'utilisateur, l'URL de l'avatar, etc.
  // si elles viennent de services ou d'inputs.
  userName: string = 'Lucas O.'; // Exemple
  userAvatarUrl: string = 'images/example_structure_logo.jpg'; // Exemple

  auth = inject(AuthService);

  // readonly menuTrigger = viewChild.required(MatMenuTrigger);

  readonly dialog = inject(MatDialog);

  openProfileDialog() {
    this.dialog.open(EditProfileDialogComponent, {restoreFocus: false});
  }

  openFriendsDialog() {
    this.dialog.open(ManageFriendsDialogComponent, {restoreFocus: false});
  }

  constructor() {
  }

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  // Méthodes pour la déconnexion, modification de profil, etc.
  logout(): void {
    this.auth.logout();
  }

  editProfile(): void {
    console.log('Modifier le profil');
    // Implémentez la navigation vers la page de profil
  }

  addFriend(): void {
    console.log('Ajouter un ami');
    // Implémentez la logique d'ajout d'ami
  }
}
