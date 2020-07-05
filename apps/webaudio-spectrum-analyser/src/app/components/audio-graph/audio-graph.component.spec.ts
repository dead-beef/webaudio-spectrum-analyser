import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';
import { of } from 'rxjs';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { AlertComponent } from '../alert/alert.component';
import { CommonOptionsComponent } from '../common-options/common-options.component';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';
import { WaveOptionsComponent } from '../wave-options/wave-options.component';
import { AudioGraphComponent } from './audio-graph.component';

describe('AudioGraphComponent', () => {
  let component: AudioGraphComponent;
  let fixture: ComponentFixture<AudioGraphComponent>;

  Object.defineProperty(window, 'AudioContext', {
    value: () => {
      return {
        suspend: () => null,
        createOscillator: () => ({
          start: () => null,
          fftSize: 0,
          maxDecibels: 0,
          minDecibels: 0,
          connect: (...args) => null,
        }),
        createDelay: (...args) => ({ connect: (...args1) => null }),
        createMediaStreamDestination: () => ({ stream: of() }),
        createAnalyser: () => ({
          start: () => null,
          fftSize: 0,
          maxDecibels: 0,
          minDecibels: 0,
          connect: (...args) => null,
        }),
      };
    },
    writable: false,
  });

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AudioGraphStoreModule, ClarityModule],
      declarations: [
        AudioGraphComponent,
        FrequencyChartComponent,
        AlertComponent,
        CommonOptionsComponent,
        WaveOptionsComponent,
        UnitsPipe,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
