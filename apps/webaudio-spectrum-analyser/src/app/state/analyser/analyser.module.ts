import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { AnalyserState } from './analyser.store';

@NgModule({
  imports: [NgxsModule.forFeature([AnalyserState])],
})
export class AnalyserStoreModule {}
