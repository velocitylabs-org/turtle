import { Direction, resolveDirection } from '@/services/transfer'
import '@testing-library/jest-dom'
import { AssetHub, Centrifuge, Ethereum, HydraDX } from './testdata'

describe('Transfer', () => {
  it('direction ToEthereum', () => {
    expect(resolveDirection(AssetHub, Ethereum)).toBe(Direction.ToEthereum)
    expect(resolveDirection(Centrifuge, Ethereum)).toBe(Direction.ToEthereum)
  })

  it('direction ToPolkadot', () => {
    expect(resolveDirection(Ethereum, AssetHub)).toBe(Direction.ToPolkadot)
    expect(resolveDirection(Ethereum, Centrifuge)).toBe(Direction.ToPolkadot)
  })

  it('direction WithinPolkadot', () => {
    expect(resolveDirection(Centrifuge, AssetHub)).toBe(Direction.WithinPolkadot)
    expect(resolveDirection(AssetHub, Centrifuge)).toBe(Direction.WithinPolkadot)
    expect(resolveDirection(HydraDX, AssetHub)).toBe(Direction.WithinPolkadot)
    expect(resolveDirection(AssetHub, HydraDX)).toBe(Direction.WithinPolkadot)
    expect(resolveDirection(Centrifuge, HydraDX)).toBe(Direction.WithinPolkadot)
    expect(resolveDirection(HydraDX, Centrifuge)).toBe(Direction.WithinPolkadot)
  })
})
