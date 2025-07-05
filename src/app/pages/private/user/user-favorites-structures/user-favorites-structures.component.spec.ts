import {ComponentFixture, TestBed} from '@angular/core/testing';

import {UserFavoritesStructuresComponent} from './user-favorites-structures.component';

describe('UserFavoritesStructuresComponent', () => {
  let component: UserFavoritesStructuresComponent;
  let fixture: ComponentFixture<UserFavoritesStructuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFavoritesStructuresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserFavoritesStructuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
