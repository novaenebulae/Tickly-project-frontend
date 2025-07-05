import {Component, computed, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {finalize, Subject, takeUntil} from 'rxjs';

// Angular Material
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatRadioModule} from '@angular/material/radio';

// Models
import {EventModel} from '../../../../core/models/event/event.model';
import {EventAudienceZone} from '../../../../core/models/event/event-audience-zone.model';
import {ParticipantInfoModel} from '../../../../core/models/tickets/participant-info.model';
import {ReservationConfirmationModel} from '../../../../core/models/tickets/reservation.model';

// Services
import {EventService} from '../../../../core/services/domain/event/event.service';
import {TicketService} from '../../../../core/services/domain/ticket/ticket.service';
import {NotificationService} from '../../../../core/services/domain/utilities/notification.service';
import {UserService} from '../../../../core/services/domain/user/user.service';

@Component({
  selector: 'app-event-ticket-reservation-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatRadioModule
  ],
  templateUrl: './event-ticket-reservation-page.component.html',
  styleUrls: ['./event-ticket-reservation-page.component.scss']
})
export class EventTicketReservationPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private ticketService = inject(TicketService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);
  private location = inject(Location);

  private destroy$ = new Subject<void>();

  // État de l'application
  event = signal<EventModel | undefined>(undefined);
  availableZones = computed(() => this.event()?.audienceZones?.filter(zone => zone.isActive) || []);
  isLoading = signal(true);
  isSubmitting = signal(false);
  currentStep = signal(0);
  maxTickets = 4;

  zoneSelectionForm: FormGroup = this.fb.group({
    audienceZoneId: ['', [Validators.required]],
    ticketCount: [1, [Validators.required, Validators.min(1), Validators.max(this.maxTickets)]]
  });

  participantsForm: FormGroup = this.fb.group({
    participants: this.fb.array([])
  });

  // Données de réservation
  selectedZone = signal<EventAudienceZone | undefined>(undefined);
  participantsData = signal<ParticipantInfoModel[]>([]);
  reservationConfirmation = signal<ReservationConfirmationModel | undefined>(undefined);

  currentUserSignal = this.userService.currentUserProfileData;

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const eventId = params.get('id');
      if (eventId && !isNaN(Number(eventId))) {
        this.loadEventData(Number(eventId));
      } else {
        this.handleError('Identifiant d\'événement invalide');
        this.router.navigate(['/events']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Les formulaires sont déjà initialisés dans la déclaration de propriétés

    // Écouter les changements du nombre de billets pour ajuster les participants
    this.zoneSelectionForm.get('ticketCount')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(count => {
      this.updateParticipantsFormArray(count);
    });
  }

  private loadEventData(eventId: number): void {
    window.scrollTo({top: 0, behavior: 'instant'});
    this.isLoading.set(true);

    this.eventService.getEventById(eventId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (eventData) => {
        if (eventData) {
          this.event.set(eventData);
          this.updateParticipantsFormArray(1); // Initialiser avec 1 participant
        } else {
          this.handleError('Événement non trouvé');
          this.router.navigate(['/events']);
        }
      },
      error: () => {
        this.handleError('Impossible de charger les détails de l\'événement');
      }
    });
  }

  private updateParticipantsFormArray(count: number): void {
    const participantsArray = this.participantsForm.get('participants') as FormArray;

    // Vider le FormArray
    while (participantsArray.length !== 0) {
      participantsArray.removeAt(0);
    }

    // Récupérer les données de l'utilisateur actuel depuis le signal
    const currentUser = this.currentUserSignal();

    // Ajouter les nouveaux participants
    for (let i = 0; i < count; i++) {
      const isMainParticipant = i === 0;
      const participantGroup = this.createParticipantFormGroup(isMainParticipant);

      // Pré-remplir le formulaire du participant principal avec les infos de l'utilisateur connecté
      if (isMainParticipant && currentUser) {
        participantGroup.patchValue({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || ''
        });
      }

      participantsArray.push(participantGroup);
    }
  }

  private createParticipantFormGroup(isMainParticipant = false): FormGroup {
    const group = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', isMainParticipant ? [Validators.required, Validators.email] : [Validators.email]],
      sendTicketByEmail: [isMainParticipant] // Premier participant reçoit automatiquement le billet
    });

    // Ajouter un écouteur pour mettre à jour les validators d'email en fonction du choix d'envoi
    if (!isMainParticipant) {
      group.get('sendTicketByEmail')?.valueChanges.subscribe(sendEmail => {
        const emailControl = group.get('email');
        if (emailControl) {
          if (sendEmail) {
            emailControl.setValidators([Validators.required, Validators.email]);
          } else {
            emailControl.setValidators([Validators.email]);
          }
          emailControl.updateValueAndValidity();
        }
      });
    }

    return group;
  }

  get participantsArray(): FormArray {
    return this.participantsForm.get('participants') as FormArray;
  }

  // Navigation entre les étapes
  goToNextStep(): void {
    if (this.currentStep() < 2) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  goToPreviousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  // Validation et soumission de l'étape 1 (sélection de zone)
  onZoneSelectionSubmit(): void {
    if (this.zoneSelectionForm.valid) {
      const zoneId = this.zoneSelectionForm.get('audienceZoneId')?.value;
      const zone = this.availableZones().find(z => z.id === Number(zoneId));
      this.selectedZone.set(zone);
      this.goToNextStep();
    } else {
      this.markFormGroupTouched(this.zoneSelectionForm);
    }
  }

  // Validation et soumission de l'étape 2 (participants)
  onParticipantsSubmit(): void {
    if (this.participantsForm.valid) {
      const participants = this.participantsArray.value as ParticipantInfoModel[];
      this.participantsData.set(participants);
      this.goToNextStep();
    } else {
      this.markFormGroupTouched(this.participantsForm);
    }
  }

  // Confirmation finale et création de la réservation
  onFinalConfirmation(): void {
    if (!this.event() || !this.selectedZone() || this.participantsData().length === 0) {
      this.notificationService.displayNotification('Données de réservation incomplètes', 'error');
      return;
    }

    this.isSubmitting.set(true);

    this.ticketService.createReservation(
      this.event()!.id!,
      this.selectedZone()!.id!,
      this.participantsData()
    ).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: (confirmation) => {
        if (confirmation) {
          this.reservationConfirmation.set(confirmation);
          this.notificationService.displayNotification(
            `Réservation confirmée ! ${confirmation.tickets.length} billet(s) émis.`,
            'valid'
          );

          // Rediriger vers la page des billets utilisateur
          this.router.navigate(['/user/tickets'])
        }
      },
      error: () => {
        this.notificationService.displayNotification('Erreur lors de la réservation', 'error');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      }
    });
  }

  goBack() {
    this.location.back();
  }

  private handleError(message: string): void {
    this.notificationService.displayNotification(message, 'error');
  }

}
