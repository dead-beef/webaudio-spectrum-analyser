module.exports = {
  name: 'webaudio-spectrum-analyser',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/webaudio-spectrum-analyser',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
