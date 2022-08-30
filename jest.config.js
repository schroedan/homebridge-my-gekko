/* eslint-disable */
module.exports = {
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: './coverage',
  coverageReporters: ['html', 'json-summary', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  fakeTimers: {
    legacyFakeTimers: true,
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
};
