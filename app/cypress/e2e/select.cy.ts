import { ensureSelectedChainContains, selectChain } from './helpers'

describe('Select Components', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should swap source and dest', () => {
    // Select Source
    selectChain('source', 'Sepolia')

    // Select Dest
    selectChain('dest', 'Asset Hub')

    // Swap
    selectChain('source', 'Asset Hub')

    // Verify
    ensureSelectedChainContains('source', 'Asset Hub')
    ensureSelectedChainContains('dest', 'Sepolia')
  })
})
