import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDayComponent } from './dashboard-day.component';

describe('DashboardDayComponent', () => {
  let component: DashboardDayComponent;
  let fixture: ComponentFixture<DashboardDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardDayComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
