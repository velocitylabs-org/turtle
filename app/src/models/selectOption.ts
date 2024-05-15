import { Chain } from './chain'
import { Token } from './token'

/**
 * Generic interface for an option that can be selected by the user.
 *
 * @remarks Will be changed in the future to fit the needs of the project
 */
export interface SelectOption<T> {
  /** The underlying value of the option. */
  value: T
  /** The text to display for the option. */
  label: string
  /** The URI for the logo of the option. */
  logoURI: string
}

export const chainToSelectOption = (chain: Chain): SelectOption<Chain> => {
  return {
    value: chain,
    label: chain.name,
    logoURI: chain.logoURI,
  }
}

export const chainsToSelectOptions = (chains: Chain[]): SelectOption<Chain>[] => {
  return chains.map((chain) => chainToSelectOption(chain) as SelectOption<Chain>)
}

export const tokenToSelectOption = (token: Token): SelectOption<Token> => {
  return {
    value: token,
    label: token.symbol ?? token.name,
    logoURI: token.logoURI,
  }
}

export const tokensToSelectOptions = (tokens: Token[]): SelectOption<Token>[] => {
  return tokens.map((token) => tokenToSelectOption(token) as SelectOption<Token>)
}
