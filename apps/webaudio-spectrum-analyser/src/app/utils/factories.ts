import { AudioGraph } from '../classes/audio-graph/audio-graph';

/**
 * Window factory.
 */
export function getWindow() {
  return window;
}

/**
 * Document factory
 */
export function getDocument() {
  return window.document;
}

/**
 * Audio graph factory
 */
export function getAudioGraph() {
  return new AudioGraph();
}
