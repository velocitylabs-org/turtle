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
}
