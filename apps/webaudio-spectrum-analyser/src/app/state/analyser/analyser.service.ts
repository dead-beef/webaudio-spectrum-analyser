import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Analyser } from '../../classes/analyser/analyser';
import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import { ANALYSER, AUDIO_GRAPH, initState } from '../../utils';
import { analyserAction } from './analyser.actions';
import { ANALYSER_STATE_DEFAULTS } from './analyser.model';
import { AnalyserState } from './analyser.store';

@Injectable({
  providedIn: 'root',
})
export class AnalyserService {
  /**
   * Constructor
   */
  constructor(
    private readonly store: Store,
    @Inject(AUDIO_GRAPH) public readonly graph: AudioGraph,
    @Inject(ANALYSER) public readonly analyser: Analyser
  ) {
    initState(
      store,
      ANALYSER_STATE_DEFAULTS,
      AnalyserState.state,
      analyserAction.setState
    );
    graph.onUpdate(paused => analyser.update(paused, graph.nodes.analyser));
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
  public dispatch<T extends keyof typeof analyserAction>(
    action: T,
    payload?: typeof analyserAction[T]['payload']
  ) {
    return this.store.dispatch(new analyserAction[action](payload));
  }
}
