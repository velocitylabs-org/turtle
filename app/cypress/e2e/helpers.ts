export const selectChain = (type: 'source' | 'dest', chainName: string) => {
  const index = type === 'source' ? 0 : 1
  cy.get('[data-cy="chain-select-trigger"]').eq(index).should('exist').click()
  cy.get('[data-cy="chain-select"]')
    .eq(index)
    .get('ul')
    .should('be.visible')
    .find('li')
    .contains(chainName)
    .click()
}

export const selectedChainContains = (type: 'source' | 'dest', chainName: string) => {
  const index = type === 'source' ? 0 : 1
  cy.get('[data-cy="chain-select-value"]').eq(index).should('contain', chainName)
}

export const selectToken = (symbol: string) => {
  cy.get('[data-cy="token-select-trigger"]').should('exist').click()
  cy.get('[data-cy="token-select"]').get('ul').should('be.visible').contains(symbol).click()
}

export const selectedTokenContains = (symbol: string) => {
  cy.get('[data-cy="token-select-symbol"]').should('contain', symbol)
}

export const inputAmount = (amount: string) => {
  cy.get('[data-cy="amount-input"]').should('exist').type(amount)
}
