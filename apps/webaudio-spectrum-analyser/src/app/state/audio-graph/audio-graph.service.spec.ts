import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { getMockProviders } from '../../utils/test.util';
import { AudioGraphStoreModule } from './audio-graph.module';
import { AudioGraphService } from './audio-graph.service';

describe('AudioGraphService', () => {
  let service: AudioGraphService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AudioGraphStoreModule],
      providers: getMockProviders(),
    }).compileComponents();
    service = TestBed.inject(AudioGraphService);
  });

  it('should be created', async () => {
    expect(service).toBeDefined();
  });
});
