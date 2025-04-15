describe('Features', () => {
  describe('Swap', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('should fill the whole form and show a disabled form when no source wallet is connected', async () => {
      cy.getBySel('chain-container-source').findBySel('chain-select-trigger').click()
      cy.contains('Asset Hub').click()
      cy.contains('DOT').click()
      cy.getBySel('amount-input-source').findBySel('amount-input').type('1')
      // cy.debug()
      // clickManualRecipientSwitch()
      // inputManualRecipient(manualRecipientAddress)
      cy.get('[data-cy="form-submit"]')
        .should('be.disabled')
        .then(() => cy.end())
    })
  })
})
