import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { effect, signal, computed } from '@angular/core';

// Services
import { AuthService } from '../../../core/services/domain/user/auth.service';
import { NotificationService } from '../../../core/services/domain/utilities/notification.service';
import { FriendshipService } from '../../../core/services/domain/user/friendship.service';
import { UserService } from '../../../core/services/domain/user.service';

// Modèles
import { UserModel } from '../../../core/models/user/user.model';
import { FriendRequestModel } from '../../../core/models/friendship/friendship.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // Injection des services
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private friendshipService = inject(FriendshipService);

  // Références aux éléments du DOM
  @ViewChild('navbarToggler') navbarToggler?: ElementRef;
  @ViewChild('userMenu', { read: MatMenuTrigger }) userMenuTrigger?: MatMenuTrigger;

  // Signaux
  private userProfileSig = signal<UserModel | null>(null);
  pendingFriendRequests = signal<number>(0);

  // États exposés du service d'authentification
  isLoggedIn = this.authService.isLoggedIn;
  currentUser = this.authService.currentUser;

  // Valeurs calculées
  userInitial = computed(() => {
    const profile = this.userProfileSig();
    return profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : '?';
  });

  fullName = computed(() => {
    const profile = this.userProfileSig();
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return 'Utilisateur';
  });

  userEmail = computed(() => {
    const profile = this.userProfileSig();
    return profile?.email || this.currentUser()?.sub || '';
  });

  constructor() {
    // Effet pour surveiller les changements d'état d'authentification
    effect(() => {
      if (this.isLoggedIn()) {
        this.loadUserProfile();
        this.loadPendingFriendRequests();
      } else {
        this.userProfileSig.set(null);
        this.pendingFriendRequests.set(0);
      }
    });
  }

  ngOnInit(): void {
    // Rien à faire ici, tout est géré par l'effet
  }

  // Ferme le menu burger si ouvert
  private closeNavbarCollapse(): void {
    // Vérifier si le menu est ouvert (a la classe show)
    const navbarCollapse = document.getElementById('navbarContent');
    if (navbarCollapse?.classList.contains('show')) {
      // Cliquer sur le bouton togglera (fermera) le menu
      this.navbarToggler?.nativeElement.click();
    }
  }

  // Charge le profil utilisateur
  private loadUserProfile(): void {
    const userId = this.currentUser()?.userId;
    if (userId) {
      this.userService.getUserProfile(userId).subscribe({
        next: (profile) => {
          this.userProfileSig.set(profile);
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil utilisateur', error);
          this.notification.displayNotification(
            'Impossible de charger votre profil',
            'error',
            'Fermer'
          );
        }
      });
    }
  }

  // Charge les demandes d'amitié en attente
  private loadPendingFriendRequests(): void {
    this.friendshipService.getPendingFriendRequests(true).subscribe({
      next: (requests: FriendRequestModel[]) => {
        this.pendingFriendRequests.set(requests.length);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des demandes d\'amitié', error);
        this.pendingFriendRequests.set(0);
      }
    });
  }

  // Ouvre le dialogue de modification de profil
  openProfileDialog(): void {
    // Fermer les menus et dialogues existants
    this.closeMenus();

    // Importation dynamique pour éviter les dépendances circulaires
    import('../dialogs/edit-profile-dialog/edit-profile-dialog.component').then(({ EditProfileDialogComponent }) => {
      this.dialog.open(EditProfileDialogComponent, {
        width: '500px',
        data: { user: this.userProfileSig() },
        restoreFocus: false,
        disableClose: false  // Permettre la fermeture en cliquant à l'extérieur
      }).afterClosed().subscribe(() => {
        // Recharger le profil après fermeture
        this.loadUserProfile();
      });
    });
  }

  // Ouvre le dialogue de gestion des amis
  openFriendsDialog(): void {
    // Fermer les menus et dialogues existants
    this.closeMenus();

    // Importation dynamique pour éviter les dépendances circulaires
    import('../dialogs/manage-friends-dialog/manage-friends-dialog.component').then(({ ManageFriendsDialogComponent }) => {
      this.dialog.open(ManageFriendsDialogComponent, {
        width: '600px',
        restoreFocus: false,
        disableClose: false  // Permettre la fermeture en cliquant à l'extérieur
      }).afterClosed().subscribe(() => {
        // Recharger les demandes d'amitié après fermeture
        this.loadPendingFriendRequests();
      });
    });
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    // Fermer les menus
    this.closeMenus();

    // Déconnexion via le service
    this.authService.logout();
  }

  // Ferme tous les menus ouverts
  private closeMenus(): void {
    // Fermer le menu burger
    this.closeNavbarCollapse();

    // Fermer le menu utilisateur si ouvert
    if (this.userMenuTrigger?.menuOpen) {
      this.userMenuTrigger.closeMenu();
    }

    // Fermer tous les dialogues ouverts
    this.closeDialogs();
  }

  /**
   * Ferme tous les dialogues ouverts
   * Cette méthode est publique pour être utilisée depuis le template
   */
  closeDialogs(): void {
    try {
      // Utiliser closeAll pour fermer tous les dialogues ouverts
      if (this.dialog) {
        const openDialogs = this.dialog.openDialogs;
        console.log(`Tentative de fermer ${openDialogs.length} dialogues ouverts`);

        // Utiliser directement closeAll qui est plus fiable
        this.dialog.closeAll();

        // Si besoin, on peut aussi les fermer un par un
        /*
        openDialogs.forEach(dialogRef => {
          dialogRef.close();
        });
        */
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture des dialogues', error);
    }
  }

  /**
   * Gère le clic sur le menu burger en fermant les dialogues
   * Implémentée pour s'assurer que les dialogues sont fermés avant bascule du menu
   */
  toggleNavbarAndCloseDialogs(): void {
    // S'assurer de fermer tous les dialogues avant la bascule du menu
    setTimeout(() => {
      this.closeDialogs();
    }, 0);
  }
}
