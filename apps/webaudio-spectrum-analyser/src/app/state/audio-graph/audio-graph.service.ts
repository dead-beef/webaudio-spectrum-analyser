import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { audioGraphAction, AudioGraphState } from './audio-graph.store';
import { AudioGraphStateModel } from './audio-graph.interface';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';

@Injectable({
  providedIn: 'root',
})
export class AudioGraphService {
  /**
   * Constructor
   * @param store
   */
  constructor(private readonly store: Store) {}

  public readonly graph = new AudioGraph();

  public readonly state$ = this.store.select(AudioGraphState.getState);

  public readonly paused$ = this.store.select(AudioGraphState.getPaused);

  public readonly suspended$ = this.store.select(AudioGraphState.getSuspended);

  /**
   * Sets AudioGraph playback state
   * @param newStateValues
   */
  public setState(newStateValues: Partial<AudioGraphStateModel>) {
    return this.store.dispatch(
      new audioGraphAction.setAudioGraphState(newStateValues)
    );
  }
}
