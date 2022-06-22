import 'jest-preset-angular/setup-jest';
import 'jest-canvas-mock';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

//import { AudioMath } from './app/classes/audio-math/audio-math';

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

  public close() {}

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

//module.exports = async () => {
mockAudioContext();

//await AudioMath.init();

getTestBed().resetTestEnvironment();
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { teardown: { destroyAfterEach: false } }
);
//};
