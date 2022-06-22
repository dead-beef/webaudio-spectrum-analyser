import { StaticProvider } from '@angular/core';

import { Analyser } from './classes/analyser/analyser';
import { AudioGraph } from './classes/audio-graph/audio-graph';
import { AudioMath } from './classes/audio-math/audio-math';
import { ANALYSER, AUDIO_GRAPH } from './utils/injection-tokens';

/**
 * TODO: description
 */
export async function appLoad(): Promise<StaticProvider[]> {
  console.log('appLoad');
  await AudioMath.init();
  const graph = await AudioGraph.create();
  const analyser = new Analyser();
  const providers: StaticProvider[] = [
    { provide: AUDIO_GRAPH, useValue: graph },
    { provide: ANALYSER, useValue: analyser },
  ];
  console.log('appLoad', providers);
  return providers;
}
