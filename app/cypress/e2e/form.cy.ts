import { inputAmount, selectChain, selectToken } from './helpers'

describe('Form', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should fill out form and enable button', () => {
    selectChain('source', 'Sepolia')
    selectChain('dest', 'Asset Hub')
    selectToken('wETH')
    inputAmount('0.12')
  })
})
