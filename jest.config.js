export default {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: ['<rootDir>/**/*.test.js'],
  coverageDirectory: './coverage',
  reporters: ['default'],
  transform: {},
}
