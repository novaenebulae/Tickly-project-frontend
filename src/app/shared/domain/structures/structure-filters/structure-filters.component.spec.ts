import {ComponentFixture, TestBed} from '@angular/core/testing';

import {StructureFiltersComponent} from './structure-filters.component';

describe('StructureFiltersComponent', () => {
  let component: StructureFiltersComponent;
  let fixture: ComponentFixture<StructureFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
