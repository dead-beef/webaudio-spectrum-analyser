import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonOptionsComponent } from './common-options.component';

describe('CommonOptionsComponent', () => {
  let component: CommonOptionsComponent;
  let fixture: ComponentFixture<CommonOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
