import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureGalleryManagerComponent } from './structure-gallery-manager.component';

describe('StructureGalleryManagerComponent', () => {
  let component: StructureGalleryManagerComponent;
  let fixture: ComponentFixture<StructureGalleryManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureGalleryManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureGalleryManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
