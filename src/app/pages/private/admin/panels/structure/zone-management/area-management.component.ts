import { Component, OnInit, OnDestroy, ViewChild, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

// Import des modèles
import { StructureAreaModel, AreaCreationDto, AreaUpdateDto } from '../../../../../../core/models/structure/structure-area.model';
import { StructureService } from '../../../../../../core/services/domain/structure/structure.service';
import { NotificationService } from '../../../../../../core/services/domain/utilities/notification.service';
import { ConfirmationDialogComponent } from '../../../../../../shared/ui/dialogs/confirmation-dialog/confirmation-dialog.component';
import { AreaEditDialogComponent } from '../../../../../../shared/domain/structures/area-edit-dialog/area-edit.component';

@Component({
  selector: 'app-area-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './area-management.component.html',
  styleUrls: ['./area-management.component.scss'],
})
export class AreaManagementComponent implements OnInit, OnDestroy {
  private readonly structureService = inject(StructureService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // Signals pour la gestion d'état
  private readonly isLoadingAreas = signal(false);
  private readonly structureId = signal<number | null>(null);

  // Colonnes à afficher dans le tableau
  displayedColumns: string[] = ['name', 'description', 'maxCapacity', 'status', 'actions'];

  // Source de données pour le tableau
  dataSource = new MatTableDataSource<StructureAreaModel>([]);

  // Accès aux éléments du template
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filterInput') filterInput!: any;

  // Computed properties
  readonly currentStructure = computed(() => this.structureService.currentStructureDetails());
  readonly areas = computed(() => this.structureService.currentStructureAreas());
  readonly loading = computed(() => this.isLoadingAreas());

  constructor() {
    // Utiliser effect() pour réagir aux changements du signal areas
    effect(() => {
      const areas = this.areas();
      this.dataSource.data = areas;
    });
  }

  ngOnInit(): void {
    // Récupération de l'ID de la structure depuis les paramètres de route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = +params['structureId'];
      if (id && !isNaN(id)) {
        this.structureId.set(id);
        this.loadStructureAndAreas(id);
      } else {
        this.notification.displayNotification('ID de structure invalide', 'error');
        this.router.navigate(['/admin/structure']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Configuration du filtre personnalisé
    this.dataSource.filterPredicate = (area: StructureAreaModel, filter: string) => {
      const searchStr = filter.toLowerCase();
      return area.name.toLowerCase().includes(searchStr) ||
        (area.description?.toLowerCase().includes(searchStr) || false) ||
        area.maxCapacity.toString().includes(searchStr);
    };
  }

  /**
   * Charge la structure et ses areas
   */
  private loadStructureAndAreas(structureId: number): void {
    this.isLoadingAreas.set(true);

    // Chargement de la structure si pas déjà en cache
    this.structureService.getStructureById(structureId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoadingAreas.set(false))
    ).subscribe({
      next: (structure) => {
        if (!structure) {
          this.notification.displayNotification('Structure non trouvée', 'error');
          this.router.navigate(['/admin/structure']);
        }
      },
      error: () => {
        this.notification.displayNotification('Erreur lors du chargement de la structure', 'error');
        this.router.navigate(['/admin/structure']);
      }
    });
  }

  /**
   * Applique le filtre sur les données
   */
  applyFilter(event: Event | string): void {
    const filterValue = typeof event === 'string'
      ? event
      : (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Efface le filtre
   */
  clearFilter(): void {
    if (this.filterInput) {
      this.filterInput.nativeElement.value = '';
    }
    this.applyFilter('');
  }

  /**
   * Ouvre le dialogue pour créer ou modifier une area
   */
  openAreaDialog(areaToEdit?: StructureAreaModel): void {
    const structureId = this.structureId();
    if (!structureId) return;

    const dialogRef = this.dialog.open(AreaEditDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        area: areaToEdit ? { ...areaToEdit } : null,
        structureId: structureId
      }
    });

    dialogRef.afterClosed().subscribe((result: StructureAreaModel | undefined) => {
      if (result) {
        if (areaToEdit) {
          this.updateArea(areaToEdit.id, result);
        } else {
          this.createArea(result);
        }
      }
    });
  }

  /**
   * Crée une nouvelle area
   */
  private createArea(areaData: StructureAreaModel): void {
    const structureId = this.structureId();
    if (!structureId) return;

    const createDto: AreaCreationDto = {
      name: areaData.name,
      maxCapacity: areaData.maxCapacity,
      isActive: areaData.isActive,
      description: areaData.description
    };

    this.structureService.createArea(structureId, createDto).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (createdArea) => {
        if (createdArea) {
          this.notification.displayNotification('Espace créé avec succès', 'valid');
        }
      },
      error: () => {
        this.notification.displayNotification('Erreur lors de la création de l\'espace', 'error');
      }
    });
  }

  /**
   * Met à jour une area existante
   */
  private updateArea(areaId: number, areaData: StructureAreaModel): void {
    const structureId = this.structureId();
    if (!structureId) return;

    const updateDto: AreaUpdateDto = {
      name: areaData.name,
      maxCapacity: areaData.maxCapacity,
      isActive: areaData.isActive,
      description: areaData.description
    };

    this.structureService.updateArea(structureId, areaId, updateDto).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updatedArea) => {
        if (updatedArea) {
          this.notification.displayNotification('Espace mis à jour avec succès', 'valid');
        }
      },
      error: () => {
        this.notification.displayNotification('Erreur lors de la mise à jour de l\'espace', 'error');
      }
    });
  }

  /**
   * Bascule le statut actif/inactif d'une area
   */
  toggleAreaStatus(area: StructureAreaModel, event: MatSlideToggleChange): void {
    const structureId = this.structureId();
    if (!structureId) return;

    const updateDto: AreaUpdateDto = {
      isActive: event.checked
    };

    this.structureService.updateArea(structureId, area.id, updateDto).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      error: () => {
        // En cas d'erreur, restaurer l'état précédent
        event.source.checked = !event.checked;
        this.notification.displayNotification('Erreur lors de la mise à jour du statut', 'error');
      }
    });
  }

  /**
   * Supprime une area avec confirmation
   */
  deleteArea(area: StructureAreaModel): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmation de suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'espace "${area.name}" ? Cette action est irréversible.`,
        confirmButtonText: 'Supprimer',
        cancelButtonText: 'Annuler',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed === true) {
        const structureId = this.structureId();
        if (!structureId) return;

        this.structureService.deleteArea(structureId, area.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (success) => {
            if (success) {
              this.notification.displayNotification('Espace supprimé avec succès', 'valid');
            }
          },
          error: () => {
            this.notification.displayNotification('Erreur lors de la suppression de l\'espace', 'error');
          }
        });
      }
    });
  }

}
