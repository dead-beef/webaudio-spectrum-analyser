import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { AlertComponent } from '../alert/alert.component';
import { CommonOptionsComponent } from '../common-options/common-options.component';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';
import { AudioGraphComponent } from './audio-graph.component';

describe('AudioGraphComponent', () => {
  let component: AudioGraphComponent;
  let fixture: ComponentFixture<AudioGraphComponent>;

  Object.defineProperty(window, 'AudioContext', {
    value: () => {
      return {
        suspend: () => null,
        createOscillator: () => null,
        createDelay: (...args) => null,
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
