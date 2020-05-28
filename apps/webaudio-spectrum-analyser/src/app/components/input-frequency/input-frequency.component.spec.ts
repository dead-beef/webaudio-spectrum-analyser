import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFrequencyComponent } from './input-frequency.component';

describe('InputFrequencyComponent', () => {
  let component: InputFrequencyComponent;
  let fixture: ComponentFixture<InputFrequencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputFrequencyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFrequencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
