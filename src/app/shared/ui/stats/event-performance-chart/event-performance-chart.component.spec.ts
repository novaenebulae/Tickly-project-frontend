import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventPerformanceChartComponent } from './event-performance-chart.component';

describe('EventPerformanceChartComponent', () => {
  let component: EventPerformanceChartComponent;
  let fixture: ComponentFixture<EventPerformanceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPerformanceChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventPerformanceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
