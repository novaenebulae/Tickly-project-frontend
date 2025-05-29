import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSocialSectionComponent } from './event-social-section.component';

describe('EventSocialSectionComponent', () => {
  let component: EventSocialSectionComponent;
  let fixture: ComponentFixture<EventSocialSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSocialSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventSocialSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
