import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsGridComponent } from './stats-grid.component';

describe('StatsGridComponent', () => {
  let component: StatsGridComponent;
  let fixture: ComponentFixture<StatsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
