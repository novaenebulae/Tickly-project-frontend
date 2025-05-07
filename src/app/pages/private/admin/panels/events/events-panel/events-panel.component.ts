import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr'; // Import French locale data
import { FormsModule } from '@angular/forms'; // Requis pour [(ngModel)]
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

// Importation des Modules Angular Material nécessaires
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Pour les filtres de statut
import { MatChipsModule } from '@angular/material/chips'; // Pour l'affichage du statut
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Pour notifications simples
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Pour l'indicateur de chargement

// --- Interfaces et Types ---
type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'PAST' | 'CANCELLED';

interface Event {
  id: number;
  title: string;
  type: string;
  location: string;
  date: Date;
  endDate?: Date;
  participantsCount: number;
  maxCapacity?: number;
  status: EventStatus;
  imageUrl?: string;
  webPageUrl?: string;
}

interface GroupedEvent {
  date: Date;
  dateString: string; // Clé 'YYYY-MM-DD' pour le suivi et groupement
  events: Event[];
}

// Enregistrer la locale FR globalement (peut aussi être fait dans AppModule/bootstrapApplication)
registerLocaleData(localeFr);

@Component({
  selector: 'app-events-panel',
  standalone: true, // Composant autonome
  imports: [
    CommonModule,
    FormsModule, // Nécessaire pour [(ngModel)]
    // Modules Material
    MatSlideToggleModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatMenuModule, MatCheckboxModule, MatChipsModule,
    MatTooltipModule, MatSnackBarModule, MatProgressSpinnerModule,
    // Note: MatPaginatorModule et MatSortModule ne sont pas importés car MatTable n'est pas utilisé ici
    DatePipe // Déjà inclus dans CommonModule généralement, mais peut être explicite
  ],
  templateUrl: './events-panel.component.html',
  styleUrls: ['./events-panel.component.scss'], // Correction: styleUrls
  providers: [
    DatePipe, // Fournir DatePipe si nécessaire
    { provide: LOCALE_ID, useValue: 'fr-FR' } // Définir la locale pour les pipes
  ]
})
export class EventsPanelComponent implements OnInit, OnDestroy {

  // --- Injections de Services ---
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);
  private cdRef = inject(ChangeDetectorRef);
  // private eventService = inject(EventService); // À décommenter quand vous aurez le service

  // --- États de l'Interface Utilisateur ---
  isListView: boolean = true; // Vue liste activée par défaut
  isLoading: boolean = false; // Indicateur de chargement
  error: string | null = null; // Message d'erreur potentiel
  defaultImage: string = 'images/no-image.jpg'; // Image par défaut

  // --- Données des Événements ---
  private allEvents: Event[] = []; // Liste complète originale
  filteredEvents: Event[] = [];       // Liste après filtres et recherche (pour le compteur)
  groupedEvents: GroupedEvent[] = []; // Liste groupée par date pour l'affichage

  // --- États des Contrôles de Filtre/Tri/Recherche ---
  sortOption: string = 'dateAsc'; // Option de tri par défaut
  searchTerm: string = ''; // Terme de recherche

  // Objet pour gérer l'état des filtres par statut
  filterStatus: { [key in EventStatus]: boolean } = {
    DRAFT: false,      // Caché par défaut
    PUBLISHED: true,   // Affiché par défaut
    ONGOING: true,    // Affiché par défaut
    PAST: false,       // Caché par défaut
    CANCELLED: false   // Caché par défaut
  };

  // Pour gérer le debounce de la recherche
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  // --- Constructeur (peut rester vide si injections faites avec inject()) ---
  constructor() {}

  // --- Initialisation et Nettoyage ---
  ngOnInit(): void {
    this.loadEvents(); // Charger les données au démarrage
    this.setupSearchDebounce(); // Configurer le debounce
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe(); // Nettoyer l'abonnement
  }

  // --- Chargement des Données ---
  loadEvents(): void {
    this.isLoading = true;
    this.error = null;
    console.log("Chargement des événements...");
    // Remplacer par l'appel à votre service d'événements
    // this.eventService.getAllEvents().subscribe({ ... })
    setTimeout(() => { // Simulation d'un délai réseau
      try {
        this.allEvents = this.getMockEvents(); // Récupère les données mockées
        this.processEvents(); // Applique filtres/tri/groupement initiaux
        this.isLoading = false;
      } catch (e) {
        console.error("Erreur lors de la simulation du chargement:", e);
        this.error = "Erreur lors du chargement des événements.";
        this.isLoading = false;
      }
    }, 1000);
  }

  // --- Gestion Filtre / Tri / Recherche / Groupement ---

  // Met en place le debounce pour la barre de recherche
  setupSearchDebounce(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(400),         // Attendre 400ms après la dernière frappe
        distinctUntilChanged()      // Ne traiter que si le terme a changé
      )
      .subscribe(() => {
        this.processEvents();       // Lancer le traitement après le délai
        this.cdRef.markForCheck(); // Marquer pour la détection de changement si besoin
      });
  }

  // Appelé à chaque modification de l'input de recherche
  onSearchTermChange(): void {
    this.searchSubject.next(this.searchTerm || ''); // Envoyer la valeur actuelle au Subject
  }

  // Efface le terme de recherche et relance le traitement
  clearSearch(): void {
    this.searchTerm = '';
    // Pas besoin d'appeler onSearchTermChange car processEvents est appelé
    this.processEvents();
  }

  // Fonction principale pour filtrer, trier et grouper les événements
  processEvents(): void {
    let events = [...this.allEvents]; // Travailler sur une copie

    // 1. Filtrage par Statut
    const activeStatusFilters = (Object.keys(this.filterStatus) as EventStatus[])
      .filter(status => this.filterStatus[status]);

    if (activeStatusFilters.length > 0) {
      // Garder seulement les événements dont le statut est dans les filtres actifs
      events = events.filter(event => activeStatusFilters.includes(event.status));
    } else {
      // Si aucun filtre de statut n'est actif, n'afficher aucun événement
      events = [];
    }

    // 2. Recherche par terme (si un terme est saisi)
    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
      events = events.filter(event =>
        event.title.toLowerCase().includes(lowerSearchTerm) ||
        event.type.toLowerCase().includes(lowerSearchTerm) ||
        event.location.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // 3. Tri selon l'option sélectionnée
    switch (this.sortOption) {
      case 'dateDesc': events.sort((a, b) => b.date.getTime() - a.date.getTime()); break;
      case 'nameAsc': events.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'nameDesc': events.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'dateAsc': default: events.sort((a, b) => a.date.getTime() - b.date.getTime()); break;
    }

    // Stocker les événements filtrés/triés (pour le compteur)
    this.filteredEvents = events;

    // 4. Groupement par date pour l'affichage
    this.groupedEvents = this.groupEventsByDate(events);

    // Forcer la détection de changement si les données sont mises à jour hors zone Angular (rare ici)
    // this.cdRef.markForCheck();
  }

  // Fonction pour grouper les événements par jour
  groupEventsByDate(events: Event[]): GroupedEvent[] {
    if (!events || events.length === 0) return [];

    const groups = new Map<string, GroupedEvent>();
    events.forEach(event => {
      const dateKey = this.datePipe.transform(event.date, 'yyyy-MM-dd') || 'invalid-date';
      if (!groups.has(dateKey)) {
        const groupDate = new Date(event.date);
        groupDate.setHours(0, 0, 0, 0);
        groups.set(dateKey, { date: groupDate, dateString: dateKey, events: [] });
      }
      groups.get(dateKey)!.events.push(event);
    });

    return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Réinitialise tous les filtres et la recherche à leur état par défaut
  resetFilters(): void {
    this.filterStatus = { DRAFT: false, PUBLISHED: true, ONGOING: true, PAST: false, CANCELLED: false };
    this.sortOption = 'dateAsc';
    this.searchTerm = '';
    this.clearSearch(); // Assure que le filtre est appliqué
  }

  // --- Méthodes pour les Actions des Événements (Placeholders) ---
  onAddEvent(): void { this.router.navigate(['/admin/events/create']); }

  showParticipants(event: Event): void {
    this.router.navigate(['/admin/event/details'], { fragment: 'participants' });
  }

  showEvent(event: Event): void {
    this.router.navigate(['/admin/event/details']);
  }

  showStats(event: Event): void {
    this.router.navigate(['/admin/event/details#stats']);
  }

  openEventPage(event: Event): void {
    if (event.webPageUrl) { window.open(event.webPageUrl, '_blank'); }
    else { this.snackBar.open(`Aucune page web pour ${event.title}`, 'OK', { duration: 3000 }); }
  }
  editEvent(event: Event): void { this.snackBar.open(`Modifier: ${event.title} (Non implémenté)`, 'OK', { duration: 2000 }); /* this.router.navigate(['/admin/events/edit', event.id]); */ }
  duplicateEvent(event: Event): void { this.snackBar.open(`Dupliquer: ${event.title} (Non implémenté)`, 'OK', { duration: 2000 }); }
  cancelEvent(event: Event): void { this.snackBar.open(`Annuler: ${event.title} (Non implémenté)`, 'OK', { duration: 2000 }); /* Ajouter confirmation dialog */ }

  // --- Fonctions Helper pour l'Affichage ---
  getStatusColor(status: EventStatus): 'primary' | 'accent' | 'warn' | undefined {
    switch (status) {
      case 'PUBLISHED': return 'primary';
      case 'ONGOING': return 'accent';
      case 'CANCELLED': return 'warn';
      case 'PAST': case 'DRAFT': default: return undefined; // Gris par défaut
    }
  }
  getStatusText(status: EventStatus): string {
    switch (status) {
      case 'DRAFT': return 'Brouillon'; case 'PUBLISHED': return 'Publié';
      case 'ONGOING': return 'En cours'; case 'PAST': return 'Passé';
      case 'CANCELLED': return 'Annulé'; default: return status;
    }
  }

  // --- Données Mockées (Pour test) ---
  getMockEvents(): Event[] {
    const today = new Date();
    const tomorrow = new Date(new Date().setDate(today.getDate() + 1));
    const nextWeek = new Date(new Date().setDate(today.getDate() + 7));
    const yesterday = new Date(new Date().setDate(today.getDate() - 1));
    const lastWeek = new Date(new Date().setDate(today.getDate() - 7));

    return [
      { id: 1, title: 'Concert Rock Hivernal', type: 'Concert', location: 'Grande Scène', date: new Date(tomorrow.setHours(20, 0, 0, 0)), participantsCount: 150, maxCapacity: 500, status: 'PUBLISHED', imageUrl: 'https://picsum.photos/seed/a/200', webPageUrl: '#' },
      { id: 2, title: 'Conférence Tech IA', type: 'Conférence', location: 'Salle Conf A', date: new Date(new Date().setHours(14, 0, 0, 0)), endDate: new Date(new Date().setHours(17, 30, 0, 0)), participantsCount: 85, maxCapacity: 100, status: 'ONGOING', imageUrl: 'https://picsum.photos/seed/b/200', webPageUrl: '#' },
      { id: 3, title: 'Marché de Noël Artisanal', type: 'Marché', location: 'Place Centrale', date: new Date(yesterday.setHours(10, 0, 0, 0)), endDate: new Date(yesterday.setHours(18, 0, 0, 0)), participantsCount: 320, status: 'PAST', imageUrl: 'https://picsum.photos/seed/c/200' },
      { id: 4, title: 'Atelier Yoga Débutant', type: 'Atelier', location: 'Studio Zen', date: new Date(nextWeek.setHours(9, 30, 0, 0)), participantsCount: 12, maxCapacity: 20, status: 'PUBLISHED' },
      { id: 5, title: 'Projection Film "Avenir"', type: 'Cinéma', location: 'Salle B', date: new Date(tomorrow.setHours(19, 0, 0, 0)), participantsCount: 45, maxCapacity: 60, status: 'PUBLISHED', imageUrl: 'https://picsum.photos/seed/d/200' },
      { id: 6, title: 'Festival Gastronomique (Annulé)', type: 'Festival', location: 'Parc Ouest', date: new Date(lastWeek.setHours(11, 0, 0, 0)), participantsCount: 0, status: 'CANCELLED' },
      { id: 7, title: 'Réunion Préparatoire Gala', type: 'Réunion', location: 'Bureau Admin', date: new Date(new Date().setHours(10, 0, 0, 0)), participantsCount: 5, status: 'DRAFT' },
    ].sort((a, b) => a.date.getTime() - b.date.getTime()) as Event[];
  }
}
