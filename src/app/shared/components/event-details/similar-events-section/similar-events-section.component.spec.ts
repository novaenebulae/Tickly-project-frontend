import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarEventsSectionComponent } from './similar-events-section.component';

describe('SimilarEventsSectionComponent', () => {
  let component: SimilarEventsSectionComponent;
  let fixture: ComponentFixture<SimilarEventsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimilarEventsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimilarEventsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
