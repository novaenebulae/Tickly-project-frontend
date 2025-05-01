import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureEditComponent } from './structure-edit.component';

describe('StructureEditComponent', () => {
  let component: StructureEditComponent;
  let fixture: ComponentFixture<StructureEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
