import { Sender } from '@/hooks/useTransfer'
import { WalletInfo } from '@/hooks/useWallet'
import { AddressType } from '@/models/chain'
import { ManualRecipient } from '@/models/select'
import type { InjectedAccount } from '@polkadot/extension-inject/types'
import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { hexToU8a, isHex, u8aToHex } from '@polkadot/util'
import { JsonRpcSigner } from 'ethers'
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
 * Validate if a given address is a legitimate address of a specific address type such as ss58 or evm address.
 *
 * @param address - The address string to be validated.
 * @param types - The address types to validate the address against. Only one type needs to match.
 * @returns True if the address is a valid address of the network, false otherwise.
 */
export const isValidAddressType = (address: string, types: AddressType[]): boolean => {
  for (const type of types) {
    switch (type) {
      case 'evm': {
        if (isValidEthereumAddress(address)) {
          return true
        }
        break
      }
      case 'ss58': {
        if (isValidSubstrateAddress(address)) {
          return true
        }
        break
      }
      default:
        console.log('Invalid type:', type)
    }
  }
  return false
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

/**
 * Get the recipient address based on the enabled manual input and the connected destination wallet.
 * @remarks It doesn't check whether the address is valid or not
 * */
export const getRecipientAddress = (manualRecipient: ManualRecipient, wallet?: WalletInfo) => {
  return manualRecipient.enabled ? manualRecipient.address : wallet?.sender?.address
}

/** Get the transfer sender address from the sender origin base (Substrate or Ethereum)*/
export const getSenderAddress = async (sender: Sender): Promise<string> =>
  sender instanceof JsonRpcSigner ? await sender.getAddress() : (sender as InjectedAccount).address

/** Get a placeholder address for a specific type. Can be used to prefetch the fees before address input, as fees shouldn't differ. */
export const getPlaceholderAddress = (type: AddressType): string => {
  switch (type) {
    case 'evm':
      return '0xC1af060ab8213AD5EE2Dab1a5891245eBe756400' // Velocity Address
    case 'ss58':
      return '5EkE3p9hnUi5p14d7pJnDBjiNYqPNPSutKbyAuvV3mFGGxPi' // Velocity Address
  }
}
/**
 * Return the AccountId32 reprsentation of the given `address`. It should represent the same
 * wallet across any chain in the Polkadot ecosystem.
 *
 * @param address - the base address to decode
 * @returns the AccountId32 presentation of `address`
 */
export function getAccountId32(address: string): string {
  return u8aToHex(decodeAddress(address))
}
