import { Component } from '@angular/core';

/**
 * TODO: description
 */
export function mockAudioContext() {
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: () => 'objectUrl',
  });
  Object.defineProperty(window, 'AudioWorkletNode', {
    value: () => {
      return {
        connect: () => null,
        disconnect: () => null,
      };
    },
  });
  Object.defineProperty(window, 'AudioContext', {
    value: () => {
      return {
        suspend: () => null,
        audioWorklet: {
          addModule: () => Promise.resolve(),
        },
        createBuffer: () => ({
          numberOfChannels: 2,
          copyToChannel: () => null,
        }),
        createOscillator: () => ({
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
        }),
        createDelay: () => ({
          delayTime: {
            value: 0,
          },
          connect: () => null,
          disconnect: () => null,
        }),
        createGain: () => ({
          gain: { value: 0 },
          connect: () => null,
          disconnect: () => null,
        }),
        createMediaStreamDestination: () => ({ stream: null }),
        createAnalyser: () => ({
          start: () => null,
          fftSize: 0,
          maxDecibels: 0,
          minDecibels: 0,
          connect: () => null,
          disconnect: () => null,
        }),
        createIIRFilter: () => ({
          connect: () => null,
          disconnect: () => null,
        }),
        createBiquadFilter: () => ({
          type: 'lowpass',
          frequency: { value: 0 },
          Q: { value: 0 },
          detune: { value: 0 },
          gain: { value: 0 },
          connect: () => null,
          disconnect: () => null,
        }),
        createConvolver: () => ({
          buffer: null,
          connect: () => null,
          disconnect: () => null,
        }),
      };
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
