import { defineConfig } from 'cypress'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.test.local' })

const seedPhrase = process.env.E2E_SEED_PHRASE || ''
const accountAddress = process.env.E2E_ACCOUNT_ADDRESS || ''

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
  env: {
    seed: seedPhrase,
    address: accountAddress,
  },
})
