import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { AlertComponent } from '../alert/alert.component';
import { CommonOptionsComponent } from '../common-options/common-options.component';
import { FrequencyChartComponent } from '../frequency-chart/frequency-chart.component';
import { InputFrequencyComponent } from '../input-frequency/input-frequency.component';
import { WaveOptionsComponent } from '../wave-options/wave-options.component';
import { AudioGraphComponent } from './audio-graph.component';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { getAudioGraph } from '../../utils/factories';

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
