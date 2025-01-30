import { Ethereum } from '@/registry/mainnet/chains'
import { routes } from '@/registry/mainnet/routes'
import { EthereumTokens } from '@/registry/mainnet/tokens'
import { error, log } from 'console'

error('This is an error')
log('Something to log')

describe('Token Transfer Routes Registry', () => {
  test('routes should be defined', async () => {
    console.log('Eth:', EthereumTokens.ETH)
    console.log('route:', routes.at(1))
    console.log('chain:', Ethereum)
  })
})
