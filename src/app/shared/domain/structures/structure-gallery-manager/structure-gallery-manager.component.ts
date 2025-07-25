import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  Inject,
  inject,
  signal
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {finalize} from 'rxjs/operators';

import {StructureModel} from '../../../../core/models/structure/structure.model';
import {UserStructureService} from '../../../../core/services/domain/user-structure/user-structure.service';
import {NotificationService} from '../../../../core/services/domain/utilities/notification.service';
import {FileUploadResponseDto} from '../../../../core/models/files/file-upload-response.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

interface GalleryDialogData {
  structure: StructureModel;
}

@Component({
  selector: 'app-structure-gallery-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gallery-manager">
      <h2 mat-dialog-title>
        <mat-icon>photo_library</mat-icon>
        Galerie de {{ data.structure.name }}
      </h2>

      <mat-dialog-content class="gallery-content">
        <!-- Upload zone -->
        <div class="upload-zone">
          <input
            type="file"
            #fileInput
            (change)="onFilesSelected($event)"
            accept="image/*"
            multiple
            style="display: none;">

          <button
            mat-raised-button
            color="primary"
            (click)="fileInput.click()"
            [disabled]="isUploading()">
            <mat-icon>add_photo_alternate</mat-icon>
            Ajouter des images
          </button>

          <div *ngIf="selectedFiles().length > 0" class="selected-files">
            <p>{{ selectedFiles().length }} fichier(s) sélectionné(s)</p>
            <button
              mat-raised-button
              color="accent"
              (click)="uploadFiles()"
              [disabled]="isUploading()">
              <mat-progress-spinner *ngIf="isUploading()" diameter="20"></mat-progress-spinner>
              <mat-icon *ngIf="!isUploading()">cloud_upload</mat-icon>
              {{ isUploading() ? 'Upload en cours...' : 'Uploader' }}
            </button>
          </div>
        </div>

        <!-- Galerie existante -->
        <div class="gallery-grid" *ngIf="galleryImages().length > 0">
          <div
            *ngFor="let image of galleryImages(); trackBy: trackByImage"
            class="gallery-item">
            <img [src]="image" [alt]="'Image galerie'" class="gallery-image">
            <div class="image-overlay">
              <button
                mat-icon-button
                color="warn"
                (click)="deleteImage(image)"
                [disabled]="isDeleting()"
                matTooltip="Supprimer cette image">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="galleryImages().length === 0" class="empty-gallery">
          <mat-icon class="empty-icon">photo_library</mat-icon>
          <p>Aucune image dans la galerie</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Fermer</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .gallery-manager {
      min-width: 600px;
      max-width: 800px;
    }

    .gallery-content {
      min-height: 400px;
      max-height: 600px;
      overflow-y: auto;
    }

    .upload-zone {
      padding: var(--spacing-lg);
      border: 2px dashed var(--border);
      border-radius: var(--border-radius-medium);
      text-align: center;
      margin-bottom: var(--spacing-lg);
    }

    .selected-files {
      margin-top: var(--spacing-md);
      padding: var(--spacing-sm);
      background-color: var(--background);
      border-radius: var(--border-radius-small);
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--spacing-md);
      padding: var(--spacing-lg) 0;
    }

    .gallery-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--border-radius-medium);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: var(--transition-fast);
    }

    .gallery-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .gallery-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: var(--transition-medium);
    }

    .gallery-item:hover .gallery-image {
      transform: scale(1.05);
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: var(--transition-fast);
    }

    .gallery-item:hover .image-overlay {
      opacity: 1;
    }

    .empty-gallery {
      text-align: center;
      padding: var(--spacing-xxl);
      color: var(--text-secondary);
    }

    .empty-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      opacity: 0.7;
      margin-bottom: var(--spacing-md);
      color: var(--text-secondary);
    }
  `]
})
export class StructureGalleryManagerComponent {
  private userStructureService = inject(UserStructureService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  // Signals pour l'état
  private selectedFilesSig = signal<File[]>([]);
  private galleryImagesSig = signal<string[]>([]);
  private isUploadingSig = signal(false);
  private isDeletingSig = signal(false);

  public readonly selectedFiles = computed(() => this.selectedFilesSig());
  public readonly galleryImages = computed(() => this.galleryImagesSig());
  public readonly isUploading = computed(() => this.isUploadingSig());
  public readonly isDeleting = computed(() => this.isDeletingSig());

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GalleryDialogData,
    private dialogRef: MatDialogRef<StructureGalleryManagerComponent>
  ) {
    // Initialiser avec les images existantes de la galerie
    this.galleryImagesSig.set(this.data.structure.galleryImageUrls || []);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      // Vérifier la taille totale (max 50MB comme dans le formulaire)
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const maxSizeInBytes = 50 * 1024 * 1024; // 50MB

      if (totalSize > maxSizeInBytes) {
        this.notificationService.displayNotification(
          'La taille totale des fichiers dépasse 50MB. Veuillez sélectionner moins de fichiers.',
          'error'
        );
        // Réinitialiser l'input
        input.value = '';
        return;
      }

      this.selectedFilesSig.set(files);
    }
  }

  uploadFiles(): void {
    const files = this.selectedFiles();
    if (files.length === 0) return;

    this.isUploadingSig.set(true);

    // ✅ CORRECTION : Utiliser uploadMultipleGalleryImages au lieu de forkJoin
    this.userStructureService.uploadMultipleGalleryImages(this.data.structure.id!, files).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.isUploadingSig.set(false);
        this.selectedFilesSig.set([]);
        // Réinitialiser l'input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      })
    ).subscribe({
      next: (responses: FileUploadResponseDto[]) => {
        // Ajouter les nouvelles URLs à la galerie
        const newUrls = responses.map(response => response.fileUrl);
        const currentImages = this.galleryImages();
        this.galleryImagesSig.set([...currentImages, ...newUrls]);

        this.notificationService.displayNotification(
          `${newUrls.length} image(s) ajoutée(s) à la galerie avec succès`,
          'valid'
        );
        this.cdRef.markForCheck();
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
   * Extrait le nom de fichier depuis une URL complète
   * @param imageUrl URL complète de l'image
   * @returns Le nom du fichier uniquement
   */
  private extractFileNameFromUrl(imageUrl: string): string {
    try {
      // Extraire le nom de fichier depuis l'URL
      const url = new URL(imageUrl);
      const pathname = url.pathname;
      const fileName = pathname.substring(pathname.lastIndexOf('/') + 1);
      return fileName;
    } catch (error) {
      // Si l'URL n'est pas valide, essayer une extraction simple
      console.warn('Erreur lors de l\'extraction du nom de fichier:', error);
      const parts = imageUrl.split('/');
      return parts[parts.length - 1] || imageUrl;
    }
  }

  deleteImage(imageUrl: string): void {
    this.isDeletingSig.set(true);

    // Extraire le nom de fichier depuis l'URL complète
    const imagePath = this.extractFileNameFromUrl(imageUrl);

    this.userStructureService.deleteGalleryImage(this.data.structure.id!, imagePath).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.isDeletingSig.set(false);
      })
    ).subscribe({
      next: () => {
        // Retirer l'image de la liste
        const currentImages = this.galleryImages();
        const updatedImages = currentImages.filter(url => url !== imageUrl);
        this.galleryImagesSig.set(updatedImages);

        this.notificationService.displayNotification(
          'Image supprimée de la galerie',
          'valid'
        );
        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.notificationService.displayNotification(
          'Erreur lors de la suppression de l\'image',
          'error'
        );
      }
    });
  }

  trackByImage(index: number, item: string): string {
    return item;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
