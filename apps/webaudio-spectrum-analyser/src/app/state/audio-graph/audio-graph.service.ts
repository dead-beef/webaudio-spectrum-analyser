import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import {
  AudioGraphSource,
  AudioGraphSourceNode,
  PitchDetection,
  PitchDetectionId,
} from '../../interfaces';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { audioGraphAction } from './audio-graph.actions';
import { AudioGraphStateModel } from './audio-graph.model';
import { AudioGraphState } from './audio-graph.store';

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
   * TODO: description
   */
  public getOutputStream(): MediaStream {
    return this.graph.stream;
  }

  /**
   * TODO: description
   */
  public getFftSizes(): number[] {
    return this.graph.fftSizes;
  }

  /**
   * TODO: description
   */
  public getMaxDelay(): number {
    return this.graph.maxDelay;
  }

  /**
   * TODO: description
   */
  public listPitchDetection(): PitchDetection[] {
    return this.graph.pitch;
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

  /**
   * Sets AudioGraph state
   * @param delay
   */
  public setDelay(delay: number) {
    return this.store.dispatch(new audioGraphAction.setDelay(delay));
  }

  /**
   * Sets AudioGraph state
   * @param fftSize
   */
  public setFftSize(fftSize: number) {
    return this.store.dispatch(new audioGraphAction.setFftSize(fftSize));
  }

  /**
   * Sets AudioGraph state
   * @param minPitch
   */
  public setMinPitch(minPitch: number) {
    return this.store.dispatch(new audioGraphAction.setMinPitch(minPitch));
  }

  /**
   * Sets AudioGraph state
   * @param maxPitch
   */
  public setMaxPitch(maxPitch: number) {
    return this.store.dispatch(new audioGraphAction.setMaxPitch(maxPitch));
  }

  /**
   * Sets AudioGraph state
   * @param minPitch
   */
  public setDebug(enable: boolean) {
    return this.store.dispatch(new audioGraphAction.setDebug(enable));
  }

  /**
   * Sets AudioGraph state
   * @param minPitch
   */
  public setPitchDetection(id: PitchDetectionId, enabled: boolean) {
    return this.store.dispatch(
      new audioGraphAction.setPitchDetection({ id, enabled })
    );
  }
}
