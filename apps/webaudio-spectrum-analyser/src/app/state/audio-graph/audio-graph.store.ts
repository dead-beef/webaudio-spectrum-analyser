import { Inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { AudioGraph } from '../../classes/audio-graph/audio-graph';
import {
  AudioGraphSource,
  AudioGraphSourceNode,
  PitchDetectionId,
} from '../../interfaces';
import { AUDIO_GRAPH } from '../../utils/injection-tokens';
import { StoreAction } from '../../utils/ngxs.util';
import { audioGraphAction } from './audio-graph.actions';
import {
  AUDIO_GRAPH_STATE_TOKEN,
  audioGraphStateDefaults,
  AudioGraphStateModel,
  PitchDetectionState,
} from './audio-graph.model';

@State<AudioGraphStateModel>({
  name: AUDIO_GRAPH_STATE_TOKEN,
  defaults: audioGraphStateDefaults,
})
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in
@Injectable()
export class AudioGraphState {
  /**
   * Constructor
   * @param store
   */
  constructor(@Inject(AUDIO_GRAPH) public readonly graph: AudioGraph) {}

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
    return state.paused || state.suspended;
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
   * Source type selector
   * @param state
   */
  @Selector()
  public static getSourceNode(state: AudioGraphStateModel) {
    return state.sourceNode;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static getDelay(state: AudioGraphStateModel) {
    return state.delay;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static getFftSize(state: AudioGraphStateModel) {
    return state.fftSize;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static getMinPitch(state: AudioGraphStateModel) {
    return state.minPitch;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static getMaxPitch(state: AudioGraphStateModel) {
    return state.maxPitch;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static getDebug(state: AudioGraphStateModel) {
    return state.debug;
  }

  /**
   * Set AudioGraph state action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setState)
  public setState(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<Partial<AudioGraphStateModel>>
  ) {
    return ctx.patchState(payload);
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphAction.play)
  public play(ctx: StateContext<AudioGraphStateModel>) {
    const state: AudioGraphStateModel = ctx.getState();
    if (!(state.paused || state.suspended)) {
      return;
    }
    this.graph.play();
    return ctx.patchState({
      paused: false,
      suspended: false,
    });
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphAction.pause)
  public pause(ctx: StateContext<AudioGraphStateModel>) {
    const state: AudioGraphStateModel = ctx.getState();
    if (state.paused || state.suspended) {
      return;
    }
    this.graph.pause();
    return ctx.patchState({
      paused: true,
      suspended: false,
    });
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphAction.toggle)
  public toggle(ctx: StateContext<AudioGraphStateModel>) {
    const state: AudioGraphStateModel = ctx.getState();
    if (state.paused || state.suspended) {
      return this.play(ctx);
    }
    return this.pause(ctx);
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphAction.reset)
  public reset(ctx: StateContext<AudioGraphStateModel>) {
    this.graph.createAnalysers().clearData();
    return ctx;
  }

  /**
   * Action
   * @param ctx
   * @param node
   * @param data
   */
  private doSetSource(
    ctx: StateContext<AudioGraphStateModel>,
    node: AudioGraphSourceNode,
    data?: any
  ) {
    const state: AudioGraphStateModel = ctx.getState();
    this.graph.disable(state.sourceNode);
    this.graph.enable(node, data);
    return ctx.patchState({ sourceNode: node });
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setSourceNode)
  public setSourceNode(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<AudioGraphSourceNode>
  ) {
    return this.doSetSource(ctx, payload);
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setSource)
  public setSource(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<AudioGraphSource>
  ) {
    return this.doSetSource(ctx, payload.node, payload.data);
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setDelay)
  public setDelay(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    const delay: number = payload;
    this.graph.nodes.input.delayTime.value = delay;
    return ctx.patchState({ delay });
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setFftSize)
  public setFftSize(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    const fftSize: number = payload;
    this.graph.fftSize = fftSize;
    return ctx.patchState({ fftSize });
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setMinPitch)
  public setMinPitch(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    const minPitch: number = payload;
    this.graph.minPitch = minPitch;
    return ctx.patchState({ minPitch });
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setMaxPitch)
  public setMaxPitch(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    const maxPitch: number = payload;
    this.graph.maxPitch = maxPitch;
    return ctx.patchState({ maxPitch });
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphAction.setDebug)
  public setDebug(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<boolean>
  ) {
    const debug: boolean = payload;
    this.graph.debug = debug;
    return ctx.patchState({ debug });
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphAction.setPitchDetection)
  public setPitchDetection(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<PitchDetectionState>
  ) {
    const id: PitchDetectionId = payload.id;
    const enabled: boolean = payload.enabled;
    const patch = {};
    patch[id] = enabled;
    for (const pd of this.graph.pitch) {
      if (pd.short === id) {
        pd.enabled = enabled;
        break;
      }
    }
    return ctx.patchState(patch);
  }
}
