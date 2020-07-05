import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import {
  IAudioGraphService,
  IAudioGraphStateModel,
} from './audio-graph.interface';
import { audioGraphAction, AudioGraphState } from './audio-graph.store';

@Injectable({
  providedIn: 'root',
})
export class AudioGraphService implements IAudioGraphService {
  /**
   * Constructor
   * @param store
   */
  constructor(private readonly store: Store) {}

  public readonly state$ = this.store.select(AudioGraphState.getState);

  public readonly paused$ = this.store.select(AudioGraphState.getPaused);

  public readonly suspended$ = this.store.select(AudioGraphState.getSuspended);

  /**
   * Sets AudioGraph playback state
   * @param newStateValues
   */
  public setState(newStateValues: Partial<IAudioGraphStateModel>) {
    return this.store.dispatch(
      new audioGraphAction.setAudioGraphState(newStateValues)
    );
  }
}
