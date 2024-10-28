import '@testing-library/jest-dom'
import { getDestChainId } from '@/models/chain'
import { getTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { convertAmount, safeConvertAmount, toHuman } from '@/utils/transfer'
import '@testing-library/jest-dom'
import { Mainnet, Testnet } from '../config/registry'

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
    expect(safeConvertAmount(1, Mainnet.WETH)).toBe(BigInt(1000000000000000000))
    expect(safeConvertAmount(0.12, Mainnet.WETH)).toBe(BigInt(120000000000000000))
    expect(safeConvertAmount(123, Mainnet.WETH)).toBe(BigInt(123000000000000000000))
  })

  it('convert input amount to based back to humans', () => {
    const inputs = [1, 10000, 123, 0.35]

    inputs.forEach(x => {
      expect(toHuman(safeConvertAmount(x, Mainnet.WETH)!, Mainnet.WETH)).toBe(x)
    })
  })

  it('gets the right AT-API-compatible destChainId for any given chain', () => {
    // Ethereum-based chains should result in a multilocation
    expect(getDestChainId(Mainnet.Ethereum)).toBe(
      '{"parents":"2","interior":{"X1":{"GlobalConsensus":{"Ethereum":{"chainId":"1"}}}}}',
    )
    expect(getDestChainId(Testnet.Sepolia)).toBe(
      '{"parents":"2","interior":{"X1":{"GlobalConsensus":{"Ethereum":{"chainId":"11155111"}}}}}',
    )

    // Polkadot-native chains should result in a basic chain id
    expect(getDestChainId(Mainnet.AssetHub)).toBe(Mainnet.AssetHub.chainId.toString())
    expect(getDestChainId(Mainnet.Mythos)).toBe(Mainnet.Mythos.chainId.toString())
    expect(getDestChainId(Testnet.RococoAssetHub)).toBe(Testnet.RococoAssetHub.chainId.toString())
  })

  it('convert amount to string', () => {
    expect(convertAmount(0.3, Mainnet.WETH).toString()).toBe('300000000000000000')
  })

  it('fetches the token price', () => {
    expect(getTokenPrice(Mainnet.MYTH.coingeckoId!)).toEqual({ usd: 0.2 })
    //{"type": "Token2", "value": 13})
  })
})
