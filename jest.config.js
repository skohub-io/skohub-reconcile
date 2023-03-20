export default {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: ['<rootDir>/tests/*.test.js'],
  coverageDirectory: './coverage',
  reporters: ['default'],
  transform: {},
}
