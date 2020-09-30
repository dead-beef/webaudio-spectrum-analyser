const webpackConfig = require('./webpack.config');

function getWasmOptions() {
  const cfg = webpackConfig({
    mode: 'development',
    resolve: {
      extensions: [],
    },
    module: {
      rules: [],
    },
  });
  return cfg.module.rules[0].use[0].options;
}

module.exports = {
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
      astTransformers: [
        'jest-preset-angular/build/InlineFilesTransformer',
        'jest-preset-angular/build/StripStylesTransformer',
      ],
    },
  },
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
    '^.+\\.(c|cpp)$': ['jest-cpp-wasm', getWasmOptions()],
  },
  transformIgnorePatterns: ['node_modules/(?!@ngrx)'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  resolver: '@nrwl/jest/plugins/resolver',
  coverageReporters: ['html'],
  collectCoverage: true,
  cacheDirectory: '/tmp/jest_rs/webaudio-spectrum-analyser',
};
