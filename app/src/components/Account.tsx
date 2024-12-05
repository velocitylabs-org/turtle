import useLookupName from '@/hooks/useLookupName'
import { AddressType, Network } from '@/models/chain'
import { truncateAddress } from '@/utils/address'
import { cn } from '@/utils/cn'
import Identicon from '@polkadot/react-identicon'
import CopyAddress from './ClipboardCopy'

function Account({
  network,
  addressType,
  address,
  className,
  allowCopy = true,
  size = 14,
}: {
  network: Network
  addressType?: AddressType
  address: string
  className?: string
  allowCopy?: boolean
  size?: number
}) {
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
          className={cn(
            'mr-1 rounded-full border border-turtle-secondary-dark hover:cursor-default',
            className,
          )}
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
          <Identicon
            value={address}
            size={size}
            theme="ethereum"
            className="hover:cursor-default"
          />
        </div>
      )}

      {/* Fallback Account Icon */}
      {!addressType && (
        <div
          className={cn(
            'mr-1 flex items-start overflow-hidden rounded-full border border-turtle-secondary-dark hover:cursor-default',
            className,
            network === 'Ethereum'
              ? 'bg-gradient-to-l from-[#38bdf8] via-[#fb7185] to-[#84cc16]'
              : 'bg-gradient-to-tr from-[#22c55e] via-[#0e7490] to-[#3b82f6]',
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
export default Account
