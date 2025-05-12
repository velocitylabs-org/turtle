import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@paraspell/xcm-router$': '<rootDir>/node_modules/@paraspell/xcm-router/dist/index.d.ts',
    '^@velocitylabs-org/turtle-registry(.*)$': '<rootDir>/../packages/registry/src$1',
  },
}

export default createJestConfig(config)
