import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EventGallerySectionComponent} from './event-gallery-section.component';

describe('EventGallerySectionComponent', () => {
  let component: EventGallerySectionComponent;
  let fixture: ComponentFixture<EventGallerySectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventGallerySectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventGallerySectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
