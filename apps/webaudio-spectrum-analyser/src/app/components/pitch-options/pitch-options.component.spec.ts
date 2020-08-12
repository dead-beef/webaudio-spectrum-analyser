import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { getAudioGraph } from '../../utils/factories';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { InputFrequencyComponent } from '../input-frequency/input-frequency.component';
import { InputRangeComponent } from '../input-range/input-range.component';
import { PitchOptionsComponent } from './pitch-options.component';

describe('PitchOptionsComponent', () => {
  let component: PitchOptionsComponent;
  let fixture: ComponentFixture<PitchOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        FormsModule,
        ReactiveFormsModule,
        NgxsModule.forRoot([]),
        AudioGraphStoreModule,
      ],
      declarations: [
        PitchOptionsComponent,
        UnitsPipe,
        InputFrequencyComponent,
        InputRangeComponent,
      ],
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getAudioGraph,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PitchOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
