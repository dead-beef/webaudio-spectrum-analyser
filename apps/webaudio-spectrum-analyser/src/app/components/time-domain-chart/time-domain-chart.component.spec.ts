import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { getMockAudioGraph } from '../../utils/test.util';
import { CanvasComponent } from '../canvas/canvas.component';
import { TimeDomainChartComponent } from './time-domain-chart.component';

describe('TimeDomainChartComponent', () => {
  let component: TimeDomainChartComponent;
  let fixture: ComponentFixture<TimeDomainChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([]),
        AudioGraphStoreModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [TimeDomainChartComponent, CanvasComponent, UnitsPipe],
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getMockAudioGraph,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeDomainChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
