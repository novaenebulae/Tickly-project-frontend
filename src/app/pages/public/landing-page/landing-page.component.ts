import {Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, ChangeDetectorRef} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Subscription, interval, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {Event} from '../../../core/models/event.model';
import {EventService} from '../../../core/services/event.service';

// Importation des composants standalone nécessaires
import {EventsCarouselComponent} from '../../../shared/components/events-carousel/events-carousel.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

interface HeroSlide {
  imageUrl: string;
  altText: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EventsCarouselComponent, // Composant standalone pour le carrousel d'événements
    MatButtonModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit, OnDestroy {
  // --- Section Héros ---
  heroSlides: HeroSlide[] = [
    {
      imageUrl: 'https://picsum.photos/seed/hero1/1920/1080',
      altText: 'Ambiance de festival en soirée',
      title: 'Réservez Votre Place Ici, Avec Tickly.',
      subtitle: 'Découvrez des milliers d\'événements près de chez vous et réservez vos places en quelques clics.',
      ctaText: 'Explorer les Événements',
      ctaLink: '/events'
    },
    {
      imageUrl: 'https://picsum.photos/seed/hero2/1920/1080',
      altText: 'Concert live avec foule enthousiaste',
      title: 'Votre Prochaine Aventure Commence Ici',
      subtitle: 'De la musique aux sports, en passant par le théâtre, trouvez l\'inspiration pour sortir.',
      ctaText: 'Trouver ma structure',
      ctaLink: '/structures'
    },
    {
      imageUrl: 'https://picsum.photos/seed/hero3/1920/1080',
      altText: 'Scène de théâtre illuminée',
      title: 'Organisateurs, Touchez Votre Public',
      subtitle: 'Créez et gérez vos événements facilement avec Tickly.',
      ctaText: 'Inscrire ma Structure',
      ctaLink: '/register'
    }
  ];
  currentHeroSlideIndex = 0;
  private destroy$ = new Subject<void>(); // Pour se désabonner proprement
  private autoSlideSubscription: Subscription | undefined;


  // --- Section Nos Derniers Événements ---
  latestEvents: Event[] = [];

  router = inject(Router);
  eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef); // Injection de ChangeDetectorRef


  ngOnInit(): void {
    this.loadLatestEvents();
    this.startHeroSlides();
  }

  ngOnDestroy(): void {
    this.stopHeroSlides(); // Appelle stopHeroSlides pour nettoyer autoSlideSubscription
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Logique Section Héros ---
  startHeroSlides(): void {
    this.stopHeroSlides(); // S'assurer qu'il n'y a pas de souscription existante
    this.autoSlideSubscription = interval(5000).subscribe(() => {
      this.nextHeroSlide();
    });
  }

  stopHeroSlides(): void {
    if (this.autoSlideSubscription) {
      this.autoSlideSubscription.unsubscribe();
      this.autoSlideSubscription = undefined;
    }
  }

  nextHeroSlide(): void {
    this.currentHeroSlideIndex = (this.currentHeroSlideIndex + 1) % this.heroSlides.length;
    this.cdr.markForCheck(); // Notifier Angular du changement pour mettre à jour la vue
  }

  // --- Logique Section Nos Derniers Événements ---
  loadLatestEvents(): void {
    this.eventService.getLatestEvents(8)
      .pipe(takeUntil(this.destroy$))
      .subscribe(events => {
        this.latestEvents = events;
        this.cdr.markForCheck(); // Potentiellement utile ici aussi si latestEvents affecte la vue immédiatement
      });
  }

  // --- Méthodes de redirection pour les CTA ---
  navigateToAllEvents(): void {
    this.router.navigate(['/events']);
  }

  navigateToAllStructures(): void {
    this.router.navigate(['/structures']);
  }

  navigateToRegistration(): void {
    this.router.navigate(['/register']);
  }

}
