import { Direction, resolveDirection } from '@/services/transfer'
import '@testing-library/jest-dom'
import { Mainnet } from '../config/registry'
import { convertAmount, toHumans } from '@/utils/transfer'

describe('Transfer', () => {
  it('direction ToEthereum', () => {
    expect(resolveDirection(Mainnet.AssetHub, Mainnet.Ethereum)).toBe(Direction.ToEthereum)
  })

  it('direction ToPolkadot', () => {
    expect(resolveDirection(Mainnet.Ethereum, Mainnet.AssetHub)).toBe(Direction.ToPolkadot)
  })

  it('direction WithinPolkadot', () => {
    expect(resolveDirection(Mainnet.AssetHub, Mainnet.AssetHub)).toBe(Direction.WithinPolkadot)
  })

  it('direction WithinEthereum', () => {
    expect(resolveDirection(Mainnet.Ethereum, Mainnet.Ethereum)).toBe(Direction.WithinEthereum)
  })
})

describe('Transfer', () => {
  it('convert input amount to based amount', () => {
    expect(convertAmount(1, Mainnet.WETH)).toBe(BigInt(1000000000000000000))
    expect(convertAmount(0.12, Mainnet.WETH)).toBe(BigInt(120000000000000000))
    expect(convertAmount(123, Mainnet.WETH)).toBe(BigInt(123000000000000000000))
  })

  it('convert input amount to based back to humans', () => {
    let inputs = [1, 10000, 123, 0.35]

    inputs.forEach(x => {
      expect(toHumans(convertAmount(x, Mainnet.WETH)!, Mainnet.WETH)).toBe(x)
    })
  })
})
