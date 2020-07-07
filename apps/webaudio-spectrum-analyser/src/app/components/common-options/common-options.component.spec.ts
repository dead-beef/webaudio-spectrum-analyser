import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { UnitsPipe } from '../../pipes/units/units.pipe';
import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { getAudioGraph } from '../../utils/factories';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { CommonOptionsComponent } from './common-options.component';

describe('CommonOptionsComponent', () => {
  let component: CommonOptionsComponent;
  let fixture: ComponentFixture<CommonOptionsComponent>;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        FormsModule,
        ReactiveFormsModule,
        NgxsModule.forRoot([]),
        AudioGraphStoreModule,
      ],
      declarations: [CommonOptionsComponent, UnitsPipe],
      providers: [
        {
          provide: AudioGraphService,
          useValue: {
            graph: {
              nodes: {
                input: {
                  delayTime: 0,
                },
              },
              pitch: [],
            },
            getFftSizes: () => [0, 1],
            getMaxDelay: () => 0,
            listPitchDetection: () => [],
            setFftSize: (...args) => void 0,
            setDebug: (...args) => void 0,
            setDelay: (...args) => void 0,
            setMinPitch: (...args) => void 0,
            setMaxPitch: (...args) => void 0,
          },
        },
        {
          provide: AUDIO_GRAPH,
          useFactory: getAudioGraph,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CommonOptionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
