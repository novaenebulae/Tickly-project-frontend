import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventInfoSectionComponent } from './event-info-section.component';

describe('EventInfoSectionComponent', () => {
  let component: EventInfoSectionComponent;
  let fixture: ComponentFixture<EventInfoSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventInfoSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventInfoSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
