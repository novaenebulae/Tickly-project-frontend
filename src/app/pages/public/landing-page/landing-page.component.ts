import {Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Subject, takeUntil} from 'rxjs';

// Models
import {EventModel} from '../../../core/models/event/event.model';

// Services
import {EventService} from '../../../core/services/domain/event/event.service';

// Composants partagés
import {EventsCarouselComponent} from '../../../shared/domain/events/events-carousel/events-carousel.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

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
    EventsCarouselComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit, OnDestroy {
  // Services injectés
  protected router = inject(Router);
  private eventService = inject(EventService);

  // Signaux (nouvelle API Angular 19)
  currentHeroSlideIndex = signal(0);
  latestEvents = signal<EventModel[]>([]);
  isLoading = signal(false);

  // Sujet de désabonnement
  private destroy$ = new Subject<void>();

  // Slides du carousel héros
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

  ngOnInit(): void {
    this.loadLatestEvents();
    this.startHeroSlides();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Chargement des derniers événements depuis le service
  loadLatestEvents(): void {
    this.isLoading.set(true);

    // Utilisation du EventService pour récupérer les événements récents
    this.eventService.getHomePageEvents(true, 9)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          this.latestEvents.set(events);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des événements:', error);
          this.isLoading.set(false);
        }
      });
  }

  // Animation automatique du slider héros
  startHeroSlides(): void {
    const intervalId = setInterval(() => {
      if (this.destroy$.closed) {
        clearInterval(intervalId);
        return;
      }
      this.nextHeroSlide();
    }, 5000);
  }

  // Passage au slide suivant
  nextHeroSlide(): void {
    this.currentHeroSlideIndex.update(current =>
      (current + 1) % this.heroSlides.length
    );
  }

  // Navigation vers les pages
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
