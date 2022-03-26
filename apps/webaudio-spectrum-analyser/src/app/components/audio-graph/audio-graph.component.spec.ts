import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ErrorPipe } from '../../pipes/error/error.pipe';
import { UnitsPipe } from '../../pipes/units/units.pipe';
import {
  getComponentImports,
  getMockProviders,
  mockComponent,
} from '../../utils/test.util';
import { AlertComponent } from '../alert/alert.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { ChartComponent } from '../chart/chart.component';
import { ChartsComponent } from '../charts/charts.component';
import { CommonOptionsComponent } from '../common-options/common-options.component';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';
import { InputFrequencyComponent } from '../input-frequency/input-frequency.component';
import { InputRangeComponent } from '../input-range/input-range.component';
import { TimeDomainChartComponent } from '../time-domain-chart/time-domain-chart.component';
import { WaveOptionsComponent } from '../wave-options/wave-options.component';
import { AudioGraphComponent } from './audio-graph.component';

describe('AudioGraphComponent', () => {
  let component: AudioGraphComponent;
  let fixture: ComponentFixture<AudioGraphComponent>;

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      imports: getComponentImports(),
      declarations: [
        AudioGraphComponent,
        FrequencyChartComponent,
        AlertComponent,
        CommonOptionsComponent,
        WaveOptionsComponent,
        UnitsPipe,
        ErrorPipe,
        InputFrequencyComponent,
        InputRangeComponent,
        TimeDomainChartComponent,
        ChartComponent,
        ChartsComponent,
        CanvasComponent,
        mockComponent('audio', {
          nativeElement: {
            play: () => null,
            pause: () => null,
          },
        }),
      ],
      providers: getMockProviders(),
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AudioGraphComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
