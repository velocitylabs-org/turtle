describe('ChainSelect Component', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should select a source chain', () => {
    // Check that the source chain is empty
    cy.get('[data-cy="chain-select"]').first().should('contain', 'Source')

    // Open the source chain select dropdown
    cy.get('[data-cy="chain-select-trigger"]').first().should('exist').click()

    // Select the Sepolia chain in the list
    cy.get('[data-cy="chain-select"]')
      .first()
      .get('ul')
      .should('be.visible')
      .find('li')
      .contains('Sepolia')
      .click()

    // Check that the source chain is selected
    cy.get('[data-cy="chain-select-value"]').first().should('contain', 'Sepolia')
  })

  it('should select a dest chain', () => {
    // Check that the dest chain is empty
    cy.get('[data-cy="chain-select"]').last().should('contain', 'Destination')

    // Open the dest chain select dropdown
    cy.get('[data-cy="chain-select-trigger"]').last().should('exist').click()

    // Select the Sepolia chain in the list
    cy.get('[data-cy="chain-select"]')
      .last()
      .get('ul')
      .should('be.visible')
      .find('li')
      .contains('Sepolia')
      .click()

    // Check that the dest chain is selected
    cy.get('[data-cy="chain-select-value"]').last().should('contain', 'Sepolia')
  })

  it('should swap source and dest', () => {})

  it('should select a token', () => {})
})
