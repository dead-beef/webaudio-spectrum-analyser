import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';

import { setAudioGraphState } from './audio-graph.actions';
import {
  AudioGraphPayload,
  AudioGraphStateModel,
} from './audio-graph.interface';

export const audioGraphAction = {
  setAudioGraphState,
};

export const AUDIO_GRAPH_STATE_TOKEN = new StateToken<AudioGraphStateModel>(
  'AudioGraph'
);

@State<AudioGraphStateModel>({
  name: AUDIO_GRAPH_STATE_TOKEN,
  defaults: {
    paused: true,
    suspended: false,
  },
})
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in
@Injectable()
export class AudioGraphState {
  /**
   * State selector
   * @param state
   */
  @Selector()
  public static getState(state: AudioGraphStateModel) {
    return state;
  }

  /**
   * Paused selector
   * @param state
   */
  @Selector()
  public static getPaused(state: AudioGraphStateModel) {
    return state.paused;
  }

  /**
   * Suspended selector
   * @param state
   */
  @Selector()
  public static getSuspended(state: AudioGraphStateModel) {
    return state.suspended;
  }

  /**
   * Set AudioGraph state action
   * @param ctx
   * @param param1
   */
  @Action(setAudioGraphState)
  public setAudioGraphState(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: AudioGraphPayload
  ) {
    return ctx.patchState(payload);
  }
}
