import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {Subscription, of, throwError, Observable, forkJoin, switchMap} from 'rxjs';
import { finalize, catchError, delay, tap } from 'rxjs/operators';
import { Location } from '@angular/common'; // Pour le bouton Annuler/Retour

// Importation des Modules Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// Importez MatTextareaAutosize si vous l'utilisez (souvent via TextFieldModule)
import { TextFieldModule } from '@angular/cdk/text-field';


// --- Interfaces (Ajustez selon votre modèle de données réel) ---
interface StructureInfo {
  id: number;
  name: string;
  structureTypeId: number | null;
  description?: string;
  logoUrl?: string | null;   // Peut être null si supprimé
  coverUrl?: string | null; // Peut être null si supprimé
  addressLine1?: string;
  addressLine2?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  publicEmail?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  // Ajoutez d'autres champs si nécessaire (Twitter/X, LinkedIn...)
}

interface StructureType {
  id: number;
  name: string;
}

// --- Services (Simulés, remplacez par vos vrais services) ---
// import { StructureService } from 'src/app/core/services/structure.service';
// import { FileUploadService } from 'src/app/core/services/file-upload.service'; // Si vous avez un service dédié

// Mocks
const mockStructureService = {
  getStructureInfo: (id: number) => of<StructureInfo>({
    id: 1, name: 'Le Phare Éclectique', structureTypeId: 2,
    description: 'Un lieu unique pour des expériences culturelles variées.',
    logoUrl: '', coverUrl: '',
    addressLine1: '123 Rue des Lumières', addressLine2: '', zipCode: '57000', city: 'Métropole Fictive', country: 'France',
    phone: '+33 1 23 45 67 89', publicEmail: 'contact@lephare.example', websiteUrl: 'https://lephare.example',
    facebookUrl: 'https://facebook.com/lephare', instagramUrl: 'https://instagram.com/lephare'
  }).pipe(delay(800), tap(() => console.log('Mock: Structure Info Loaded'))),

  updateStructureInfo: (id: number, data: Partial<StructureInfo>) => {
    console.log('Mock: Update Structure Info Payload:', data);
    // Simuler une erreur occasionnelle
    if (Math.random() < 0.1) {
      return throwError(() => new Error('Erreur serveur simulée')).pipe(delay(1200));
    }
    // Retourne les données mises à jour (ici juste un écho partiel)
    return of<Partial<StructureInfo>>({ ...data, id: id }).pipe(delay(1200), tap(() => console.log('Mock: Structure Info Updated')));
  },

  getAvailableStructureTypes: () => of<StructureType[]>([
    { id: 1, name: 'Salle de concert' }, { id: 2, name: 'Théâtre' }, { id: 3, name: 'Centre de conférence' },
    { id: 4, name: 'Espace polyvalent' }, { id: 5, name: 'Bar / Club' }, { id: 99, name: 'Autre' }
  ]).pipe(delay(300), tap(() => console.log('Mock: Structure Types Loaded')))
};

// Simulation simple pour FileUploadService
const mockFileUploadService = {
  // Simule l'upload et retourne une URL fictive
  uploadFile: (file: File, type: 'logo' | 'cover') => {
    console.log(`Mock: Uploading ${type}: ${file.name}`);
    const randomId = Math.random().toString(36).substring(7);
    return of(`assets/uploads/${type}-${randomId}.${file.name.split('.').pop()}`).pipe(delay(1500));
  }
};


@Component({
  selector: 'app-structure-edit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatSnackBarModule, TextFieldModule // Pour matTextareaAutosize
  ],
  templateUrl: './structure-edit.component.html',
  styleUrls: ['./structure-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureEditComponent implements OnInit, OnDestroy {

  // --- Injections ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location); // Pour le bouton Annuler/Retour
  private cdRef = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);
  // Remplacer par vrais services
  private structureService = mockStructureService;
  private fileUploadService = mockFileUploadService;

  // --- État du Composant ---
  structureForm: FormGroup;
  structureInfo: StructureInfo | null = null; // Infos actuelles chargées
  availableStructureTypes: StructureType[] = []; // Pour le select
  isLoading: boolean = true; // Chargement initial des données
  isSaving: boolean = false; // Sauvegarde en cours
  errorLoading: string | null = null;

  // Gestion des fichiers et aperçus
  logoPreviewUrl: string | null = null;
  coverPreviewUrl: string | null = null;
  selectedLogoFile: File | null = null;
  selectedCoverFile: File | null = null;
  defaultImage: string = 'images/no-image.svg';

  // Pour cleanup
  private subscriptions = new Subscription();

  constructor() {
    // Initialisation du formulaire (vide au début)
    this.structureForm = this.fb.group({
      name: ['', Validators.required],
      structureTypeId: [null, Validators.required],
      description: [''],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      zipCode: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      phone: [''],
      publicEmail: ['', Validators.email], // Validation email
      websiteUrl: ['', Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)], // Validation URL simple
      facebookUrl: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?facebook\.com\/[\w.-]+\/?$/)],
      instagramUrl: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?instagram\.com\/[\w.-]+\/?$/)],
      // Ajouter d'autres réseaux si besoin
    });
  }

  ngOnInit(): void {
    this.loadInitialData(); // Charger types et infos structure
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Nettoyer les abonnements
  }

  // --- Chargement des Données Initiales ---
  loadInitialData(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.cdRef.markForCheck();

    const structureId = 1; // TODO: Obtenir l'ID de la structure actuelle (ex: depuis la route ou un service)

    // Charger les types de structure ET les informations actuelles en parallèle
    const loadSub = forkJoin({
      types: this.structureService.getAvailableStructureTypes(),
      info: this.structureService.getStructureInfo(structureId)
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdRef.markForCheck();
      }),
      catchError(err => {
        console.error("Erreur chargement données initiales:", err);
        this.errorLoading = "Impossible de charger les informations de la structure.";
        return throwError(() => err); // Propage l'erreur
      })
    ).subscribe(results => {
      this.availableStructureTypes = results.types;
      this.structureInfo = results.info;
      this.patchForm(); // Remplir le formulaire avec les données chargées
    });
    this.subscriptions.add(loadSub);
  }

  // Remplir le formulaire avec les données de structureInfo
  patchForm(): void {
    if (this.structureInfo) {
      this.structureForm.patchValue({
        name: this.structureInfo.name,
        structureTypeId: this.structureInfo.structureTypeId,
        description: this.structureInfo.description,
        addressLine1: this.structureInfo.addressLine1,
        addressLine2: this.structureInfo.addressLine2,
        zipCode: this.structureInfo.zipCode,
        city: this.structureInfo.city,
        country: this.structureInfo.country,
        phone: this.structureInfo.phone,
        publicEmail: this.structureInfo.publicEmail,
        websiteUrl: this.structureInfo.websiteUrl,
        facebookUrl: this.structureInfo.facebookUrl,
        instagramUrl: this.structureInfo.instagramUrl,
      });
      // Important: Marquer comme non modifié après patch initial
      this.structureForm.markAsPristine();
      this.cdRef.markForCheck(); // Mettre à jour la vue
    }
  }

  // --- Gestion des Uploads d'Images ---
  onLogoSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      this.selectedLogoFile = file;
      // Générer l'aperçu
      const reader = new FileReader();
      reader.onload = e => {
        this.logoPreviewUrl = reader.result as string;
        this.cdRef.markForCheck(); // Mettre à jour l'aperçu
      };
      reader.readAsDataURL(file);
    }
    element.value = ''; // Permet de resélectionner le même fichier
  }

  removeLogo(): void {
    this.selectedLogoFile = null;
    this.logoPreviewUrl = null;
    // Indiquer que le logo doit être supprimé côté serveur si un logo existait
    // (On pourrait ajouter un flag au formulaire ou une méthode dédiée)
    console.log("TODO: Marquer le logo pour suppression côté serveur si nécessaire");
    this.structureForm.markAsDirty(); // Marquer comme modifié
    this.cdRef.markForCheck();
  }

  onCoverSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      this.selectedCoverFile = file;
      const reader = new FileReader();
      reader.onload = e => {
        this.coverPreviewUrl = reader.result as string;
        this.cdRef.markForCheck();
      };
      reader.readAsDataURL(file);
    }
    element.value = '';
  }

  removeCover(): void {
    this.selectedCoverFile = null;
    this.coverPreviewUrl = null;
    console.log("TODO: Marquer la couverture pour suppression côté serveur si nécessaire");
    this.structureForm.markAsDirty();
    this.cdRef.markForCheck();
  }

  // --- Actions du Formulaire ---
  onSubmit(): void {
    if (this.structureForm.invalid || this.isSaving) {
      this.structureForm.markAllAsTouched(); // Affiche les erreurs si soumission invalide
      return;
    }
    if (this.structureForm.pristine && !this.selectedLogoFile && !this.selectedCoverFile) {
      this.snackBar.open("Aucune modification détectée.", "OK", { duration: 3000 });
      return; // Rien à sauvegarder
    }

    this.isSaving = true;
    this.cdRef.markForCheck();

    const structureId = this.structureInfo?.id; // Récupère l'ID
    if (!structureId) {
      console.error("ID de structure manquant !");
      this.isSaving = false;
      this.cdRef.markForCheck();
      return;
    }

    // 1. Gérer les uploads d'images (simulation simple)
    // Normalement, on uploaderait d'abord, puis on mettrait à jour les infos avec les URL retournées
    const uploadObservables: { logo?: Observable<string>, cover?: Observable<string> } = {};
    if (this.selectedLogoFile) {
      uploadObservables.logo = this.fileUploadService.uploadFile(this.selectedLogoFile, 'logo');
    }
    if (this.selectedCoverFile) {
      uploadObservables.cover = this.fileUploadService.uploadFile(this.selectedCoverFile, 'cover');
    }

    // Simule l'attente des uploads (ici, juste des observables de strings)
    const uploadsComplete$ = Object.keys(uploadObservables).length > 0
      ? forkJoin(uploadObservables)
      : of({}); // Observable vide si pas d'uploads

    const saveSub = uploadsComplete$.pipe(
      catchError(uploadError => {
        console.error("Erreur lors de l'upload:", uploadError);
        this.snackBar.open("Erreur lors de l'upload d'une image.", "Réessayer", { duration: 5000 });
        return throwError(() => uploadError); // Arrête le flux
      }),
      // Après les uploads (ou s'il n'y en avait pas)
      switchMap((uploadedUrls: { logo?: string, cover?: string }) => {
        // 2. Préparer les données de mise à jour de la structure
        const updatedData: Partial<StructureInfo> = {
          ...this.structureForm.value, // Prend toutes les valeurs du formulaire
          // Ecrase avec les nouvelles URL si uploadées
          ...(uploadedUrls.logo && { logoUrl: uploadedUrls.logo }),
          ...(uploadedUrls.cover && { coverUrl: uploadedUrls.cover }),
          // TODO: Gérer la suppression d'image (envoyer null ou un flag spécifique)
          // if (this.logoWasRemoved) updatedData.logoUrl = null;
          // if (this.coverWasRemoved) updatedData.coverUrl = null;
        };

        // 3. Appeler le service pour mettre à jour les infos
        return this.structureService.updateStructureInfo(structureId, updatedData);
      }),
      finalize(() => {
        this.isSaving = false; // Arrêter l'indicateur de sauvegarde
        this.cdRef.markForCheck(); // Mettre à jour l'UI
      })
    ).subscribe({
      next: (updatedInfo) => {
        console.log("Structure mise à jour avec succès:", updatedInfo);
        this.structureInfo = { ...this.structureInfo, ...updatedInfo } as StructureInfo; // Mettre à jour les infos locales
        this.structureForm.markAsPristine(); // Marquer comme non modifié
        this.selectedLogoFile = null; // Réinitialiser les fichiers sélectionnés
        this.selectedCoverFile = null;
        // Garder les previewUrl ou les mettre à jour avec updatedInfo.logo/coverUrl ?
        // this.logoPreviewUrl = updatedInfo.logoUrl ?? null;
        // this.coverPreviewUrl = updatedInfo.coverUrl ?? null;
        this.snackBar.open("Informations de la structure mises à jour !", "OK", { duration: 3000 });
        // Optionnel: Naviguer en arrière ou rester sur la page
        // this.location.back();
      },
      error: (err) => {
        console.error("Erreur lors de la sauvegarde:", err);
        this.snackBar.open("Erreur lors de la sauvegarde des informations.", "Fermer", { duration: 5000 });
      }
    });
    this.subscriptions.add(saveSub);
  }

  // Annuler les modifications et retourner en arrière
  onCancel(): void {
    // Si le formulaire a été modifié, demander confirmation ? (Optionnel)
    if (this.structureForm.dirty) {
      if (confirm("Des modifications n'ont pas été enregistrées. Voulez-vous vraiment quitter ?")) {
        this.location.back(); // Utilise le service Location pour revenir en arrière
      }
    } else {
      this.location.back();
    }
  }
}
