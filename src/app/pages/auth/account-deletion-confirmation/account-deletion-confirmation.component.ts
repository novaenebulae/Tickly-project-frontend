import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {UserService} from '../../../core/services/domain/user/user.service';
import {AuthService} from "../../../core/services/domain/user/auth.service";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

type DeletionStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-account-deletion-confirmation',
  templateUrl: './account-deletion-confirmation.component.html',
  styleUrls: ['./account-deletion-confirmation.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDeletionConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  public status = signal<DeletionStatus>('loading');
  public errorMessage = signal<string>('');

  ngOnInit(): void {
    // Déconnecter l'utilisateur au cas où il aurait une session active
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
    }

    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('error');
      this.errorMessage.set('Le lien de confirmation est invalide ou manquant.');
      return;
    }

    this.userService.confirmAccountDeletion(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('success');
          this.cdRef.markForCheck();
        },
        error: (err) => {
          this.status.set('error');
          const message = err?.error?.message || 'Une erreur est survenue.';
          this.errorMessage.set(`Impossible de supprimer le compte. ${message} Le lien a peut-être expiré.`);
          this.cdRef.markForCheck();
        }
      });
  }
}
