import { Inject, Injectable } from '@angular/core';
import {
  Action,
  createSelector,
  Selector,
  State,
  StateContext,
} from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { Analyser } from '../../classes/analyser/analyser';
import {
  AnalyserFunctionId,
  AnalyserFunctionState,
  FftPeakType,
} from '../../interfaces';
import { ANALYSER, StoreAction } from '../../utils';
import { analyserAction } from './analyser.actions';
import {
  ANALYSER_STATE_DEFAULTS,
  ANALYSER_STATE_TOKEN,
  AnalyserStateModel,
} from './analyser.model';

@State<AnalyserStateModel>({
  name: ANALYSER_STATE_TOKEN,
  defaults: ANALYSER_STATE_DEFAULTS,
})
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in
@Injectable()
export class AnalyserState {
  /**
   * Constructor
   * @param store
   */
  constructor(@Inject(ANALYSER) public readonly analyser: Analyser) {}

  /**
   * State selector
   * @param state
   */
  @Selector()
  public static state(state: AnalyserStateModel) {
    return state;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static debug(state: AnalyserStateModel) {
    return state.debug;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static minPitch(state: AnalyserStateModel) {
    return state.pitch.min;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static maxPitch(state: AnalyserStateModel) {
    return state.pitch.max;
  }

  /**
   * Selector
   * @param id
   */
  public static functionEnabled(id: AnalyserFunctionId) {
    return createSelector(
      [AnalyserState],
      (state: AnalyserStateModel) => state.functions[id]
    );
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakType(state: AnalyserStateModel) {
    return state.fftp.type;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakProminenceRadius(state: AnalyserStateModel) {
    return state.fftp.prominence.radius;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakProminenceThreshold(state: AnalyserStateModel) {
    return state.fftp.prominence.threshold;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static fftPeakProminenceNormalize(state: AnalyserStateModel) {
    return state.fftp.prominence.normalize;
  }

  /**
   * Set Analyser state action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setState)
  public setState(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<AnalyserStateModel>
  ) {
    this.analyser.setState(payload);
    return ctx.patchState(payload);
  }

  /**
   * Action
   * @param ctx
   */
  @Action(analyserAction.setDebug)
  public setDebug(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<boolean>
  ) {
    this.analyser.debug = payload;
    this.analyser.stateChanged = true;
    return ctx.patchState({ debug: payload });
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setMinPitch)
  public setMinPitch(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.minPitch = payload;
    this.analyser.stateChanged = true;
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
  @Action(analyserAction.setMaxPitch)
  public setMaxPitch(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.maxPitch = payload;
    this.analyser.stateChanged = true;
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
  @Action(analyserAction.setFunctionState)
  public setFunctionState(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<AnalyserFunctionState>
  ) {
    const { id, enabled } = payload;
    this.analyser.functionById[id].enabled = enabled;
    this.analyser.stateChanged = true;
    const data = {};
    data[id] = enabled;
    return ctx.setState(patch({ functions: patch(data) }));
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setFftPeakType)
  public setFftPeakType(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<FftPeakType>
  ) {
    this.analyser.fftPeakType = payload;
    this.analyser.stateChanged = true;
    return ctx.setState(patch({ fftp: patch({ type: payload }) }));
  }

  /**
   * Action
   * @param ctx
   * @param payload
   */
  @Action(analyserAction.setFftPeakProminenceRadius)
  public setFftPeakProminenceRadius(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.prominenceRadius = payload;
    this.analyser.stateChanged = true;
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
  @Action(analyserAction.setFftPeakProminenceThreshold)
  public setFftPeakProminenceThreshold(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<number>
  ) {
    this.analyser.prominenceThreshold = payload;
    this.analyser.stateChanged = true;
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
  @Action(analyserAction.setFftPeakProminenceNormalize)
  public setFftPeakProminenceNormalize(
    ctx: StateContext<AnalyserStateModel>,
    { payload }: StoreAction<boolean>
  ) {
    this.analyser.prominenceNormalize = payload;
    this.analyser.stateChanged = true;
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
