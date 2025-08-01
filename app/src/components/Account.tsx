import Identicon from '@polkadot/react-identicon'
import type { AddressType, Network } from '@velocitylabs-org/turtle-registry'
import { cn } from '@velocitylabs-org/turtle-ui'
import useLookupName from '@/hooks/useLookupName'
import { truncateAddress } from '@/utils/address'
import CopyAddress from './ClipboardCopy'

interface AccountProps {
  network: Network
  addressType?: AddressType
  address: string
  className?: string
  allowCopy?: boolean
  size?: number
}

export default function Account({
  network,
  addressType,
  address,
  className,
  allowCopy = true,
  size = 14,
}: AccountProps) {
  const accountName = useLookupName(network, address)
  const accountDisplay = accountName ? accountName : truncateAddress(address, 4, 4)

  return (
    <div className="flex items-center gap-x-1">
      {/* Account Icon Substrate */}
      {addressType === 'ss58' && (
        <Identicon
          value={address}
          size={size}
          theme="polkadot"
          className={cn('mr-1 rounded-full border border-turtle-secondary-dark hover:cursor-default', className)}
        />
      )}

      {/* Account Icon EVM */}
      {addressType === 'evm' && (
        <div
          className={cn(
            'mr-1 flex items-start overflow-hidden rounded-full border border-turtle-secondary-dark hover:cursor-default',
            className,
          )}
          style={{ width: size, height: size }}
        >
          <Identicon value={address} size={size} theme="ethereum" className="hover:cursor-default" />
        </div>
      )}

      {/* Fallback Account Icon */}
      {!addressType && (
        <div
          className={cn(
            'mr-1 flex items-start overflow-hidden rounded-full border border-turtle-secondary-dark hover:cursor-default',
            className,
            network === 'Ethereum'
              ? 'bg-gradient-to-tr from-green-400 to-blue-500'
              : 'bg-gradient-to-tr from-indigo-500 to-pink-500',
          )}
          style={{ width: size, height: size }}
        />
      )}

      {/* Copy Address  */}
      {allowCopy ? (
        <CopyAddress content={accountDisplay} address={address} />
      ) : (
        <p className="text-sm">{accountDisplay}</p>
      )}
    </div>
  )
}
