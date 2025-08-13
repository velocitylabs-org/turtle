import type { Chain, Token } from '@/types'
import { AssetHub, Ethereum } from './chains'
import { EthereumTokens, PolkadotTokens } from './tokens'

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
  // TBC: Soon deprecated
  // {
  //   from: Ethereum,
  //   to: Polkadot,
  //   pairs: [
  //     [EthereumTokens.ETH, PolkadotTokens.DOT],
  //     [EthereumTokens.USDC, PolkadotTokens.DOT],
  //     [EthereumTokens.USDT, PolkadotTokens.DOT],
  //   ],
  // },
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
  // TBC: Soon deprecated
  // {
  //   from: Polkadot,
  //   to: Ethereum,
  //   pairs: [
  //     [PolkadotTokens.DOT, EthereumTokens.ETH],
  //     [PolkadotTokens.DOT, EthereumTokens.USDC],
  //     [PolkadotTokens.DOT, EthereumTokens.USDT],
  //   ],
  // },
]
