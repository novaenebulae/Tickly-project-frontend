import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureMosaicItemComponent } from './structure-mosaic-item.component';

describe('StructureMosaicItemComponent', () => {
  let component: StructureMosaicItemComponent;
  let fixture: ComponentFixture<StructureMosaicItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureMosaicItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureMosaicItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
