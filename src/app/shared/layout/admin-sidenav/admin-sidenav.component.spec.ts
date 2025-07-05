import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AdminSidenavComponent} from './admin-sidenav.component';
import {Router} from '@angular/router';

describe('AdminSidenavComponent', () => {
  let component: AdminSidenavComponent;
  let fixture: ComponentFixture<AdminSidenavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSidenavComponent, Router]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
