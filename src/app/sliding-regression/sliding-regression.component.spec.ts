import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidingRegressionComponent } from './sliding-regression.component';

describe('SlidingRegressionComponent', () => {
  let component: SlidingRegressionComponent;
  let fixture: ComponentFixture<SlidingRegressionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlidingRegressionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlidingRegressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
