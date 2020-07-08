import { Inject, Injectable } from '@angular/core';
import {
  Action,
  createSelector,
  Selector,
  State,
  StateContext,
} from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

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
  public static state(state: AudioGraphStateModel) {
    return state;
  }

  /**
   * Paused selector
   * @param state
   */
  @Selector()
  public static paused(state: AudioGraphStateModel) {
    return state.paused || state.suspended;
  }

  /**
   * Suspended selector
   * @param state
   */
  @Selector()
  public static suspended(state: AudioGraphStateModel) {
    return state.suspended;
  }

  /**
   * Source type selector
   * @param state
   */
  @Selector()
  public static sourceNode(state: AudioGraphStateModel) {
    return state.sourceNode;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static delay(state: AudioGraphStateModel) {
    return state.delay;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftSize(state: AudioGraphStateModel) {
    return state.fftSize;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static minPitch(state: AudioGraphStateModel) {
    return state.pitch.min;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static maxPitch(state: AudioGraphStateModel) {
    return state.pitch.max;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static debug(state: AudioGraphStateModel) {
    return state.debug;
  }

  /**
   * Selector
   * @param id
   */
  public static pitchEnabled(id: PitchDetectionId) {
    return createSelector(
      [AudioGraphState],
      (state: AudioGraphStateModel) => state.pitch[id]
    );
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static waveShape(state: AudioGraphStateModel) {
    return state.wave.shape;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static waveFrequency(state: AudioGraphStateModel) {
    return state.wave.frequency;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static deviceId(state: AudioGraphStateModel) {
    return state.device.id;
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
    this.graph.nodes.input.delayTime.value = payload;
    return ctx.patchState({ delay: payload });
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
    this.graph.fftSize = payload;
    return ctx.patchState({ fftSize: payload });
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
    this.graph.minPitch = payload;
    return ctx.setState(
      patch({
        pitch: patch({ min: payload }),
      })
    );
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
    this.graph.maxPitch = payload;
    return ctx.setState(
      patch({
        pitch: patch({ max: payload }),
      })
    );
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
    this.graph.debug = payload;
    return ctx.patchState({ debug: payload });
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
    const { id, enabled } = payload;
    const data = {};
    data[id] = enabled;
    for (const pd of this.graph.pitch) {
      if (pd.short === id) {
        pd.enabled = enabled;
        break;
      }
    }
    return ctx.setState(patch({ pitch: patch(data) }));
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setWaveShape)
  public setWaveShape(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<OscillatorType>
  ) {
    this.graph.nodes.wave.type = payload;
    return ctx.setState(
      patch({
        wave: patch({ shape: payload }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setWaveFrequency)
  public setWaveFrequency(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.graph.nodes.wave.frequency.value = payload;
    return ctx.setState(
      patch({
        wave: patch({ frequency: payload }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphAction.setDeviceId)
  public setDeviceId(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<string>
  ) {
    if (this.graph.deviceLoading) {
      console.log('device loading');
      return;
    }
    let deviceId: string = payload;
    return this.graph
      .setDevice(payload)
      .catch(err => {
        deviceId = null;
        throw err;
      })
      .finally(() => {
        return ctx.setState(patch({ device: patch({ id: deviceId }) }));
      });
  }
}
