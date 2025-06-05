import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsPageLayoutComponent } from './stats-page-layout.component';

describe('StatsPageLayoutComponent', () => {
  let component: StatsPageLayoutComponent;
  let fixture: ComponentFixture<StatsPageLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsPageLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsPageLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
