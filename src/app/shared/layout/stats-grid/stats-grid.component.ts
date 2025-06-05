import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WidgetConfig} from '../../../core/models/stats/dependances/ui-components-config.model';

/**
 * Grille responsive pour organiser les widgets de statistiques
 */
@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid" [class]="gridClass">
      <div
        *ngFor="let widget of widgets; trackBy: trackByWidget"
        class="grid-item"
        [class]="getWidgetClass(widget)">
        <ng-content [ngTemplateOutlet]="getWidgetTemplate(widget)"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./stats-grid.component.scss']
})
export class StatsGridComponent {
  @Input() widgets: WidgetConfig[] = [];
  @Input() columns: number = 12;
  @Input() gap: string = '1.5rem';
  @Input() responsive: boolean = true;

  @Output() widgetAction = new EventEmitter<{ widgetId: string; actionId: string }>();

  get gridClass(): string {
    return `grid-cols-${this.columns} ${this.responsive ? 'responsive' : ''}`;
  }

  getWidgetClass(widget: WidgetConfig): string {
    const sizeClasses = {
      sm: 'col-span-3',
      md: 'col-span-4',
      lg: 'col-span-6',
      xl: 'col-span-8',
      full: 'col-span-12'
    };

    return `widget-${widget.type} ${sizeClasses[widget.size] || sizeClasses.md}`;
  }

  getWidgetTemplate(widget: WidgetConfig): any {
    // Cette méthode sera utilisée pour le templating dynamique
    return null;
  }

  trackByWidget(index: number, widget: WidgetConfig): string {
    return widget.id;
  }
}
