import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {GalleryCarouselDialogComponent} from '../gallery-carousel-dialog/gallery-carousel-dialog.component';


@Component({
  selector: 'app-event-gallery-section',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './event-gallery-section.component.html',
  styleUrl: './event-gallery-section.component.scss'
})
export class EventGallerySectionComponent {
  @Input() images: string[] = [];

  constructor(private dialog: MatDialog) {}

  openGallery(startIndex: number = 0): void {
    if (this.images.length === 0) return;

    this.dialog.open(GalleryCarouselDialogComponent, {
      width: '100%',
      maxWidth: '1200px',
      height: 'auto',
      panelClass: 'gallery-dialog',
      data: {
        images: this.images,
        startIndex: startIndex
      }
    });
  }
}
