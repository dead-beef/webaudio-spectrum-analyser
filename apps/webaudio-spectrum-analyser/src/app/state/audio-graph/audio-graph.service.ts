import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AudioGraphState } from './audio-graph.store';
import { AudioGraphStateModel } from './audio-graph.model';
import { audioGraphAction } from './audio-graph.actions';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { AudioGraphSource, AudioGraphSourceNode } from '../../interfaces';

import { AUDIO_GRAPH } from '../../utils/injection-tokens';

@Injectable({
  providedIn: 'root',
})
export class AudioGraphService {
  /**
   * Constructor
   * @param store
   * @param graph
   */
  constructor(
    private readonly store: Store,
    @Inject(AUDIO_GRAPH) public readonly graph: AudioGraph
  ) {
    const state = this.store.selectSnapshot(AudioGraphState.getState);
    console.log('state', state);
  }

  /**
   * Sets AudioGraph state
   * @param state
   */
  public setState(state: Partial<AudioGraphStateModel>) {
    return this.store.dispatch(new audioGraphAction.setState(state));
  }

  /**
   * Sets AudioGraph source node
   * @param node
   */
  public setSourceNode(node: AudioGraphSourceNode) {
    return this.store.dispatch(new audioGraphAction.setSourceNode(node));
  }

  /**
   * Sets AudioGraph source
   * @param src
   */
  public setSource(src: AudioGraphSource) {
    return this.store.dispatch(new audioGraphAction.setSource(src));
  }

  /**
   * Sets AudioGraph state
   */
  public play() {
    return this.store.dispatch(new audioGraphAction.play());
  }

  /**
   * Sets AudioGraph state
   */
  public pause() {
    return this.store.dispatch(new audioGraphAction.pause());
  }

  /**
   * Sets AudioGraph state
   */
  public toggle() {
    return this.store.dispatch(new audioGraphAction.toggle());
  }

  /**
   * Sets AudioGraph state
   */
  public reset() {
    return this.store.dispatch(new audioGraphAction.reset());
  }
}
