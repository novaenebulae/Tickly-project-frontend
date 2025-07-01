import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureMediasComponent } from './structure-medias.component';

describe('StructureMediasComponent', () => {
  let component: StructureMediasComponent;
  let fixture: ComponentFixture<StructureMediasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureMediasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureMediasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
