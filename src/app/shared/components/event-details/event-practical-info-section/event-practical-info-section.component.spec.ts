import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPracticalInfoSectionComponent } from './event-practical-info-section.component';

describe('EventPracticalInfoSectionComponent', () => {
  let component: EventPracticalInfoSectionComponent;
  let fixture: ComponentFixture<EventPracticalInfoSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPracticalInfoSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventPracticalInfoSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
