import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TeamApiService} from '../../../core/services/api/team/team-api.service';
import {AuthService} from '../../../core/services/domain/user/auth.service';
import {NotificationService} from '../../../core/services/domain/utilities/notification.service';
import {UserService} from '../../../core/services/domain/user/user.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-team-accept-invitation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="accept-invitation-container">
      <mat-card class="invitation-card">
        @if (isLoading()) {
          <mat-card-content>
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
              <h3>Traitement de votre invitation...</h3>
              <p>Veuillez patienter pendant que nous vérifions votre invitation.</p>
            </div>
          </mat-card-content>
        } @else if (invitationStatus() === 'success') {
          <mat-card-content>
            <div class="success-state">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h2>Invitation acceptée !</h2>
              <p>Félicitations ! Vous avez rejoint l'équipe avec succès.</p>
              <p class="small-text">Vous pouvez maintenant vous connecter avec votre compte existant.</p>
              <div class="actions">
                <button mat-raised-button color="primary" (click)="navigateToLogin()">
                  <mat-icon>login</mat-icon>
                  Se connecter
                </button>
                <button mat-button (click)="navigateToHome()">
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </mat-card-content>
        } @else if (invitationStatus() === 'already-accepted') {
          <mat-card-content>
            <div class="success-state">
              <mat-icon class="info-icon">info</mat-icon>
              <h2>Invitation déjà acceptée</h2>
              <p>Cette invitation a déjà été acceptée. Connectez-vous pour accéder à votre équipe.</p>
              <div class="actions">
                <button mat-raised-button color="primary" (click)="navigateToLogin()">
                  <mat-icon>login</mat-icon>
                  Se connecter
                </button>
                <button mat-button (click)="navigateToHome()">
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </mat-card-content>
        } @else {
          <mat-card-content>
            <div class="error-state">
              <mat-icon class="error-icon">error</mat-icon>
              <h2>Erreur</h2>
              <p>{{ errorMessage() }}</p>
              <div class="actions">
                <button mat-raised-button color="primary" (click)="retryAcceptance()">
                  <mat-icon>refresh</mat-icon>
                  Réessayer
                </button>
                <button mat-button (click)="navigateToHome()">
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </mat-card-content>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .accept-invitation-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 24px;
    }

    .invitation-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    .loading-state,
    .success-state,
    .error-state {
      padding: 32px 16px;
    }

    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .info-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #2196f3;
      margin-bottom: 16px;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    h2, h3 {
      margin: 16px 0;
      color: #333;
    }

    p {
      margin: 12px 0;
      color: #666;
      line-height: 1.5;
    }

    .small-text {
      font-size: 0.875rem;
      color: #999;
    }

    .actions {
      margin-top: 32px;
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .loading-state mat-spinner {
      margin: 0 auto 16px;
    }
  `]
})
export class TeamAcceptInvitationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamApiService = inject(TeamApiService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef)
  private cdRef = inject(ChangeDetectorRef);

  protected isLoading = signal(true);
  protected invitationStatus = signal<'success' | 'error' | 'already-accepted' | null>(null);
  protected errorMessage = signal('');

  private token: string | null = null;

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];

    if (!this.token) {
      this.handleError('Token d\'invitation manquant ou invalide.');
      return;
    }

    this.acceptInvitationDirectly();
  }

  /**
   * Accepte l'invitation directement sans vérifier l'authentification.
   * L'API accepte l'invitation en public, puis l'utilisateur se connecte normalement.
   */
  private acceptInvitationDirectly(): void {
    if (!this.token) return;

    this.teamApiService.acceptInvitation(this.token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        this.invitationStatus.set('success');
        this.notification.displayNotification(
          response.message || 'Invitation acceptée avec succès !',
          'valid'
        );
        console.log(`Invitation acceptée pour la structure: ${response.structureName}`);

        this.authService.updateTokenAndState(response.accessToken);
        this.userService.getCurrentUserProfile(true)
      },
      error: (error) => {
        // Vérifier si c'est une invitation déjà acceptée
        if (error.message?.includes('déjà acceptée') || error.status === 409) {
          this.invitationStatus.set('already-accepted');
          this.notification.displayNotification(
            'Cette invitation a déjà été acceptée.',
            'info'
          );
        } else {
          this.handleError(error.message || 'Erreur lors de l\'acceptation de l\'invitation.');
        }
        this.cdRef.markForCheck();
      },
      complete: () => {
        this.isLoading.set(false);
        this.cdRef.markForCheck();
      }
    });
  }

  private handleError(message: string): void {
    this.errorMessage.set(message);
    this.invitationStatus.set('error');
    this.isLoading.set(false);
  }

  protected retryAcceptance(): void {
    this.isLoading.set(true);
    this.invitationStatus.set(null);
    this.acceptInvitationDirectly();
  }

  protected navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  protected navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
