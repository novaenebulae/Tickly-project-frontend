import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestEventsComponent } from './test-events.component';

describe('TestEventsComponent', () => {
  let component: TestEventsComponent;
  let fixture: ComponentFixture<TestEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
