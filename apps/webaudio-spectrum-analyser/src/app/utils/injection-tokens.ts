import { InjectionToken } from '@angular/core';

import { environment } from '../../environments/environment';
import { AudioGraph } from '../classes/audio-graph/audio-graph';

export const WINDOW = new InjectionToken<Window>('Window');

export const APP_ENV = new InjectionToken<typeof environment>('APP_ENV');

export const AUDIO_GRAPH = new InjectionToken<AudioGraph>('AUDIO_GRAPH');
