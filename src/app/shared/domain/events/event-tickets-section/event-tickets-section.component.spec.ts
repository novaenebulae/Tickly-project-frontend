import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTicketsSectionComponent } from './event-tickets-section.component';

describe('EventTicketsSectionComponent', () => {
  let component: EventTicketsSectionComponent;
  let fixture: ComponentFixture<EventTicketsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTicketsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventTicketsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
