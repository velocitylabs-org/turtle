import { Chain } from '@/models/chain'
import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { hexToU8a, isHex } from '@polkadot/util'
import { isAddress } from 'viem/utils'

/**
 * Truncate a blockchain address by showing the beginning and end parts.
 *
 * @param str - The address string to be truncated.
 * @param start - Number of characters to show from the start. Default is 4.
 * @param end - Number of characters to show from the end. Default is 4.
 * @returns The truncated address or an empty string if the input string is empty.
 */
export const truncateAddress = (str: string, start: number = 4, end: number = 4) => {
  if (!str || str.length === 0) return ''
  if (str.length <= start + end) return str

  const startStr = str.substring(0, start)
  const endStr = end > 0 ? str.substring(str.length - end) : ''

  return `${startStr}...${endStr}`.toLowerCase()
}

/**
 * Validate if a given address is a legitimate address of a specific chain.
 *
 * @param address - The address string to be validated.
 * @param chain - The chain to validate the address against.
 * @returns True if the address is a valid address of the chain, false otherwise.
 */
export const isValidAddressOfChain = (address: string, chain: Chain): boolean => {
  // TODO: Implement this function

  return true
}

/**
 * Validate if a given address is a legitimate Ethereum address.
 *
 * @param address - The address string to be validated.
 * @returns True if the address is a valid Ethereum address, false otherwise.
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return isAddress(address)
}

/**
 * Validate if a given address is a legitimate Substrate address.
 *
 * @param address - The address string to be validated.
 * @returns True if the address is a valid Substrate address, false otherwise.
 */
export const isValidSubstrateAddress = (address: string): boolean => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}
