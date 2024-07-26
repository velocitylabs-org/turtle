import {
  clickManualRecipientSwitch,
  ensureInvalidForm,
  inputAmount,
  inputManualRecipient,
  selectChain,
  selectToken,
} from './helpers'

const manualRecipientAddress = Cypress.env('manualRecipientAddress')

describe('Form', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should fill out the form with manual recipient', () => {
    selectChain('source', 'Asset Hub')
    selectChain('dest', 'Sepolia')
    selectToken('wETH')
    inputAmount('0.05')
    clickManualRecipientSwitch()
    inputManualRecipient(manualRecipientAddress)
    ensureInvalidForm()
  })
})
