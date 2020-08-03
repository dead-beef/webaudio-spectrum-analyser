import { Capacitor } from '@capacitor/core';

export const environment = {
  production: true,
  debug: false,
  platform: Capacitor.getPlatform(),
  throttle: 100,
  link: 'https://github.com/dead-beef/webaudio-spectrum-analyser',
};
