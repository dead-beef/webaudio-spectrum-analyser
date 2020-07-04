import { async, TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';

import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { AudioGraphService } from '../../state/audio-graph/audio-graph.service';
import { getWindow, WINDOW } from '../../utils';
import { AudioGraph } from './audio-graph';

describe('AudioGraph', () => {
  let service: AudioGraphService;

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
      imports: [NgxsModule.forRoot([]), AudioGraphStoreModule],
      providers: [
        {
          provide: AudioGraphService,
          useFactory: (store: Store) => new AudioGraphService(store),
          deps: [Store],
        },
        { provide: WINDOW, useFactory: getWindow },
      ],
    })
      .compileComponents()
      .then(() => {
        service = TestBed.inject(AudioGraphService);
      });
  }));

  it('should create an instance', () => {
    expect(new AudioGraph(service)).toBeTruthy();
  });
});
