import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureCardComponent } from './structure-card.component';

describe('StructureCardComponent', () => {
  let component: StructureCardComponent;
  let fixture: ComponentFixture<StructureCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
