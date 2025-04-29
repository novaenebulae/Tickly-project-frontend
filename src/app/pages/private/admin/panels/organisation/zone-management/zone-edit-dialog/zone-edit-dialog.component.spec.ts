import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneEditDialogComponent } from './zone-edit-dialog.component';

describe('ZoneEditDialogComponent', () => {
  let component: ZoneEditDialogComponent;
  let fixture: ComponentFixture<ZoneEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
