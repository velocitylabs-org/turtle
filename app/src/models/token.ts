export interface Token {
  id: string
  name: string
  logoURI: string
  symbol: string
  decimals: number
  address: string
  // The xcm multilocation of an asset serves as a contextual identifier of said asset.
  // Learn more at https://guide.kusama.network/docs/learn/xcm/fundamentals/multilocation-summary
  multilocation: string
  // The coingeko token id, used to fetch the token price. It's not always the token symbol.
  // Examples:
  //   - https://www.coingecko.com/en/coins/bifrost-native-coin
  //   - https://www.coingecko.com/en/coins/weth
  //   - https://www.coingecko.com/en/coins/ethereum
  coingeckoId?: string
}

export function getCoingekoId(token: Token): string {
  return token.coingeckoId ?? token.name.toLocaleLowerCase().replaceAll(' ', '-')
}
