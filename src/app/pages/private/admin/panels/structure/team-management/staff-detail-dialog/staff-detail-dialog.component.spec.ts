import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDetailDialogComponent } from './staff-detail-dialog.component';

describe('StaffDetailDialogComponent', () => {
  let component: StaffDetailDialogComponent;
  let fixture: ComponentFixture<StaffDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
