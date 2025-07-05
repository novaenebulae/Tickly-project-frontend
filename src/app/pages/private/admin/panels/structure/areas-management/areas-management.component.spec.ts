import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AreasManagementComponent} from './areas-management.component';

describe('AreasManagementComponent', () => {
  let component: AreasManagementComponent;
  let fixture: ComponentFixture<AreasManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreasManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreasManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
