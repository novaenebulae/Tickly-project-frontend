import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneManagementComponent } from './zone-management.component';

describe('ZoneManagementComponent', () => {
  let component: ZoneManagementComponent;
  let fixture: ComponentFixture<ZoneManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
