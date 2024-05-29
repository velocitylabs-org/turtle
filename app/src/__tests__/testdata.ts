import { Chain } from '@/models/chain'

export const Ethereum: Chain = {
  id: 'ethereum',
  name: 'Ethereum',
  logoURI:
    'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
}

export const AssetHub: Chain = {
  id: 'polkadot-assethub',
  name: 'Polkadot Asset Hub',
  logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
}

export const Centrifuge: Chain = {
  id: 'centrifuge',
  name: 'Centrifuge',
  logoURI: 'https://pbs.twimg.com/profile_images/1144565681977024512/KM_4CoiV_400x400.jpg',
}

export const HydraDX: Chain = {
  id: 'hydradx',
  name: 'HydraDx',
  logoURI: 'https://pbs.twimg.com/profile_images/1709149283725836288/t7t9Nu1f_400x400.jpg',
}

export const testchains = [AssetHub, Centrifuge, Ethereum, HydraDX]

export const testTokens = [
  {
    id: 'usdc',
    name: 'USDC',
    symbol: 'USDC',
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png',
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
  },
  {
    id: 'ethereum',
    name: 'Ether',
    symbol: 'ETH',
    logoURI:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  },
]
