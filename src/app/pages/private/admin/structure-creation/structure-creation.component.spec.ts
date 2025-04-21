import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureCreationComponent } from './structure-creation.component';

describe('StructureCreationComponent', () => {
  let component: StructureCreationComponent;
  let fixture: ComponentFixture<StructureCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
