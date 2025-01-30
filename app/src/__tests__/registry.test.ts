import { error, log } from 'console'

error('This is an error')
log('Something to log')

describe('Token Transfer Routes Registry', () => {
  test('routes should be defined', async () => {
    const { EthereumTokens } = await import('../registry/mainnet/tokens') // ✅ Fixes circular issue
    console.log('Eth:', EthereumTokens.ETH)
  })
})
