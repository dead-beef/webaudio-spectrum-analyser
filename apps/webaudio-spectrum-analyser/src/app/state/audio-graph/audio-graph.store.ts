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
  AudioGraphFilterNode,
  AudioGraphSource,
  AudioGraphSourceNode,
  FftPeakType,
  PitchDetectionId,
} from '../../interfaces';
import { AUDIO_GRAPH, StoreAction } from '../../utils';
import { audioGraphAction } from './audio-graph.actions';
import {
  AUDIO_GRAPH_STATE_DEFAULTS,
  AUDIO_GRAPH_STATE_TOKEN,
  AudioGraphStateModel,
  BiquadState,
  ConvolverState,
  IirState,
  PitchDetectionState,
  PitchShifterState,
  WorkletFilterState,
} from './audio-graph.model';

@State<AudioGraphStateModel>({
  name: AUDIO_GRAPH_STATE_TOKEN,
  defaults: AUDIO_GRAPH_STATE_DEFAULTS,
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
   * Suspended selector
   * @param state
   */
  @Selector()
  public static volume(state: AudioGraphStateModel) {
    return state.volume;
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
  public static smoothing(state: AudioGraphStateModel) {
    return state.smoothing;
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
   * Selector
   * @param state
   */
  @Selector()
  public static workletType(state: AudioGraphStateModel) {
    return state.worklet.type;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static filter(state: AudioGraphStateModel) {
    return state.filter.id;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static biquadState(state: AudioGraphStateModel) {
    return state.filter.biquad;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static iirState(state: AudioGraphStateModel) {
    return state.filter.iir;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static convolverState(state: AudioGraphStateModel) {
    return state.filter.convolver;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static pitchShifterState(state: AudioGraphStateModel) {
    return state.filter.pitchShifter;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static workletFilterState(state: AudioGraphStateModel) {
    return state.filter.worklet;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakType(state: AudioGraphStateModel) {
    return state.fftp.type;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakProminenceRadius(state: AudioGraphStateModel) {
    return state.fftp.prominence.radius;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakProminenceThreshold(state: AudioGraphStateModel) {
    return state.fftp.prominence.threshold;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakProminenceNormalize(state: AudioGraphStateModel) {
    return state.fftp.prominence.normalize;
  }

  /**
   * Set AudioGraph state action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setState)
  public setState(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<AudioGraphStateModel>
  ) {
    this.graph.setState(payload);
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
   * @param payload
   */
  @Action(audioGraphAction.setVolume)
  public setVolume(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.graph.volume = payload;
    return ctx.patchState({ volume: payload });
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphAction.reset)
  public reset(ctx: StateContext<AudioGraphStateModel>) {
    this.graph.resetAnalyserNode().clearData();
    return ctx;
  }

  /**
   * Action
   * @param ctx
   * @param node
   * @param data
   */
  private _setSource(
    ctx: StateContext<AudioGraphStateModel>,
    node: AudioGraphSourceNode,
    data?: any
  ) {
    const state: AudioGraphStateModel = ctx.getState();
    this.graph.disable(state.sourceNode);
    return this.graph.enable(node, data).then(() => {
      return ctx.patchState({ sourceNode: node });
    });
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
    return this._setSource(ctx, payload);
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
    return this._setSource(ctx, payload.node, payload.data);
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
  @Action(audioGraphAction.setSmoothing)
  public setSmoothing(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.graph.smoothing = payload;
    return ctx.patchState({ smoothing: payload });
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
      if (pd.id === id) {
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
   * @param payload
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
    let deviceId: Nullable<string> = payload;
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

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setWorkletType)
  public setWorkletType(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    return this.graph.workletReady.then(() => {
      const param: AudioParam = this.graph.nodes.worklet!.parameters.get(
        'type'
      );
      //console.log(param);
      param.value = payload;
      return ctx.setState(patch({ worklet: patch({ type: payload }) }));
    });
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setFilter)
  public setFilter(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<AudioGraphFilterNode>
  ) {
    this.graph.setFilter(payload);
    return ctx.setState(patch({ filter: patch({ id: payload }) }));
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setIirState)
  public setIirState(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<IirState>
  ) {
    this.graph.setIir(payload);
    return ctx.setState(patch({ filter: patch({ iir: payload }) }));
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setConvolverState)
  public setConvolverState(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<ConvolverState>
  ) {
    this.graph.setConvolver(payload);
    return ctx.setState(patch({ filter: patch({ convolver: payload }) }));
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setBiquadState)
  public setBiquadState(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<BiquadState>
  ) {
    this.graph.setBiquad(payload);
    return ctx.setState(
      patch({
        filter: patch({
          biquad: payload,
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setPitchShifterState)
  public setPitchShifterState(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<PitchShifterState>
  ) {
    this.graph.setPitchShifter(payload);
    return ctx.setState(
      patch({
        filter: patch({
          pitchShifter: payload,
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setWorkletFilterState)
  public async setWorkletFilterState(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<WorkletFilterState>
  ) {
    await this.graph.setWorkletFilterParameters(payload);
    return ctx.setState(
      patch({
        filter: patch({
          worklet: payload,
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setFftPeakType)
  public setFftPeakType(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<FftPeakType>
  ) {
    this.graph.fftPeakType = payload;
    return ctx.setState(patch({ fftp: patch({ type: payload }) }));
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setFftPeakProminenceRadius)
  public setFftPeakProminenceRadius(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.graph.prominenceRadius = payload;
    return ctx.setState(
      patch({
        fftp: patch({
          prominence: patch({
            radius: payload,
          }),
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setFftPeakProminenceThreshold)
  public setFftPeakProminenceThreshold(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.graph.prominenceThreshold = payload;
    return ctx.setState(
      patch({
        fftp: patch({
          prominence: patch({
            threshold: payload,
          }),
        }),
      })
    );
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(audioGraphAction.setFftPeakProminenceNormalize)
  public setFftPeakProminenceNormalize(
    ctx: StateContext<AudioGraphStateModel>,
    { payload }: StoreAction<boolean>
  ) {
    this.graph.prominenceNormalize = payload;
    return ctx.setState(
      patch({
        fftp: patch({
          prominence: patch({
            normalize: payload,
          }),
        }),
      })
    );
  }
}
