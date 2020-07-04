import { actionConstructor } from '../../utils/ngxs.util';
import { AudioGraphPayload } from './audio-graph.interface';

const createAction = actionConstructor('AudioGraph');

export const setAudioGraphState = createAction<AudioGraphPayload>('set state');
