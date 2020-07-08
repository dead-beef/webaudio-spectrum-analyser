import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { AudioGraphState } from './audio-graph.store';

@NgModule({
  imports: [NgxsModule.forFeature([AudioGraphState])],
})
export class AudioGraphStoreModule {}
