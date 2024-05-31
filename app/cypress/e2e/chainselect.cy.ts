describe('ChainSelect Component', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('selects a source chain', () => {
    // Open the source chain select dropdown
    cy.get('[data-cy="chain-select"]').first().should('exist').find('button').click()

    // Select the Ethereum chain in the list
    cy.get('[data-cy="custom-select-dialog"]')
      .first()
      .should('be.visible')
      .find('button')
      .contains('Ethereum')
      .click()

    // Check that the source chain is selected
    cy.get('[data-cy="chain-select"]').first().should('contain', 'Ethereum')
  })

  it('selects a destination chain', () => {
    // Open the source chain select dropdown
    cy.get('[data-cy="chain-select"]').last().should('exist').find('button').click()

    // Select the Ethereum chain in the list
    cy.get('[data-cy="custom-select-dialog"]')
      .last()
      .should('be.visible')
      .find('button')
      .contains('Polkadot Asset Hub')
      .click()

    // Check that the source chain is selected
    cy.get('[data-cy="chain-select"]').last().should('contain', 'Polkadot Asset Hub')
  })
})
