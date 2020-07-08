import { async, TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { getAudioGraph } from '../../utils/factories';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { AudioGraphStoreModule } from './audio-graph.module';
import { AudioGraphService } from './audio-graph.service';

describe('AudioGraphService', () => {
  let service: AudioGraphService;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AudioGraphStoreModule],
      providers: [
        {
          provide: AUDIO_GRAPH,
          useFactory: getAudioGraph,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        service = TestBed.inject(AudioGraphService);
      });
  }));

  it('should be created', () => {
    expect(service).toBeDefined();
  });
});
