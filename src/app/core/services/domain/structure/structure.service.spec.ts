import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {StructureService} from './structure.service';
import {StructureApiService} from '../../api/structure/structure-api.service';
import {NotificationService} from '../utilities/notification.service';
import {AuthService} from '../user/auth.service';
import {Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {
  StructureCreationDto,
  StructureCreationResponseDto,
  StructureModel
} from '../../../models/structure/structure.model';
import {StructureTypeModel} from '../../../models/structure/structure-type.model';
import {StructureAddressModel} from '../../../models/structure/structure-address.model';
import {StructureSummaryModel} from '../../../models/structure/structure-summary.model';

describe('StructureService', () => {
  let service: StructureService;
  let structureApiServiceSpy: jasmine.SpyObj<StructureApiService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockStructureTypes: StructureTypeModel[] = [
    { id: 1, name: 'Salle de concert' },
    { id: 2, name: 'Théâtre' },
    { id: 3, name: 'Stade' }
  ];

  const mockAddress: StructureAddressModel = {
    country: 'France',
    city: 'Paris',
    street: '123 Rue de Rivoli',
    zipCode: '75001'
  };

  const mockStructure: StructureModel = {
    id: 1,
    name: 'Test Structure',
    types: [mockStructureTypes[0]],
    description: 'A test structure',
    address: mockAddress,
    createdAt: new Date(),
    updatedAt: new Date(),
    areas: []
  };

  const mockStructureSummary: StructureSummaryModel = {
    id: 1,
    name: 'Test Structure',
    types: [mockStructureTypes[0]],
    city: 'Paris',
    logoUrl: 'test-logo.jpg',
    isActive: true
  };

  const mockStructureCreationDto: StructureCreationDto = {
    name: 'New Structure',
    typeIds: [1],
    description: 'A new structure',
    address: mockAddress
  };

  const mockStructureCreationResponse: StructureCreationResponseDto = {
    structureId: 1,
    message: 'Structure created successfully',
    accessToken: 'mock-token',
    expiresIn: 3600
  };

  beforeEach(() => {
    // Create spy objects
    structureApiServiceSpy = jasmine.createSpyObj('StructureApiService', [
      'getStructures', 'getStructureById', 'createStructure', 'updateStructure',
      'deleteStructure', 'getStructureTypes', 'getStructureAreas'
    ]);

    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['displayNotification']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['updateTokenAndState', 'userStructureId']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Set up default return values
    structureApiServiceSpy.getStructures.and.returnValue(of([]));
    structureApiServiceSpy.getStructureById.and.returnValue(of(undefined));
    structureApiServiceSpy.createStructure.and.returnValue(of(mockStructureCreationResponse));
    structureApiServiceSpy.getStructureTypes.and.returnValue(of(mockStructureTypes));

    authServiceSpy.userStructureId.and.returnValue(1);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        StructureService,
        { provide: StructureApiService, useValue: structureApiServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(StructureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStructureTypes', () => {
    it('should return cached structure types if available', () => {
      // Manually set structure types in the signal
      (service as any).structureTypesSig.set(mockStructureTypes);
      structureApiServiceSpy.getStructureTypes.calls.reset();

      service.getStructureTypes(false).subscribe(types => {
        expect(types).toEqual(mockStructureTypes);
        expect(structureApiServiceSpy.getStructureTypes).not.toHaveBeenCalled();
      });
    });

    it('should fetch structure types from API when force refreshing', () => {
      structureApiServiceSpy.getStructureTypes.and.returnValue(of(mockStructureTypes));

      service.getStructureTypes(true).subscribe(types => {
        expect(types).toEqual(mockStructureTypes);
        expect(structureApiServiceSpy.getStructureTypes).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      structureApiServiceSpy.getStructureTypes.and.returnValue(throwError(() => errorResponse));

      service.getStructureTypes(true).subscribe({
        next: types => {
          expect(types).toEqual([]);
        },
        error: () => fail('should not propagate error')
      });

      expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
    });
  });

  describe('getStructureById', () => {
    it('should return structure from cache if available', () => {
      // Manually set structure in cache
      (service as any).currentStructureDetailsSig.set(mockStructure);
      structureApiServiceSpy.getStructureById.calls.reset();

      service.getStructureById(mockStructure.id!).subscribe(structure => {
        expect(structure).toEqual(mockStructure);
        expect(structureApiServiceSpy.getStructureById).not.toHaveBeenCalled();
      });
    });

    it('should fetch structure from API if not in cache', () => {
      structureApiServiceSpy.getStructureById.and.returnValue(of(mockStructure));

      service.getStructureById(mockStructure.id!).subscribe(structure => {
        expect(structure).toEqual(mockStructure);
        expect(structureApiServiceSpy.getStructureById).toHaveBeenCalledWith(mockStructure.id!);
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      structureApiServiceSpy.getStructureById.and.returnValue(throwError(() => errorResponse));

      service.getStructureById(mockStructure.id!).subscribe(structure => {
        expect(structure).toBeUndefined();
      });

      expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
    });
  });

  describe('createStructure', () => {
    it('should create a structure successfully', () => {
      structureApiServiceSpy.createStructure.and.returnValue(of(mockStructureCreationResponse));

      service.createStructure(mockStructureCreationDto).subscribe(response => {
        expect(response).toEqual(mockStructureCreationResponse);
        expect(structureApiServiceSpy.createStructure).toHaveBeenCalledWith(mockStructureCreationDto);
        expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
          'Structure créée avec succès.', 'valid'
        );
      });
    });

    it('should update token and navigate to dashboard if accessToken is provided', () => {
      structureApiServiceSpy.createStructure.and.returnValue(of(mockStructureCreationResponse));

      service.createStructure(mockStructureCreationDto).subscribe(() => {
        expect(authServiceSpy.updateTokenAndState).toHaveBeenCalledWith(mockStructureCreationResponse.accessToken);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      structureApiServiceSpy.createStructure.and.returnValue(throwError(() => errorResponse));

      service.createStructure(mockStructureCreationDto).subscribe({
        error: error => {
          expect(error).toBeTruthy();
          expect(notificationServiceSpy.displayNotification).toHaveBeenCalledWith(
            'Erreur lors de la création de la structure.', 'error'
          );
        }
      });
    });
  });

  describe('getStructures', () => {
    it('should return structures from API', () => {
      const mockStructures = [mockStructureSummary];
      structureApiServiceSpy.getStructures.and.returnValue(of(mockStructures));

      service.getStructures().subscribe(structures => {
        expect(structures).toEqual(mockStructures);
        expect(structureApiServiceSpy.getStructures).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', () => {
      const errorResponse = new Error('API error');
      structureApiServiceSpy.getStructures.and.returnValue(throwError(() => errorResponse));

      service.getStructures().subscribe(structures => {
        expect(structures).toEqual([]);
      });

      expect(notificationServiceSpy.displayNotification).toHaveBeenCalled();
    });
  });
});
