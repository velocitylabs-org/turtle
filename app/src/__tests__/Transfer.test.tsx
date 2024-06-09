import { Direction, resolveDirection } from '@/services/transfer'
import '@testing-library/jest-dom'
import { AssetHub, Ethereum } from './testdata'

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
