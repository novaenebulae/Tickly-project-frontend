import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTicketReservationPageComponent } from './event-ticket-reservation-page.component';

describe('EventTicketReservationPageComponent', () => {
  let component: EventTicketReservationPageComponent;
  let fixture: ComponentFixture<EventTicketReservationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTicketReservationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventTicketReservationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
