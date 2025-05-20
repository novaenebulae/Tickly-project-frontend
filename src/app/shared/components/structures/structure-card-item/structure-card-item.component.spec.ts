import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureCardItemComponent } from './structure-card-item.component';

describe('StructureCardItemComponent', () => {
  let component: StructureCardItemComponent;
  let fixture: ComponentFixture<StructureCardItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureCardItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureCardItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
