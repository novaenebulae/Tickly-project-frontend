import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AllStructuresPageComponent} from './all-structures-page.component';

describe('AllStructuresPageComponent', () => {
  let component: AllStructuresPageComponent;
  let fixture: ComponentFixture<AllStructuresPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllStructuresPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllStructuresPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
