import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFriendsDialogComponent } from './manage-friends-dialog.component';

describe('ManageFriendsDialogComponent', () => {
  let component: ManageFriendsDialogComponent;
  let fixture: ComponentFixture<ManageFriendsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFriendsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFriendsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
