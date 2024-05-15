import { Chain } from './chain'
import { Token } from './token'

/**
 * Generic interface for an option that can be selected by the user. Supports both chains and tokens.
 *
 * @remarks Will be changed in the future to fit the needs of the project
 */
export interface SelectOption {
  /** The underlying value of the option. */
  value: Chain | Token
  /** The text to display for the option. */
  label: string
  /** The URI for the logo of the option. */
  logoURI: string
}

export const chainToSelectOption = (chain: Chain | null): SelectOption | null => {
  if (!chain) return null

  return {
    value: chain,
    label: chain.name,
    logoURI: chain.logoURI,
  }
}

export const chainsToSelectOptions = (chains: Chain[]): SelectOption[] => {
  return chains.map((chain) => chainToSelectOption(chain) as SelectOption)
}

export const tokenToSelectOption = (token: Token | null): SelectOption | null => {
  if (!token) return null
  return {
    value: token,
    label: token.symbol ?? token.name,
    logoURI: token.logoURI,
  }
}

export const tokensToSelectOptions = (tokens: Token[]): SelectOption[] => {
  return tokens.map((token) => tokenToSelectOption(token) as SelectOption)
}
