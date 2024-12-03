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
