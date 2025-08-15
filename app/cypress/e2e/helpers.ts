import type { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const DAPP_NAME = 'turtle'

const seed = Cypress.env('seed')
const seedAccountAddress = Cypress.env('address')
export const manualRecipientAddress = Cypress.env('manualRecipientAddress')

const Alice = {
  address: seedAccountAddress,
  name: 'Alice',
  type: 'sr25519',
  mnemonic: seed,
} as InjectedAccountWitMnemonic

export const selectChain = (type: 'source' | 'dest', chainName: string) => {
  const index = type === 'source' ? 0 : 1
  cy.get('[data-cy="chain-select-trigger"]').eq(index).should('exist').click()
  cy.get('[data-cy="chain-select"]').eq(index).get('ul').should('be.visible').find('li').contains(chainName).click()
}

export const ensureSelectedChainContains = (type: 'source' | 'dest', chainName: string) => {
  const index = type === 'source' ? 0 : 1
  cy.get('[data-cy="chain-select-value"]').eq(index).should('contain', chainName)
}

export const selectToken = (symbol: string) => {
  cy.get('[data-cy="token-select-trigger"]').should('exist').click()
  cy.get('[data-cy="token-select"]').get('ul').should('be.visible').find('li').contains(symbol).click()
}
export const inputAmount = (amount: string) => {
  cy.get('[data-cy="amount-input"]').should('exist').type(amount)
}

export const clickWalletConnectButton = (type: 'source' | 'dest') => {
  const index = type === 'source' ? 0 : 1
  cy.get('[data-cy="connect-button"]').eq(index).find('button').click()
}

export const clickManualRecipientSwitch = () => {
  cy.get('[data-cy="switch"]').click()
}

export const ensureInvalidForm = () => {
  cy.get('[data-cy="form-submit"]').should('be.disabled')
}

export const ensureValidForm = () => {
  cy.get('[data-cy="form-submit"]').should('not.be.disabled')
}

export const inputManualRecipient = (address: string) => {
  cy.get('[data-cy="manual-recipient-input"]').type(address)
}

export const connectPJSWallet = (type: 'source' | 'dest') => {
  cy.initWallet([Alice])
  clickWalletConnectButton(type)
  cy.contains('Polkadot.js').click() // select extension

  cy.getAuthRequests().then(authRequests => {
    const requests = Object.values(authRequests)
    // we should have 1 connection request to the wallet
    cy.wrap(requests.length).should('eq', 1)
    // this request should be from the application DAPP_NAME
    cy.wrap(requests[0].origin).should('eq', DAPP_NAME)
    cy.approveAuth(requests[0].id, [Alice.address])
  })

  cy.contains('Alice').click() // select account
}
