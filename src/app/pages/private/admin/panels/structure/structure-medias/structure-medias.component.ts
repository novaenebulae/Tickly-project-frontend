import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { StructureService } from '../../../../../../core/services/domain/structure/structure.service';
import { UserStructureService } from '../../../../../../core/services/domain/user-structure/user-structure.service';
import { NotificationService } from '../../../../../../core/services/domain/utilities/notification.service';
import { AuthService } from '../../../../../../core/services/domain/user/auth.service'; // 🔥 AJOUT
import { UserRole } from '../../../../../../core/models/user/user-role.enum'; // 🔥 AJOUT
import {
  StructureGalleryManagerComponent
} from '../../../../../../shared/domain/structures/structure-gallery-manager/structure-gallery-manager.component';
import {FileUploadResponseDto} from '../../../../../../core/models/files/file-upload-response.model';

@Component({
  selector: 'app-structure-medias',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './structure-medias.component.html',
  styleUrl: './structure-medias.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureMediasComponent implements OnInit {

  private structureService = inject(StructureService);
  private userStructureService = inject(UserStructureService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService); // 🔥 AJOUT
  private dialog = inject(MatDialog);
  private cdRef = inject(ChangeDetectorRef);
  private location = inject(Location);

  // --- Signals pour la gestion d'état ---
  private isLoadingSig = signal(false);
  private errorLoadingSig = signal<string | null>(null);

  // Computed signals pour l'interface
  public readonly isLoading = computed(() => this.isLoadingSig());
  public readonly errorLoading = computed(() => this.errorLoadingSig());

  // Signal pour la structure courante
  public readonly currentStructure = this.userStructureService.userStructure;

  // 🔥 AJOUT : Computed signal pour déterminer si l'utilisateur est en mode readonly
  public readonly isReadonly = computed(() => {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === UserRole.ORGANIZATION_SERVICE ||
      currentUser?.role === UserRole.RESERVATION_SERVICE;
  });


  // Gestion des fichiers et aperçus
  logoPreviewUrl: string | null = null;
  coverPreviewUrl: string | null = null;
  selectedLogoFile: File | null = null;
  selectedCoverFile: File | null = null;
  selectedGalleryFiles: File[] = [];

  // Signals pour les états d'upload
  isUploadingLogo = signal(false);
  isUploadingCover = signal(false);
  isUploadingGallery = signal(false);

  ngOnInit(): void {
    this.loadInitialData();
  }

  // --- Chargement des données initiales ---
  protected loadInitialData(): void {
    this.isLoadingSig.set(true);
    this.errorLoadingSig.set(null);

    // Récupérer la structure utilisateur depuis le signal
    const userStructure = this.currentStructure();

    if (userStructure) {
      this.setupImagePreviews();
      this.isLoadingSig.set(false);
      this.cdRef.markForCheck();
    } else if (userStructure === null) {
      this.errorLoadingSig.set('Aucune structure associée à votre compte.');
      this.isLoadingSig.set(false);
      this.cdRef.markForCheck();
    } else {
      // userStructure === undefined, donc en cours de chargement
      // Attendre un peu et vérifier à nouveau
      setTimeout(() => {
        const structure = this.currentStructure();
        if (structure) {
          this.setupImagePreviews();
        } else if (structure === null) {
          this.errorLoadingSig.set('Aucune structure associée à votre compte.');
        }
        this.isLoadingSig.set(false);
        this.cdRef.markForCheck();
      }, 1000);
    }
  }

  // --- Navigation ---
  goBack(): void {
    this.location.back();
  }

  // --- Configuration des aperçus d'images ---
  private setupImagePreviews(): void {
    const structure = this.currentStructure();
    if (structure) {
      this.logoPreviewUrl = structure.logoUrl || null;
      this.coverPreviewUrl = structure.coverUrl || null;
    }
  }

  // --- Gestion du logo ---

  /**
   * Gestionnaire pour la sélection du logo
   */
  onLogoSelected(event: Event): void {
    // 🔥 AJOUT : Vérification des droits
    if (this.isReadonly()) {
      this.notificationService.displayNotification('Vous n\'avez pas les droits nécessaires pour modifier les médias de la structure.', 'error');
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedLogoFile = file;

      // Créer une preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreviewUrl = e.target?.result as string;
        this.cdRef.markForCheck();
      };
      reader.readAsDataURL(file);

      // Upload immédiat du logo
      this.uploadLogo();
    }
  }

  /**
   * Upload du logo vers /api/v1/structures/{structureId}/logo
   */
  private uploadLogo(): void {
    const currentStructure = this.currentStructure();
    if (!this.selectedLogoFile || !currentStructure?.id) return;

    this.isUploadingLogo.set(true);

    this.userStructureService.uploadStructureImage(currentStructure.id, this.selectedLogoFile, 'logo').pipe(
      finalize(() => {
        this.isUploadingLogo.set(false);
        this.cdRef.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        this.notificationService.displayNotification('Logo mis à jour avec succès', 'valid');
        this.selectedLogoFile = null;
        // Mettre à jour la preview avec l'URL retournée par l'API
        this.logoPreviewUrl = response.fileUrl;
        // Recharger la structure pour avoir les données à jour
        this.userStructureService.refreshUserStructure().subscribe();
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload du logo:', error);
        this.notificationService.displayNotification('Erreur lors de l\'upload du logo', 'error');
        // Restaurer l'ancienne preview
        this.setupImagePreviews();
        this.cdRef.markForCheck();
      }
    });
  }

  /**
   * Suppression du logo
   */
  deleteLogo(): void {
    // 🔥 AJOUT : Vérification des droits
    if (this.isReadonly()) {
      this.notificationService.displayNotification('Vous n\'avez pas les droits nécessaires pour supprimer les médias de la structure.', 'error');
      return;
    }

    const currentStructure = this.currentStructure();
    if (!currentStructure?.id) return;

    this.isUploadingLogo.set(true);

    this.userStructureService.deleteStructureImage(currentStructure.id, 'logo').pipe(
      finalize(() => {
        this.isUploadingLogo.set(false);
        this.cdRef.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.notificationService.displayNotification('Logo supprimé avec succès', 'valid');
        this.logoPreviewUrl = null;
        // Recharger la structure pour avoir les données à jour
        this.userStructureService.refreshUserStructure().subscribe();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du logo:', error);
        this.notificationService.displayNotification('Erreur lors de la suppression du logo', 'error');
      }
    });
  }

  // --- Gestion de la couverture ---

  /**
   * Gestionnaire pour la sélection de la couverture
   */
  onCoverSelected(event: Event): void {
    // 🔥 AJOUT : Vérification des droits
    if (this.isReadonly()) {
      this.notificationService.displayNotification('Vous n\'avez pas les droits nécessaires pour modifier les médias de la structure.', 'error');
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedCoverFile = file;

      // Créer une preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.coverPreviewUrl = e.target?.result as string;
        this.cdRef.markForCheck();
      };
      reader.readAsDataURL(file);

      // Upload immédiat de la couverture
      this.uploadCover();
    }
  }

  /**
   * Upload de la couverture vers /api/v1/structures/{structureId}/cover
   */
  private uploadCover(): void {
    const currentStructure = this.currentStructure();
    if (!this.selectedCoverFile || !currentStructure?.id) return;

    this.isUploadingCover.set(true);

    this.userStructureService.uploadStructureImage(currentStructure.id, this.selectedCoverFile, 'cover').pipe(
      finalize(() => {
        this.isUploadingCover.set(false);
        this.cdRef.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        this.notificationService.displayNotification('Couverture mise à jour avec succès', 'valid');
        this.selectedCoverFile = null;
        // Mettre à jour la preview avec l'URL retournée par l'API
        this.coverPreviewUrl = response.fileUrl;
        // Recharger la structure pour avoir les données à jour
        this.userStructureService.refreshUserStructure().subscribe();
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload de la couverture:', error);
        this.notificationService.displayNotification('Erreur lors de l\'upload de la couverture', 'error');
        // Restaurer l'ancienne preview
        this.setupImagePreviews();
        this.cdRef.markForCheck();
      }
    });
  }

  /**
   * Suppression de la couverture
   */
  deleteCover(): void {
    // 🔥 AJOUT : Vérification des droits
    if (this.isReadonly()) {
      this.notificationService.displayNotification('Vous n\'avez pas les droits nécessaires pour supprimer les médias de la structure.', 'error');
      return;
    }

    const currentStructure = this.currentStructure();
    if (!currentStructure?.id) return;

    this.isUploadingCover.set(true);

    this.userStructureService.deleteStructureImage(currentStructure.id, 'cover').pipe(
      finalize(() => {
        this.isUploadingCover.set(false);
        this.cdRef.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.notificationService.displayNotification('Couverture supprimée avec succès', 'valid');
        this.coverPreviewUrl = null;
        // Recharger la structure pour avoir les données à jour
        this.userStructureService.refreshUserStructure().subscribe();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la couverture:', error);
        this.notificationService.displayNotification('Erreur lors de la suppression de la couverture', 'error');
      }
    });
  }

  // --- Gestion de la galerie ---

  /**
   * Gestionnaire pour la sélection de plusieurs images de galerie
   */
  onGallerySelected(event: Event): void {
    // 🔥 AJOUT : Vérification des droits
    if (this.isReadonly()) {
      this.notificationService.displayNotification('Vous n\'avez pas les droits nécessaires pour modifier les médias de la structure.', 'error');
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedGalleryFiles = Array.from(input.files);

      // Vérifier la taille totale (max 50MB)
      const totalSize = this.selectedGalleryFiles.reduce((sum, file) => sum + file.size, 0);
      const maxSizeInBytes = 50 * 1024 * 1024; // 50MB

      if (totalSize > maxSizeInBytes) {
        this.notificationService.displayNotification(
          'La taille totale des fichiers dépasse 50MB. Veuillez sélectionner moins de fichiers.',
          'error'
        );
        this.selectedGalleryFiles = [];
        input.value = '';
        return;
      }

      // Upload immédiat des images de galerie
      this.uploadGalleryImages();
    }
  }

  /**
   * Upload des images de galerie vers /api/v1/structures/{structureId}/gallery/multiple
   */
  private uploadGalleryImages(): void {
    const currentStructure = this.currentStructure();
    if (this.selectedGalleryFiles.length === 0 || !currentStructure?.id) return;

    this.isUploadingGallery.set(true);

    this.userStructureService.uploadMultipleGalleryImages(currentStructure.id, this.selectedGalleryFiles).pipe(
      finalize(() => {
        this.isUploadingGallery.set(false);
        this.selectedGalleryFiles = [];
        // Réinitialiser l'input file
        const fileInput = document.querySelector('input[type="file"][accept="image/*"][multiple]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        this.cdRef.markForCheck();
      })
    ).subscribe({
      next: (responses: FileUploadResponseDto[]) => {
        this.notificationService.displayNotification(
          `${responses.length} image(s) ajoutée(s) à la galerie avec succès`,
          'valid'
        );
        // Recharger la structure pour avoir les données à jour
        this.userStructureService.refreshUserStructure().subscribe();
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload des images de galerie:', error);
        this.notificationService.displayNotification(
          'Erreur lors de l\'upload des images de galerie',
          'error'
        );
      }
    });
  }

  /**
   * Ouverture du gestionnaire de galerie
   */
  openGalleryManager(): void {
    // 🔥 AJOUT : Vérification des droits pour l'ouverture en readonly
    const currentStructure = this.currentStructure();
    if (!currentStructure) return;

    const dialogRef = this.dialog.open(StructureGalleryManagerComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        structure: currentStructure,
        readonly: this.isReadonly() // 🔥 Passer le mode readonly au dialog
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Optionnel: rafraîchir les données après fermeture
      this.userStructureService.refreshUserStructure().subscribe();
    });
  }

  /**
   * TrackBy function pour la ngFor de la galerie
   */
  trackByImageUrl(index: number, imageUrl: string): string {
    return imageUrl;
  }
}
