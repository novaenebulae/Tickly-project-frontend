import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgSwitch, NgSwitchCase} from '@angular/common';

import {UserService} from '../../../core/services/domain/user/user.service';
import {finalize} from 'rxjs/operators';
import {AuthService} from "../../../core/services/domain/user/auth.service";

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
  ]
})
export class AccountDeletionConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private authService = inject(AuthService);

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
      .subscribe({
        next: () => {
          this.status.set('success');
        },
        error: (err) => {
          this.status.set('error');
          const message = err?.error?.message || 'Une erreur est survenue.';
          this.errorMessage.set(`Impossible de supprimer le compte. ${message} Le lien a peut-être expiré.`);
        }
      });
  }
}
