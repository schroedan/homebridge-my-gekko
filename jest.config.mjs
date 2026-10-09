/** @type {import('jest').Config} */
export default {
  collectCoverageFrom: ['src/**/*.ts', '!src/test/**'],
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
