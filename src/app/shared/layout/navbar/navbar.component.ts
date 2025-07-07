import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatBadgeModule} from '@angular/material/badge';
import {MatDialog} from '@angular/material/dialog';
import {Subject, takeUntil} from 'rxjs';
import {UserRole} from '../../../core/models/user/user-role.enum';

// Services
import {AuthService} from '../../../core/services/domain/user/auth.service';
import {UserService} from '../../../core/services/domain/user/user.service';
import {FriendshipService} from '../../../core/services/domain/user/friendship.service';
import {NotificationService} from '../../../core/services/domain/utilities/notification.service';

// Models
import {ALLOWED_TEAM_ROLES} from '../../../core/models/user/team-member.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Composant Navbar modernisé utilisant les signaux et la nouvelle architecture
 * Gère l'authentification, le profil utilisateur et les notifications d'amitié
 */
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
    MatDividerModule,
    MatBadgeModule,
    NgOptimizedImage
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  // Injection moderne des services
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private friendshipService = inject(FriendshipService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private router = inject(Router);

  private destroyRef = inject(DestroyRef);

  // Références DOM
  @ViewChild('navbarToggler') navbarToggler?: ElementRef;
  @ViewChild('userMenu', { read: MatMenuTrigger }) userMenuTrigger?: MatMenuTrigger;

  // Signaux locaux pour l'état du composant
  private isMenuCollapsed = signal(true);
  protected isUserMenuOpen = signal(false);

  // Accès direct aux signaux des services
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;
  readonly currentUserProfile = this.userService.currentUserProfileData;
  readonly pendingRequestsCount = this.friendshipService.pendingRequestsCount;


  // Computed values pour l'interface utilisateur
  readonly userInitial = computed(() => {
    const profile = this.currentUserProfile();
    if (profile?.firstName && profile?.lastName) {
      return profile.firstName.charAt(0).toUpperCase() + profile.lastName.charAt(0).toUpperCase();
    }
    if (profile?.firstName) {
      return profile.firstName.charAt(0).toUpperCase();
    }
    const user = this.currentUser();
    if (user?.sub) {
      return user.sub.charAt(0).toUpperCase();
    }
    return '?';
  });

  readonly fullName = computed(() => {
    const profile = this.currentUserProfile();
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    const user = this.currentUser();
    return user?.sub || 'Utilisateur';
  });

  readonly userEmail = computed(() => {
    const profile = this.currentUserProfile();
    if (profile?.email) {
      return profile.email;
    }
    const user = this.currentUser();
    return user?.sub || '';
  });

  readonly userAvatarUrl = computed(() => {
    const profile = this.currentUserProfile();

    if (profile?.avatarUrl) {
      return profile.avatarUrl;
    }

    // Générer un avatar par défaut avec les initiales
    return ''
  });

  readonly hasNotifications = computed(() => {
    const count = this.pendingRequestsCount();
    return count > 0;
  });

  constructor() {
    // Effect pour gérer les changements d'état d'authentification
    effect(() => {
      const isLoggedIn = this.isLoggedIn();

      if (!isLoggedIn) {
        // L'utilisateur est déconnecté - nettoyer l'état local
        this.isMenuCollapsed.set(true);
        this.isUserMenuOpen.set(false);
      }
    });
  }

  ngOnInit(): void {
    // Tout est géré par les effects et les signaux
  }


  // === GESTION DES MENUS ===

  /**
   * Bascule l'état du menu burger
   */
  toggleNavbarMenu(): void {
    this.closeDialogs();
    this.isMenuCollapsed.update(collapsed => !collapsed);
  }

  /**
   * Ferme le menu burger
   */
  private closeNavbarCollapse(): void {
    const navbarCollapse = document.getElementById('navbarContent');
    if (navbarCollapse?.classList.contains('show')) {
      this.navbarToggler?.nativeElement.click();
    }
    this.isMenuCollapsed.set(true);
  }

  /**
   * Ferme tous les menus
   */
  private closeMenus(): void {
    this.closeNavbarCollapse();

    if (this.userMenuTrigger?.menuOpen) {
      this.userMenuTrigger.closeMenu();
    }

    this.isUserMenuOpen.set(false);
    this.closeDialogs();
  }

  /**
   * Gère l'ouverture du menu utilisateur
   */
  onUserMenuOpened(): void {
    this.isUserMenuOpen.set(true);
  }

  /**
   * Gère la fermeture du menu utilisateur
   */
  onUserMenuClosed(): void {
    this.isUserMenuOpen.set(false);
  }

  // === GESTION DES DIALOGUES ===

  /**
   * Ouvre le dialogue de modification de profil avec configuration optimisée
   */
  openProfileDialog(): void {
    this.closeMenus();

    import('../../ui/dialogs/edit-profile-dialog/edit-profile-dialog.component')
      .then(({ EditProfileDialogComponent }) => {
        this.dialog.open(EditProfileDialogComponent, {
          width: '500px',
          maxWidth: '95vw',
          // Dimensions adaptatives au contenu
          minHeight: '350px',
          maxHeight: '80vh',
          restoreFocus: false,
          disableClose: false,
          hasBackdrop: true,
          // Classes spécifiques pour le style
          backdropClass: 'profile-dialog-backdrop',
          panelClass: ['profile-dialog-panel', 'dialog-panel-high-z'],
          autoFocus: true,
          closeOnNavigation: true,
          data: { user: this.currentUserProfile() }
        }).afterClosed().pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
          // Les services se mettent à jour automatiquement via les signaux
        });
      })
      .catch(error => {
        console.error('Erreur lors du chargement du dialogue de profil:', error);
        this.notification.displayNotification(
          'Impossible d\'ouvrir le dialogue de modification de profil',
          'error'
        );
      });
  }

  /**
   * Ouvre le dialogue de gestion des amis avec z-index approprié
   */
  openFriendsDialog(): void {
    this.closeMenus();

    import('../../ui/dialogs/manage-friends-dialog/manage-friends-dialog.component')
      .then(({ ManageFriendsDialogComponent }) => {
        this.dialog.open(ManageFriendsDialogComponent, {
          width: '800px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          restoreFocus: false,
          disableClose: false,
          hasBackdrop: true,
          // Configuration spécifique pour le z-index
          backdropClass: 'friends-dialog-backdrop',
          panelClass: ['friends-dialog-panel', 'dialog-panel-high-z'],
          autoFocus: true,
          closeOnNavigation: true
        }).afterClosed().pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
          // Les services se mettent à jour automatiquement via les signaux
        });
      })
      .catch(error => {
        console.error('Erreur lors du chargement du dialogue d\'amis:', error);
        this.notification.displayNotification(
          'Impossible d\'ouvrir le dialogue de gestion des amis',
          'error'
        );
      });
  }

  /**
   * Ferme tous les dialogues ouverts
   */
  closeDialogs(): void {
    try {
      const openDialogs = this.dialog.openDialogs;
      if (openDialogs.length > 0) {
        this.dialog.closeAll();
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture des dialogues:', error);
    }
  }

  // === ACTIONS UTILISATEUR ===

  /**
   * Navigue vers le dashboard utilisateur
   */
  navigateToUserTickets(): void {
    this.closeMenus();
    this.router.navigate(['/user/tickets']);
  }

  navigateToUserFavoritesStructures(): void {
    this.closeMenus();
    this.router.navigate(['/user/favorites']);
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    this.closeMenus();
    this.authService.logout();
  }

  /**
   * Navigue vers une route et ferme les menus
   */
  navigateAndCloseMenus(route?: string): void {
    this.closeMenus();
    // La navigation se fait via le routerLink dans le template
  }

  // === UTILITAIRES ===

  /**
   * Génère l'URL de l'avatar
   */
  getAvatarUrl(): string {
    return this.userAvatarUrl();
  }

  /**
   * Obtient le texte du badge de notifications
   */
  getNotificationBadgeText(): string {
    const count = this.pendingRequestsCount();
    if (count === 0) return '';
    return count > 99 ? '99+' : count.toString();
  }

  /**
   * Vérifie si l'utilisateur a un avatar personnalisé
   */
  hasCustomAvatar(): boolean {
    const profile = this.currentUserProfile();
    return !!(profile?.avatarUrl && profile.avatarUrl.trim());
  }

  protected readonly UserRole = UserRole;
  protected readonly ALLOWED_TEAM_ROLES = ALLOWED_TEAM_ROLES;
}
