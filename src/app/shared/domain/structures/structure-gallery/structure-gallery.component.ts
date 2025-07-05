import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-structure-gallery',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './structure-gallery.component.html',
  styleUrls: ['./structure-gallery.component.scss']
})
export class StructureGalleryComponent {
  @Input() galleryImages: string[] = [];
  @Input() structureName: string = '';

  // Track the currently selected image for the lightbox
  selectedImageIndex: number = 0;
  showLightbox: boolean = false;

  /**
   * Opens the lightbox with the selected image
   */
  openLightbox(index: number): void {
    this.selectedImageIndex = index;
    this.showLightbox = true;
  }

  /**
   * Closes the lightbox
   */
  closeLightbox(): void {
    this.showLightbox = false;
  }

  /**
   * Navigate to the next image in the lightbox
   */
  nextImage(): void {
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.galleryImages.length;
  }

  /**
   * Navigate to the previous image in the lightbox
   */
  prevImage(): void {
    this.selectedImageIndex = (this.selectedImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }
}
