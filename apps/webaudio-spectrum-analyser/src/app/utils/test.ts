import { Component } from '@angular/core';

/**
 * TODO: description
 */
export function mockAudioContext() {
  Object.defineProperty(window, 'AudioContext', {
    value: () => {
      return {
        suspend: () => null,
        createOscillator: () => ({
          start: () => null,
          type: 'sine',
          frequency: {
            value: 440,
          },
          fftSize: 0,
          maxDecibels: 0,
          minDecibels: 0,
          connect: (...args) => null,
          disconnect: (...args) => null,
        }),
        createDelay: (...args) => ({
          delayTime: {
            value: 0,
          },
          connect: (...args1) => null,
        }),
        createMediaStreamDestination: () => ({ stream: null }),
        createAnalyser: () => ({
          start: () => null,
          fftSize: 0,
          maxDecibels: 0,
          minDecibels: 0,
          connect: (...args) => null,
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
export function mockComponent(selector: string) {
  // eslint-disable-next-line @angular-eslint/use-component-selector
  @Component({
    selector: selector,
    template: '',
  })
  class MockComponent {}
  return MockComponent;
}
