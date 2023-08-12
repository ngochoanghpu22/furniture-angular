/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagerBlockToggleComponent } from './block-toggle.component';


describe('ManagerBlockToggleComponent', () => {
  let component: ManagerBlockToggleComponent;
  let fixture: ComponentFixture<ManagerBlockToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManagerBlockToggleComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerBlockToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
