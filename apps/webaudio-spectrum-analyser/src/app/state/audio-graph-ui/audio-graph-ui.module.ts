import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { AudioGraphUiState } from './audio-graph-ui.store';

@NgModule({
  imports: [NgxsModule.forFeature([AudioGraphUiState])],
})
export class AudioGraphUiStoreModule {}
