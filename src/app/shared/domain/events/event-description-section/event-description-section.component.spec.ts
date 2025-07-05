import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EventDescriptionSectionComponent} from './event-description-section.component';

describe('EventDescriptionSectionComponent', () => {
  let component: EventDescriptionSectionComponent;
  let fixture: ComponentFixture<EventDescriptionSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDescriptionSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventDescriptionSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
