import { Component } from '@angular/core';

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

export function mockComponent(selector) {
  @Component({
    selector: selector,
    template: '',
  })
  class MockComponent {}
  return MockComponent;
}
