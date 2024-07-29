import {
  clickManualRecipientSwitch,
  connectPJSWallet,
  ensureInvalidForm,
  ensureValidForm,
  inputAmount,
  inputManualRecipient,
  manualRecipientAddress,
  selectChain,
  selectToken,
} from './helpers'

describe('Form', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should fill out the form with manual recipient', () => {
    selectChain('source', 'Asset Hub')
    selectChain('dest', 'Sepolia')
    selectToken('wETH')
    inputAmount('0.03')
    clickManualRecipientSwitch()
    inputManualRecipient(manualRecipientAddress)
    ensureInvalidForm()
    connectPJSWallet('source')
    ensureValidForm() // Only if balance is enough
  })
})
