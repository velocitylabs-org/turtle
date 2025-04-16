import { Alice, DAPP_NAME } from './constants'

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy="${selector}"]`, ...args)
})

Cypress.Commands.add('getBySelLike', (selector, ...args) => {
  return cy.get(`[data-cy*="${selector}"]`, ...args)
})

Cypress.Commands.add('findBySel', { prevSubject: true }, (subject, selector, ...args) => {
  return subject.find(`[data-cy="${selector}"]`, ...args)
})

Cypress.Commands.add('selectTokenByChain', (selector, direction, chain, token) => {
  cy.getBySel(`${selector}-${direction}`).findBySel('chain-select-trigger').click()
  cy.contains(chain).click()
  cy.getBySel(`token-list-${direction}`).contains(token).click()
})

Cypress.Commands.add('connectWallet', () => {
  cy.initWallet([Alice], DAPP_NAME)
  cy.contains('Connect').should('be.visible')
  cy.selectTokenByChain('chain-container', 'source', 'Asset Hub', 'DOT')
  cy.getBySel('chain-container-source').contains('Connect').click()
  cy.contains('Connect Wallet')
    .should('be.visible')
    .then(() => {
      cy.contains('Polkadot.js').click()
      cy.contains('Alice').click()
      cy.contains('Disconnect').should('be.visible')
    })
})
