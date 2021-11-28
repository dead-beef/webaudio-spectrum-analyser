import { Injectable } from '@angular/core';
import {
  Action,
  createSelector,
  Selector,
  State,
  StateContext,
} from '@ngxs/store';
import {
  compose,
  insertItem,
  patch,
  removeItem,
  updateItem,
} from '@ngxs/store/operators';

import { ChartLayout, ChartType } from '../../interfaces';
import { StoreAction } from '../../utils';
import { audioGraphUiAction } from './audio-graph-ui.actions';
import {
  AUDIO_GRAPH_UI_STATE_DEFAULTS,
  AUDIO_GRAPH_UI_STATE_TOKEN,
} from './audio-graph-ui.model';
import { AudioGraphUiStateModel, SetChartType } from './interfaces';

@State<AudioGraphUiStateModel>({
  name: AUDIO_GRAPH_UI_STATE_TOKEN,
  defaults: AUDIO_GRAPH_UI_STATE_DEFAULTS,
})
@Injectable()
export class AudioGraphUiState {
  /**
   * Constructor
   * @param store
   */
  constructor() {}

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static state(state: AudioGraphUiStateModel) {
    return state;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static chartCount(state: AudioGraphUiStateModel) {
    return state.chartCount;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static chartLayout(state: AudioGraphUiStateModel) {
    return state.chartLayout;
  }

  /**
   * Selector
   * @param state
   */
  @Selector()
  public static chartTypes(state: AudioGraphUiStateModel) {
    return state.chartType;
  }

  /**
   * Selector
   * @param state
   */
  public static chartType(index: number) {
    return createSelector(
      [AudioGraphUiState],
      (state: AudioGraphUiStateModel) => {
        if (index >= state.chartType.length) {
          return ChartType.TIME_DOMAIN;
        }
        return state.chartType[index];
      }
    );
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphUiAction.setChartCount)
  public setChartCount(
    ctx: StateContext<AudioGraphUiStateModel>,
    { payload }: StoreAction<number>
  ) {
    const state: AudioGraphUiStateModel = ctx.getState();
    let types = state.chartType;
    if (types.length < payload) {
      types = types.slice();
      for (let i = types.length; i < payload; ++i) {
        types.push(ChartType.TIME_DOMAIN);
      }
    } else if (types.length > payload) {
      types = types.slice(0, payload);
    }
    return ctx.patchState({
      chartCount: payload,
      chartType: types,
    });
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphUiAction.setChartType)
  public setChartType(
    ctx: StateContext<AudioGraphUiStateModel>,
    { payload }: StoreAction<SetChartType>
  ) {
    return ctx.setState(
      patch({
        chartType: updateItem<ChartType>(payload.index, payload.type),
      })
    );
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphUiAction.setChartLayout)
  public setChartLayout(
    ctx: StateContext<AudioGraphUiStateModel>,
    { payload }: StoreAction<ChartLayout>
  ) {
    return ctx.patchState({
      chartLayout: payload,
    });
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphUiAction.addChart)
  public addChart(
    ctx: StateContext<AudioGraphUiStateModel>,
    { payload }: StoreAction<number>
  ) {
    const state: AudioGraphUiStateModel = ctx.getState();
    return ctx.setState(
      patch({
        chartCount: state.chartCount + 1,
        chartType: insertItem<ChartType>(ChartType.TIME_DOMAIN, payload + 1),
      })
    );
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphUiAction.removeChart)
  public removeChart(
    ctx: StateContext<AudioGraphUiStateModel>,
    { payload }: StoreAction<number>
  ) {
    const state: AudioGraphUiStateModel = ctx.getState();
    if (state.chartCount <= 1) {
      return ctx;
    }
    return ctx.setState(
      patch({
        chartCount: state.chartCount - 1,
        chartType: removeItem<ChartType>(payload),
      })
    );
  }

  /**
   * TODO: description
   */
  public swapCharts(
    ctx: StateContext<AudioGraphUiStateModel>,
    i: number,
    j: number
  ) {
    const state: AudioGraphUiStateModel = ctx.getState();
    return ctx.setState(
      patch({
        chartType: compose<ChartType[]>(
          updateItem<ChartType>(i, state.chartType[j]),
          updateItem<ChartType>(j, state.chartType[i])
        ),
      })
    );
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphUiAction.moveChartUp)
  public moveChartUp(
    ctx: StateContext<AudioGraphUiStateModel>,
    { payload }: StoreAction<number>
  ) {
    if (payload <= 0) {
      return ctx;
    }
    return this.swapCharts(ctx, payload, payload - 1);
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphUiAction.moveChartDown)
  public moveChartDown(
    ctx: StateContext<AudioGraphUiStateModel>,
    { payload }: StoreAction<number>
  ) {
    const state: AudioGraphUiStateModel = ctx.getState();
    if (payload >= state.chartCount - 1) {
      return ctx;
    }
    return this.swapCharts(ctx, payload, payload + 1);
  }

  /**
   * Action
   * @param ctx
   */
  @Action(audioGraphUiAction.toggleChartLayout)
  public toggleChartLayout(ctx: StateContext<AudioGraphUiStateModel>) {
    const state: AudioGraphUiStateModel = ctx.getState();
    return ctx.patchState({
      chartLayout: (state.chartLayout + 1) % ChartLayout._COUNT,
    });
  }
}
