import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

describe('Features', () => {
  const seed = Cypress.env('seed')
  const address = Cypress.env('address')
  const DAPP_NAME = 'turtle'

  const Alice = {
    address,
    name: 'Alice',
    type: 'sr25519',
    mnemonic: seed,
  } as InjectedAccountWitMnemonic

  describe('Wallet Connection', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should connect to the Alice wallet', () => {
      cy.initWallet([Alice])
      cy.debug()
    })
  })
})
