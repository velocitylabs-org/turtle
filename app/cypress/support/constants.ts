import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

export const seed = Cypress.env('seed')
export const address = Cypress.env('address')
export const DAPP_NAME = 'turtle'

export const Alice = {
  address,
  name: 'Alice',
  type: 'sr25519',
  mnemonic: seed,
} as InjectedAccountWitMnemonic
