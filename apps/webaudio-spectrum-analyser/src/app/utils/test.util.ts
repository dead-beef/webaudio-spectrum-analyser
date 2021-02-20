import { ChangeDetectionStrategy, Component } from '@angular/core';

export class MockAudioNode {
  public connect() {}

  public disconnect() {}
}

export class MockAudioContext {
  public sampleRate = 44000;

  public audioWorklet = {
    addModule: () => Promise.resolve(),
  };

  public suspend() {}

  public createBuffer() {
    return {
      numberOfChannels: 2,
      copyToChannel: () => null,
    };
  }

  public createOscillator() {
    return {
      start: () => null,
      type: 'sine',
      frequency: {
        value: 440,
      },
      fftSize: 0,
      maxDecibels: 0,
      minDecibels: 0,
      connect: () => null,
      disconnect: () => null,
    };
  }

  public createDelay() {
    return {
      delayTime: {
        value: 0,
      },
      connect: () => null,
      disconnect: () => null,
    };
  }

  public createGain() {
    return {
      gain: { value: 0 },
      connect: () => null,
      disconnect: () => null,
    };
  }

  public createBufferSource() {
    return {
      connect: () => null,
      disconnect: () => null,
      start: () => null,
      stop: () => null,
    };
  }

  public createMediaStreamDestination() {
    return {
      stream: null,
    };
  }

  public createAnalyser() {
    return {
      start: () => null,
      fftSize: 0,
      maxDecibels: 0,
      minDecibels: 0,
      connect: () => null,
      disconnect: () => null,
    };
  }

  public createIIRFilter() {
    return {
      connect: () => null,
      disconnect: () => null,
    };
  }

  public createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { value: 0 },
      Q: { value: 0 },
      detune: { value: 0 },
      gain: { value: 0 },
      connect: () => null,
      disconnect: () => null,
    };
  }

  public createConvolver() {
    return {
      buffer: null,
      connect: () => null,
      disconnect: () => null,
    };
  }
}

// eslint-disable-next-line require-jsdoc
export function mockAudioContext() {
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: () => 'objectUrl',
  });
  Object.defineProperty(window, 'AudioWorkletNode', {
    value: class {
      public port = {
        postMessage: () => {},
        onmessage: () => {},
      };

      public parameters = {
        get: () => {
          return {};
        },
      };

      public connect() {}

      public disconnect() {}
    },
  });
  Object.defineProperty(window, 'GainNode', {
    value: class {
      public gain = {
        value: 1,
      };

      public context;

      constructor(ctx) {
        this.context = ctx;
      }

      public connect() {}

      public disconnect() {}
    },
  });
  Object.defineProperty(window, 'AudioContext', {
    value: MockAudioContext,
    writable: false,
  });
}

/**
 * TODO: description
 * @param selector
 */
export function mockComponent(selector: string, props?: Record<string, any>) {
  // eslint-disable-next-line @angular-eslint/use-component-selector
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

/**
 * TODO: description
 */
// eslint-disable-next-line max-lines-per-function, require-jsdoc
export function getMockAudioGraph() {
  const ctx = new MockAudioContext();
  return {
    context: ctx,
    stream: null,

    nodes: {
      input: ctx.createDelay(),
      wave: ctx.createOscillator(),
      file: ctx.createDelay(),
      device: ctx.createDelay(),
      worklet: ctx.createDelay(),
      analyser: ctx.createAnalyser(),
      filter: {
        iir: ctx.createIIRFilter(),
        biquad: ctx.createBiquadFilter(),
        convolver: ctx.createConvolver(),
        pitchShifter: ctx.createDelay(),
        worklet: ctx.createDelay(),
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

    fdata: new Float32Array(1),
    tdata: new Float32Array(1),
    autocorrdata: new Float32Array(1),
    prominenceData: new Float32Array(1),
    canAnalyse: true,
    volume: 0.5,
    minPitch: 20,
    maxPitch: 20000,
    recalculatePitch: true,
    threshold: 0.2,

    prominenceRadius: 0,
    prominenceThreshold: 0.1,
    prominenceNormalize: false,
    fftPeakType: 0,
    debug: false,
    minDecibels: -100,
    maxDecibels: 0,
    maxDelay: 5,

    fftSizes: [2048],
    fftSize: 2048,
    smoothing: 0.5,
    sampleRate: 44000,

    pitch: [
      {
        name: 'Test',
        id: 'test',
        calc: () => 0,
        timeDomain: true,
        enabled: true,
        value: 0,
      },
    ],

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
