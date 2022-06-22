import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
//import { PitchDetection, MethodOf } from '../../interfaces';
import { AUDIO_GRAPH, initState } from '../../utils';
import { audioGraphAction } from './audio-graph.actions';
import { AUDIO_GRAPH_STATE_DEFAULTS } from './audio-graph.model';
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
    initState(
      store,
      AUDIO_GRAPH_STATE_DEFAULTS,
      AudioGraphState.initState,
      audioGraphAction.setState
    );
    this.graph.startUpdating();
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
  public getDevices(): Promise<MediaDeviceInfo[]> {
    return this.graph.getDevices();
  }

  /**
   * TODO: description
   */
  public select<T extends (...args: any[]) => any>(
    selector: T
  ): Observable<ReturnType<T>> {
    return this.store.select(selector);
  }
  /*public select<T extends MethodOf<typeof AudioGraphState>>(
    selector: T
  ) : Observable<ReturnType<(typeof AudioGraphState)[typeof selector]>> {
    return this.store.select(AudioGraphState[selector]);
  }*/

  /**
   * TODO: description
   */
  public dispatch<T extends keyof typeof audioGraphAction>(
    action: T,
    payload?: typeof audioGraphAction[T]['payload']
  ) {
    return this.store.dispatch(new audioGraphAction[action](payload));
  }
}
