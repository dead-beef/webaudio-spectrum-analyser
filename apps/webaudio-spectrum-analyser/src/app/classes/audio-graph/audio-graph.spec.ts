import { async, TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { AudioGraphStoreModule } from '../../state/audio-graph/audio-graph.module';
import { getWindow } from '../../utils/factories';
import { WINDOW } from '../../utils/injection-tokens';
import { AudioGraph } from './audio-graph';

describe('AudioGraph', () => {
  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AudioGraphStoreModule],
      providers: [{ provide: WINDOW, useFactory: getWindow }],
    }).compileComponents();
  }));

  it('should create an instance', async () => {
    const graph = new AudioGraph();
    expect(graph).toBeTruthy();
    await graph.workletReady;
    await graph.workletFilterReady;
  });
});
