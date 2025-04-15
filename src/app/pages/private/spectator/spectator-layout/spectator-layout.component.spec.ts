import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectatorLayoutComponent } from './spectator-layout.component';

describe('SpectatorLayoutComponent', () => {
  let component: SpectatorLayoutComponent;
  let fixture: ComponentFixture<SpectatorLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpectatorLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpectatorLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
