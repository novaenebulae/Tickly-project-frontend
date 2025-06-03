import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureDetailsPageComponent } from './structure-details-page.component';

describe('StructureDetailsPageComponent', () => {
  let component: StructureDetailsPageComponent;
  let fixture: ComponentFixture<StructureDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureDetailsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
