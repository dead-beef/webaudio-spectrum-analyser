import { ChangeDetectionStrategy, Component } from '@angular/core';

/* eslint-disable max-lines-per-function,require-jsdoc */

export function mockAudioContext() {
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: () => 'objectUrl',
  });
  Object.defineProperty(window, 'AudioWorkletNode', {
    value: class {
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
    value: class {
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
    },
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
 * TODO: Mock audio graph factory
 */
/*export function getMockAudioGraph() {
  return new AudioGraph();
}*/
