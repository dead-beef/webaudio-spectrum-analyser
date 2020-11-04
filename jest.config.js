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
  return cfg.module.rules[0].use.options;
}

module.exports = {
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
      astTransformers: {
        before: [
          'jest-preset-angular/build/InlineFilesTransformer',
          'jest-preset-angular/build/StripStylesTransformer',
        ],
      },
    },
  },
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
    '^.+\\.(c|cpp)$': ['jest-cpp-wasm', getWasmOptions()],
  },
  transformIgnorePatterns: ['node_modules/(?!@ngrx)'],
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  resolver: '@nrwl/jest/plugins/resolver',
  coverageReporters: ['html-spa', 'json-summary'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  cacheDirectory: '/tmp/jest_rs/webaudio-spectrum-analyser',
};
