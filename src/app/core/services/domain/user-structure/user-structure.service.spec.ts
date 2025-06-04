import { TestBed } from '@angular/core/testing';

import { UserStructureService } from './user-structure.service';

describe('UserStructureService', () => {
  let service: UserStructureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserStructureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
