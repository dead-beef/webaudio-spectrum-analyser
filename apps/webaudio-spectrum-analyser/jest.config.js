module.exports = {
  name: 'webaudio-spectrum-analyser',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/webaudio-spectrum-analyser',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
