import type { Chain, Token } from '@/types'
import { Arbitrum, AssetHub, Ethereum } from './chains'
import { ArbitrumTokens, EthereumTokens, PolkadotTokens } from './tokens'

export type ChainflipSwapPair = [Token, Token]
export type ChainflipRoute = {
  from: Chain
  to: Chain
  pairs: ChainflipSwapPair[]
}

export const chainflipRoutes: ChainflipRoute[] = [
  {
    from: Ethereum,
    to: AssetHub,
    pairs: [
      [EthereumTokens.ETH, PolkadotTokens.DOT],
      [EthereumTokens.ETH, PolkadotTokens.USDC],
      [EthereumTokens.ETH, PolkadotTokens.USDT],
      [EthereumTokens.USDC, PolkadotTokens.DOT],
      [EthereumTokens.USDC, PolkadotTokens.USDC],
      [EthereumTokens.USDC, PolkadotTokens.USDT],
      [EthereumTokens.USDT, PolkadotTokens.DOT],
      [EthereumTokens.USDT, PolkadotTokens.USDC],
      [EthereumTokens.USDT, PolkadotTokens.USDT],
    ],
  },
  {
    from: AssetHub,
    to: Ethereum,
    pairs: [
      [PolkadotTokens.DOT, EthereumTokens.ETH],
      [PolkadotTokens.DOT, EthereumTokens.USDC],
      [PolkadotTokens.DOT, EthereumTokens.USDT],
      [PolkadotTokens.USDC, EthereumTokens.ETH],
      [PolkadotTokens.USDC, EthereumTokens.USDC],
      [PolkadotTokens.USDC, EthereumTokens.USDT],
      [PolkadotTokens.USDT, EthereumTokens.ETH],
      [PolkadotTokens.USDT, EthereumTokens.USDC],
      [PolkadotTokens.USDT, EthereumTokens.USDT],
    ],
  },
  {
    from: Arbitrum,
    to: AssetHub,
    pairs: [
      [ArbitrumTokens.ETH, PolkadotTokens.DOT],
      [ArbitrumTokens.ETH, PolkadotTokens.USDC],
      [ArbitrumTokens.ETH, PolkadotTokens.USDT],
      [ArbitrumTokens.USDC, PolkadotTokens.DOT],
      [ArbitrumTokens.USDC, PolkadotTokens.USDC],
      [ArbitrumTokens.USDC, PolkadotTokens.USDT],
    ],
  },
  {
    from: AssetHub,
    to: Arbitrum,
    pairs: [
      [PolkadotTokens.DOT, ArbitrumTokens.ETH],
      [PolkadotTokens.DOT, ArbitrumTokens.USDC],
      [PolkadotTokens.USDC, ArbitrumTokens.ETH],
      [PolkadotTokens.USDC, ArbitrumTokens.USDC],
      [PolkadotTokens.USDT, ArbitrumTokens.ETH],
      [PolkadotTokens.USDT, ArbitrumTokens.USDC],
    ],
  },
]
