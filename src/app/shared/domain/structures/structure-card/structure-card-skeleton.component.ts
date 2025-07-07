import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-structure-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-skeleton">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line text"></div>
        <div class="skeleton-line text short"></div>
      </div>
      <div class="skeleton-footer">
        <div class="skeleton-button"></div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0% { background-position: -468px 0; }
      100% { background-position: 468px 0; }
    }

    .shimmer-animation {
      animation: shimmer 1.5s linear infinite;
      background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
      background-size: 800px 104px;
    }

    .card-skeleton {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      background-color: #ffffff;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .skeleton-image {
      height: 180px;
      background-color: #eee;
    }

    .skeleton-content {
      padding: 1rem;
      flex-grow: 1;
    }

    .skeleton-line {
      height: 1rem;
      margin-bottom: 0.75rem;
      border-radius: 4px;
      background-color: #eee;
    }

    .skeleton-line.title {
      height: 1.5rem;
      width: 60%;
      margin-bottom: 1rem;
    }

    .skeleton-line.text {
      width: 90%;
    }

    .skeleton-line.text.short {
      width: 70%;
    }

    .skeleton-footer {
        padding: 0 1rem 1rem;
    }

    .skeleton-button {
        height: 36px;
        width: 100px;
        border-radius: 4px;
        background-color: #eee;
    }

    /* Appliquer l'animation à tous les éléments squelettes */
    .skeleton-image, .skeleton-line, .skeleton-button {
      animation: shimmer 1.5s linear infinite;
      background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
      background-size: 1000px 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StructureCardSkeletonComponent {}
