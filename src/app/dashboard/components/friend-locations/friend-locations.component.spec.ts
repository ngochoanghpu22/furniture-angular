import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendLocationsComponent } from './friend-locations.component';

describe('FriendLocationsComponent', () => {
  let component: FriendLocationsComponent;
  let fixture: ComponentFixture<FriendLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FriendLocationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
