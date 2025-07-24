import { describe, expect, it } from '@jest/globals'
import { AssetHub, Ethereum, EthereumTokens, getDestChainId, Mythos } from '@velocitylabs-org/turtle-registry'

import { Direction, resolveDirection } from '@/services/transfer'
import { convertAmount, safeConvertAmount, toHuman } from '@/utils/transfer'

describe('Transfer', () => {
  it('direction ToEthereum', () => {
    expect(resolveDirection(AssetHub, Ethereum)).toBe(Direction.ToEthereum)
  })

  it('direction ToPolkadot', () => {
    expect(resolveDirection(Ethereum, AssetHub)).toBe(Direction.ToPolkadot)
  })

  it('direction WithinPolkadot', () => {
    expect(resolveDirection(AssetHub, AssetHub)).toBe(Direction.WithinPolkadot)
  })

  it('direction WithinEthereum', () => {
    expect(resolveDirection(Ethereum, Ethereum)).toBe(Direction.WithinEthereum)
  })
})

describe('Transfer', () => {
  it('convert input amount to based amount', () => {
    expect(safeConvertAmount(1, EthereumTokens.WETH)).toBe(BigInt(1000000000000000000))
    expect(safeConvertAmount(0.12, EthereumTokens.WETH)).toBe(BigInt(120000000000000000))
    expect(safeConvertAmount(123, EthereumTokens.WETH)).toBe(BigInt(123000000000000000000))
  })

  it('convert input amount to based back to humans', () => {
    const inputs = [1, 10000, 123, 0.35]

    inputs.forEach((x) => {
      expect(toHuman(safeConvertAmount(x, EthereumTokens.WETH)!, EthereumTokens.WETH)).toBe(x)
    })
  })

  it('gets the right AT-API-compatible destChainId for any given chain', () => {
    // Ethereum-based chains should result in a multilocation
    expect(getDestChainId(Ethereum)).toBe(
      '{"parents":"2","interior":{"X1":{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}}}}',
    )

    // Polkadot-native chains should result in a basic chain id
    expect(getDestChainId(AssetHub)).toBe(AssetHub.chainId.toString())
    expect(getDestChainId(Mythos)).toBe(Mythos.chainId.toString())
  })

  it('convert amount to string', () => {
    expect(convertAmount(0.3, EthereumTokens.WETH).toString()).toBe('300000000000000000')
  })
})
