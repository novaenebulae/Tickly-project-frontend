import {Component, Inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

interface GalleryImage {
  url: string;
  alt: string;
  thumbnail?: string;
}

interface DialogData {
  images: GalleryImage[];
  startIndex: number;
}

@Component({
  selector: 'app-gallery-carousel-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './gallery-carousel-dialog.component.html',
  styleUrl: './gallery-carousel-dialog.component.scss'
})
export class GalleryCarouselDialogComponent implements OnInit {
  currentIndex = 0;
  images: GalleryImage[] = [];

  constructor(
    public dialogRef: MatDialogRef<GalleryCarouselDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.images = this.data.images;
    this.currentIndex = this.data.startIndex || 0;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  nextImage(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevImage(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  goToImage(index: number): void {
    this.currentIndex = index;
  }
}
