import { Direction, resolveDirection } from '@/services/transfer'
import '@testing-library/jest-dom'
import { AssetHub, Ethereum, WETH } from './testdata'
import { convertAmount } from '@/utils/transfer'

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
    expect(convertAmount(1, WETH)).toBe(BigInt(1000000000000000000))
    expect(convertAmount(0.12, WETH)).toBe(BigInt(120000000000000000))
    expect(convertAmount(123, WETH)).toBe(BigInt(123000000000000000000))
  })
})
