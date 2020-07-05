import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { UnitsPipe } from '../../pipes/units/units.pipe';
import { AlertComponent } from '../alert/alert.component';
import { FrequencyChartComponent } from './frequency-chart.component';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { getAudioGraph } from '../../utils/factories';

describe('FrequencyChartComponent', () => {
  let component: FrequencyChartComponent;
  let fixture: ComponentFixture<FrequencyChartComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AudioGraphStoreModule, ClarityModule],
      declarations: [FrequencyChartComponent, AlertComponent, UnitsPipe],
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getAudioGraph,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrequencyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
