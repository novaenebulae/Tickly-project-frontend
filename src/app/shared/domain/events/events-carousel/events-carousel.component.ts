import {AfterViewInit, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {EventCardComponent} from '../event-card-item/event-card.component';
import {MatButtonModule} from '@angular/material/button';
import {EventSummaryModel} from '../../../../core/models/event/event.model';

// Les imports pour MatIconModule etc. sont dans le décorateur @Component pour les composants standalone

@Component({
  selector: 'app-events-carousel',
  templateUrl: './events-carousel.component.html',
  styleUrls: ['./events-carousel.component.scss'],
  // Les imports pour les composants standalone sont gérés dans la métadonnée du composant
  imports: [ CommonModule, MatIconModule, EventCardComponent, MatButtonModule ], // CommonModule pour @for
})
export class EventsCarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() events: EventSummaryModel[] = [];
  @Input() showControls = true;
  @Input() autoSlide = true;
  @Input() slideInterval = 5000;
  @Input() cardsPerPage = 3; // Nombre de cartes à afficher par "page"

  @ViewChild('carouselSlides') carouselSlidesElement!: ElementRef<HTMLElement>;

  eventsDisplayed: EventSummaryModel[] = [];

  currentPage = 0;
  totalPages = 0;

  private autoSlideSubscription: Subscription | undefined;

  // Lie la variable CSS au composant pour l'utiliser dans le SCSS
  @HostBinding('style.--cards-per-page')
  get cssCardsPerPage(): number {
    return this.cardsPerPage;
  }

  ngOnInit(): void {
    this.eventsDisplayed = this.events.length > 9 ? this.events.slice(0, 9) : this.events;
    this.calculateTotalPages();
    if (this.autoSlide && this.totalPages > 1) {
      this.startAutoSlide();
    }
  }

  ngAfterViewInit(): void {
    this.updateSlidePosition();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  private calculateTotalPages(): void {
    if (this.eventsDisplayed.length > 0 && this.cardsPerPage > 0) {
      this.totalPages = Math.ceil(this.eventsDisplayed.length / this.cardsPerPage);
    } else {
      this.totalPages = 0;
    }
  }

  startAutoSlide(): void {
    this.stopAutoSlide(); // S'assurer qu'il n'y a pas de souscription existante
    if (this.totalPages > 1) {
      this.autoSlideSubscription = interval(this.slideInterval).subscribe(() => {
        this.nextPage();
      });
    }
  }

  stopAutoSlide(): void {
    if (this.autoSlideSubscription) {
      this.autoSlideSubscription.unsubscribe();
      this.autoSlideSubscription = undefined;
    }
  }

  nextPage(): void {
    if (this.totalPages > 0) {
      this.currentPage = (this.currentPage + 1) % this.totalPages;
      this.updateSlidePosition();
    }
  }

  prevPage(): void {
    if (this.totalPages > 0) {
      this.currentPage = (this.currentPage - 1 + this.totalPages) % this.totalPages;
      this.updateSlidePosition();
    }
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.currentPage = pageIndex;
      this.updateSlidePosition();
      // Redémarrer l'autoslide si on navigue manuellement
      if (this.autoSlide) {
        this.startAutoSlide();
      }
    }
  }

  private updateSlidePosition(): void {
    if (this.carouselSlidesElement) {
      const translateX = -this.currentPage * 100; // Déplace d'une largeur de conteneur (une "page")
      this.carouselSlidesElement.nativeElement.style.transform = `translateX(${translateX}%)`;
    }
  }

  isCurrentPage(pageIndex: number): boolean {
    return this.currentPage === pageIndex;
  }

}
