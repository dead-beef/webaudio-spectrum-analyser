import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { getAudioGraph } from '../../utils/factories';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { mockComponent } from '../../utils/test';
import { AlertComponent } from '../alert/alert.component';
import { CommonOptionsComponent } from '../common-options/common-options.component';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';
import { InputFrequencyComponent } from '../input-frequency/input-frequency.component';
import { InputRangeComponent } from '../input-range/input-range.component';
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
        InputFrequencyComponent,
        InputRangeComponent,
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
          useFactory: getAudioGraph,
        },
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
