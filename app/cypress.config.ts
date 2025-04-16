import { defineConfig } from 'cypress'
import { config } from 'dotenv'

config({ path: '.env.test.local' })

const seedPhrase = process.env.E2E_SEED_PHRASE
const accountAddress = process.env.E2E_ACCOUNT_ADDRESS
const manualRecipientAddress = process.env.E2E_MANUAL_RECIPIENT_ADDRESS

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
  },
  env: {
    seed: seedPhrase,
    address: accountAddress,
    manualRecipientAddress: manualRecipientAddress,
  },
})
