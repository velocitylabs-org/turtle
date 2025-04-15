import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jest-environment-jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@paraspell/xcm-router$': '<rootDir>/node_modules/@paraspell/xcm-router/dist/index.d.ts',
  },
}

export default createJestConfig(config)
