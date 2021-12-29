const nxPreset = require('@nrwl/jest/preset');
const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { paths } = require('./tsconfig.base.json').compilerOptions;
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
  ...nxPreset,
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    },
  },
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': 'jest-preset-angular', //'ts-jest',
    '^.+\\.(c|cpp)$': ['jest-cpp-wasm', getWasmOptions()],
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'mjs', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!@ngrx|@cds|@lit|lit-?|ramda|.*\\.mjs$)',
  ],
  // resolver: '@nrwl/jest/plugins/resolver',
  resolver: 'jest-preset-angular/build/resolvers/ng-jest-resolver.js',
  moduleNameMapper: pathsToModuleNameMapper(paths, {
    prefix: '<rootDir>/../../',
  }),
  coverageReporters: ['html-spa', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/ts/**',
    '!**/*.js',
    '!**/*.stories.ts',
    '!**/*.module.ts',
  ],
  collectCoverage: true,
  cacheDirectory: '/tmp/jest_rs/webaudio-spectrum-analyser',
};
