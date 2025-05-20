import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuresDisplayComponent } from './structures-display.component';

describe('StructuresDisplayComponent', () => {
  let component: StructuresDisplayComponent;
  let fixture: ComponentFixture<StructuresDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructuresDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructuresDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
