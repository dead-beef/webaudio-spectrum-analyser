import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { NgxsModule } from '@ngxs/store';

import { AnalyserStoreModule } from '../state/analyser/analyser.module';
import { AudioGraphStoreModule } from '../state/audio-graph/audio-graph.module';
import { AudioGraphUiStoreModule } from '../state/audio-graph-ui/audio-graph-ui.module';
import { ANALYSER, AUDIO_GRAPH } from './injection-tokens';

export function mockComponent(selector: string, props?: Record<string, any>) {
  @Component({
    selector: selector,
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class MockComponent {
    /**
     * Constructor
     */
    constructor() {
      if (props) {
        Object.assign(this, props);
      }
    }
  }
  return MockComponent;
}

// eslint-disable-next-line max-lines-per-function -- TODO: refactor
export function getMockAudioGraph() {
  const ctx = new AudioContext();
  return {
    context: ctx,
    stream: null,

    nodes: {
      input: ctx.createDelay(),
      wave: ctx.createOscillator(),
      file: ctx.createDelay(),
      device: ctx.createDelay(),
      worklet: new AudioWorkletNode(ctx, '', {}),
      analyser: ctx.createAnalyser(),
      filter: {
        iir: ctx.createIIRFilter([1, 0, 0], [1, 0, 0]),
        biquad: ctx.createBiquadFilter(),
        convolver: ctx.createConvolver(),
        pitchShifter: ctx.createDelay(),
        worklet: new AudioWorkletNode(ctx, '', {}),
      },
    },

    workletFactory: () => Promise.resolve(),
    workletReady: Promise.resolve(),
    workletFilterReady: Promise.resolve(),
    filter: 0,

    paused: true,
    suspended: true,
    deviceLoading: false,
    deviceStream: null,

    debug: false,
    minDecibels: -100,
    maxDecibels: 0,
    maxDelay: 5,

    fftSizes: [2048],
    fftSize: 2048,
    smoothing: 0.5,
    sampleRate: 44000,

    destroy: () => {},
    play: function () {
      return this;
    },
    pause: function () {
      return this;
    },
    enable: () => Promise.resolve(),
    disable: function () {
      return this;
    },
    setFilter: function () {
      return this;
    },
    setIir: function () {
      return this;
    },
    setBiquad: function () {
      return this;
    },
    setConvolver: function () {
      return this;
    },
    setPitchShifter: function () {
      return this;
    },
    setWorkletSourceParameters: function () {
      return this;
    },
    setWorkletFilterParameters: function () {
      return this;
    },
    setState: function () {
      return this;
    },
    resetAnalyserNode: function () {
      return this;
    },
    clearData: function () {
      return this;
    },
    indexOfFrequency: () => 0,
    getDevices: () => Promise.resolve([]),
    setDevice: () => Promise.resolve(),
    setElement: function () {
      return this;
    },
    onUpdate: function () {
      return this;
    },
    offUpdate: function () {
      return this;
    },
    startUpdating: function () {
      return this;
    },
    stopUpdating: function () {
      return this;
    },
  };
}

/**
 * TODO: description
 */
export function getMockAnalyser() {
  const fn = (id, value) => {
    return {
      id,
      name: id,
      calc: x => x,
      enabled: false,
      value: value,
      updated: false,
    };
  };
  const fns = [
    fn('autocorr', new Float32Array()),
    fn('prominence', new Float32Array()),
    fn('cepstrum', new Float32Array()),

    fn('RMS', 0),
    fn('ZCR', 0),
    fn('FFTM', 0),
    fn('FFTP', 0),
    fn('AC', 0),
    fn('CM', 0),
    fn('CP', 0),
  ];

  return {
    fdata: new Float32Array(1),
    tdata: new Float32Array(1),
    canAnalyse: true,
    hasNan: false,
    volume: 0.5,
    minPitch: 20,
    maxPitch: 20000,
    rmsThreshold: 0,

    prominenceRadius: 0,
    prominenceThreshold: 0.1,
    prominenceNormalize: false,
    fftPeakType: 0,

    minDecibels: -100,
    maxDecibels: 0,
    fftSize: 2048,
    sampleRate: 44000,

    functions: fns,
    functionById: Object.fromEntries(fns.map(f => [f.id, f])),
    FREQUENCY_DOMAIN_FUNCTION_IDS: [],
    TIME_DOMAIN_FUNCTION_IDS: [],

    get: k => 0,

    getOptional: k => null,

    getName: k => '',

    setState: function () {
      return this;
    },

    clearData: function () {
      return this;
    },

    update: function () {
      return this;
    },
  };
}

/**
 * TODO: description
 */
export function getMockProviders() {
  return [
    {
      provide: AUDIO_GRAPH,
      useFactory: getMockAudioGraph,
    },
    {
      provide: ANALYSER,
      useFactory: getMockAnalyser,
    },
  ];
}

/**
 * TODO: description
 */
export function getComponentImports() {
  return [
    BrowserModule,
    CommonModule,
    ClarityModule,
    FormsModule,
    ReactiveFormsModule,
    NgxsModule.forRoot([]),
    AudioGraphStoreModule,
    AudioGraphUiStoreModule,
    AnalyserStoreModule,
  ];
}
