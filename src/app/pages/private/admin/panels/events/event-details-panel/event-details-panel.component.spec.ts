import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EventDetailsPanelComponent} from './event-details-panel.component';

describe('EventDetailsPanelComponent', () => {
  let component: EventDetailsPanelComponent;
  let fixture: ComponentFixture<EventDetailsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetailsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventDetailsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
