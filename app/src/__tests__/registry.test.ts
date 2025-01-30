import { Ethereum } from '@/registry/mainnet/chains'
import { routes } from '@/registry/mainnet/routes'
import { EthereumTokens } from '@/registry/mainnet/tokens'
import { describe, it } from '@jest/globals'
import { error, log } from 'console'

error('test')
log('test')

describe('Token Transfer Routes Registry', () => {
  it('routes should be defined', async () => {
    console.log('Eth:', EthereumTokens.ETH)
    console.log('route:', routes.at(1))
    console.log('chain:', Ethereum)
  })
})
