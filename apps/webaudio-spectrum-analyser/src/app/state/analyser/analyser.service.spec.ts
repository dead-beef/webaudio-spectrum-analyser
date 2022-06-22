import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { getMockProviders } from '../../utils/test.util';
import { AnalyserStoreModule } from './analyser.module';
import { AnalyserService } from './analyser.service';

describe('AnalyserService', () => {
  let service: AnalyserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), AnalyserStoreModule],
      providers: getMockProviders(),
    }).compileComponents();
    service = TestBed.inject(AnalyserService);
  });

  it('should be created', async () => {
    expect(service).toBeDefined();
  });
});
