import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsFiltersComponent } from './event-filters.component';

describe('EventsFiltersComponent', () => {
  let component: EventsFiltersComponent;
  let fixture: ComponentFixture<EventsFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsFiltersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
