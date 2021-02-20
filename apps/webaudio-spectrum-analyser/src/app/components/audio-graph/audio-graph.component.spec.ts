import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { ErrorPipe } from '../../pipes/error/error.pipe';
import { UnitsPipe } from '../../pipes/units/units.pipe';
import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { AudioGraphUiStoreModule } from '../../state/audio-graph-ui/audio-graph-ui.module';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { getMockAudioGraph, mockComponent } from '../../utils/test.util';
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

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([]),
        AudioGraphStoreModule,
        AudioGraphUiStoreModule,
        ClarityModule,
        FormsModule,
        ReactiveFormsModule,
      ],
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
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getMockAudioGraph,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
