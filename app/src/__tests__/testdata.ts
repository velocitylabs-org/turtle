import { Chain } from '@/models/chain'

export const Ethereum: Chain = {
  id: 'ethereum',
  name: 'Ethereum',
  logoURI:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  chainId: 1,
}

export const AssetHub: Chain = {
  id: 'polkadot-assethub',
  name: 'Polkadot Asset Hub',
  logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
  chainId: 1000,
}

export const testchains = [AssetHub, Ethereum]

export const testTokens = [
  {
    id: 'weth',
    name: 'Wrapped Ether',
    symbol: 'wETH',
    logoURI: 'https://ucarecdn.com/c01c9021-a497-41b5-8597-9ab4e71440c1/wrapped-eth.png',
  },
]
