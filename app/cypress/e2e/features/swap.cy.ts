describe('Features', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Wallet Connection', () => {
    it('should check if plugin is installed', () => {
      expect(cy).property('initWallet').to.be.a('function')
    })

    it('should connect a wallet and check the balance', () => {
      cy.connectWallet().then(() => {
        cy.getBySel('amount-input-source')
          .findBySel('amount-input')
          .should('have.attr', 'placeholder', '100')
        cy.end()
      })
    })

    it('should connect a wallet, select a destination token and be able to send', () => {
      cy.connectWallet().then(() => {
        cy.getBySel('amount-input-source').findBySel('amount-input').type('2')
        cy.selectTokenByChain('chain-container', 'destination', 'Polkadot', 'DOT')
        cy.contains('Loading fees').should('be.visible')
        cy.get('[data-cy="form-submit"]').should('not.be.disabled')
      })
    })
  })

  describe('Swap', () => {
    it('should fill the whole form and show a disabled form when no wallet is connected', async () => {
      cy.selectTokenByChain('chain-container', 'source', 'Asset Hub', 'DOT')
      cy.getBySel('amount-input-source').findBySel('amount-input').type('1')
      cy.selectTokenByChain('chain-container', 'destination', 'Polkadot', 'DOT')
      cy.get('[data-cy="form-submit"]').should('be.disabled')
      cy.end()
    })
  })
})
