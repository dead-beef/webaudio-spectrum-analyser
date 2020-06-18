import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveOptionsComponent } from './wave-options.component';

describe('WaveOptionsComponent', () => {
  let component: WaveOptionsComponent;
  let fixture: ComponentFixture<WaveOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      declarations: [WaveOptionsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaveOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
