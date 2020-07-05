import { async, TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';

import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { getWindow } from '../../utils/factories';
import { WINDOW } from '../../utils/injection-tokens';
import { AudioGraph } from './audio-graph';

describe('AudioGraph', () => {
  Object.defineProperty(window, 'AudioContext', {
    value: () => {
      return {
        suspend: () => null,
        createOscillator: () => ({
          start: () => null,
          fftSize: 0,
          maxDecibels: 0,
          minDecibels: 0,
          connect: (...args) => null,
        }),
        createDelay: (...args) => ({ connect: (...args1) => null }),
        createMediaStreamDestination: () => ({ stream: of() }),
        createAnalyser: () => ({
          start: () => null,
          fftSize: 0,
          maxDecibels: 0,
          minDecibels: 0,
          connect: (...args) => null,
        }),
      };
    },
    writable: false,
  });

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AudioGraphStoreModule],
      providers: [{ provide: WINDOW, useFactory: getWindow }],
    }).compileComponents();
  }));

  it('should create an instance', () => {
    expect(new AudioGraph(service)).toBeTruthy();
  });
});
