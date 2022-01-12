import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { initState } from '../../utils';
import { audioGraphUiAction } from './audio-graph-ui.actions';
import { AUDIO_GRAPH_UI_STATE_DEFAULTS } from './audio-graph-ui.model';
import { AudioGraphUiState } from './audio-graph-ui.store';
import { AudioGraphUiStateModel } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class AudioGraphUiService {
  /**
   * Constructor
   */
  constructor(private readonly store: Store) {
    initState(
      store,
      AUDIO_GRAPH_UI_STATE_DEFAULTS,
      AudioGraphUiState.state,
      audioGraphUiAction.setState
    );
  }

  /**
   * TODO: description
   */
  public getState(): AudioGraphUiStateModel {
    return this.store.selectSnapshot(AudioGraphUiState.state);
  }

  /**
   * TODO: description
   */
  public select<T extends (...args: any[]) => any>(
    selector: T
  ): Observable<ReturnType<T>> {
    return this.store.select(selector);
  }

  /**
   * TODO: description
   */
  public dispatch<T extends keyof typeof audioGraphUiAction>(
    action: T,
    payload?: typeof audioGraphUiAction[T]['payload']
  ) {
    return this.store.dispatch(new audioGraphUiAction[action](payload));
  }
}
