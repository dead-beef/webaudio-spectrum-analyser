import { async, TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { getMockProviders } from '../../utils/test.util';
import { AudioGraphStoreModule } from './audio-graph.module';
import { AudioGraphService } from './audio-graph.service';

describe('AudioGraphService', () => {
  let service: AudioGraphService;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AudioGraphStoreModule],
      providers: getMockProviders(),
    })
      .compileComponents()
      .then(() => {
        service = TestBed.inject(AudioGraphService);
      });
  }));

  it('should be created', async () => {
    expect(service).toBeDefined();
  });
});
