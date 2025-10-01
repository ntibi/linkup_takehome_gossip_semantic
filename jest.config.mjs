export default {
  preset: 'ts-jest/presets/default-esm', // ESM preset for ts-jest
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test).ts'],
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Strip .js extension from imports for TS
  },
};