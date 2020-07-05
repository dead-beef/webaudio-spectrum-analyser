import { NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from '../alert/alert.component';
import { FrequencyChartComponent } from './frequency-chart.component';

describe('FrequencyChartComponent', () => {
  let component: FrequencyChartComponent;
  let fixture: ComponentFixture<FrequencyChartComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      declarations: [FrequencyChartComponent, AlertComponent],
      providers: [
        {
          provide: NgZone,
          useValue: {
            runOutsideAngular: (...args) => null,
            run: (...args) => null,
          },
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FrequencyChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
