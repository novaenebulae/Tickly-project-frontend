import { Component, OnInit, inject } from '@angular/core'; // Ajout OnInit
import {
  FormBuilder,
  FormControl, // Import FormControl
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // MatLabel est inclus
import { MatSelectModule } from '@angular/material/select';
// import { MatSnackBar } from '@angular/material/snack-bar'; // Utiliser NotificationService
import { Router } from '@angular/router';
// import { AuthService } from '../../../../core/services/auth.service'; // Pas nécessaire ici
import { StructureService } from '../../../../core/services/structure.service'; // Vérifier le chemin
import { NotificationService } from '../../../../core/services/notification.service';
import { CommonModule } from '@angular/common'; // Ajouter CommonModule pour *ngIf
import { MatButtonModule } from '@angular/material/button'; // Pour les boutons
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Pour le spinner
import { AuthService } from '../../../../core/services/auth.service';
import { StructureCreationResponse } from '../../../../core/models/StructureCreationResponse.interface';


@Component({
  selector: 'app-structure-creation',
  standalone: true, // Assurez-vous que c'est bien standalone
  imports: [
    CommonModule, // Ajouter CommonModule
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule, // Ajouter MatButtonModule
    MatProgressSpinnerModule, // Ajouter le spinner
  ],
  providers: [], // Garder vide si services sont 'root'
  templateUrl: './structure-creation.component.html', // Fichier HTML [7] - Assurez-vous qu'il existe
  styleUrls: ['./structure-creation.component.scss'], // Corrigé 'styleUrl'
})
export class StructureCreationComponent implements OnInit {
  // Implémenter OnInit

  structureCreationForm!: FormGroup;
  isLoading = false; // Pour le spinner
  structureTypesOptions: StructureType[] = [];

  // Injection
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private structureService = inject(StructureService);
  private notification = inject(NotificationService);
  private auth = inject(AuthService); 

  ngOnInit(): void {
    // L'utilisateur est déjà authentifié (géré par AuthGuard)
    // On initialise le formulaire et charge les données nécessaires
    this.initForm();
    this.loadStructureTypes();
  }

  initForm(): void {
    this.structureCreationForm = this.fb.group({
      structureName: ['', [Validators.required]],
      structureTypes: [[], [Validators.required]],
      structureCountry: ['', [Validators.required]],
      structureCity: ['', [Validators.required]],
      structureStreet: ['', [Validators.required]],
      structureAddressNumber: [''],
      structureDescription: [''], 
    });
  }

  loadStructureTypes(): void {
    this.isLoading = true; // Activer spinner pendant le chargement
    this.structureService.getStructureTypes().subscribe({
      next: (types) => {
        this.structureTypesOptions = types;
        console.log('Structure types loaded:', this.structureTypesOptions);
        this.isLoading = false; // Désactiver spinner après succès
      },
      error: (error) => {
        console.error('Error loading structure types:', error);
        this.notification.displayNotification(
          'Erreur lors du chargement des types de structure.',
          'error',
          'Fermer'
        );
        this.isLoading = false; // Désactiver spinner en cas d'erreur
      },
    });
  }

  onSubmit(): void {
    this.structureCreationForm.markAllAsTouched(); // Afficher les erreurs si invalide

    if (this.structureCreationForm.invalid) {
      console.warn('Structure creation form is invalid.');
      return; // Ne pas soumettre si invalide
    }

    this.isLoading = true; // Activer le spinner pour la soumission

    // Préparer le DTO de la structure
    const newStructureValues: StructureDto = {
      name: this.structureCreationForm.get('structureName')?.value,
      // Assurez-vous que typeIds est un tableau si multi-select
      typeIds: Array.isArray(
        this.structureCreationForm.get('structureTypes')?.value
      )
        ? this.structureCreationForm.get('structureTypes')?.value
        : [this.structureCreationForm.get('structureTypes')?.value].filter(
            (id) => !!id
          ), // Conversion en tableau si besoin
      adress: {
        city: this.structureCreationForm.get('structureCity')?.value,
        street: this.structureCreationForm.get('structureStreet')?.value,
        number:
          this.structureCreationForm.get('structureAddressNumber')?.value || '', // Valeur par défaut si vide
        country: this.structureCreationForm.get('structureCountry')?.value,
      },
      description:
        this.structureCreationForm.get('structureDescription')?.value || '', // Valeur par défaut si vide
    };

    console.log('Submitting structure creation:', newStructureValues);

    // Appeler SEULEMENT le service de création de structure
    // L'intercepteur JWT ajoute le token automatiquement
    this.structureService.createStructure(newStructureValues).subscribe({
      next: (response: StructureCreationResponse) => {
        // Le backend renvoie la structure créée (ou juste 200/201 OK)
        console.log('Structure created successfully');
        this.notification.displayNotification(
          'Structure créée avec succès !',
          'valid',
          'Fermer'
        );
        this.auth.updateTokenAndState(response.newToken)
        this.isLoading = false;
        // Rediriger vers le dashboard admin une fois la structure créée
        this.router.navigateByUrl('/admin'); // Ou une autre route admin appropriée
      },
      error: (error) => {
        console.error('Error during structure creation:', error);
        const errorMessage =
          error.error?.message ||
          error.message ||
          'Une erreur est survenue lors de la création de la structure.';
        this.notification.displayNotification(
          `Erreur: ${errorMessage}`,
          'error',
          'Fermer'
        );
        this.isLoading = false; // Désactiver le spinner en cas d'erreur
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/home']);
  }
}
