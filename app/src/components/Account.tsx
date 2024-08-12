import Identicon from '@polkadot/react-identicon'

import useLookupName from '@/hooks/useLookupName'
import { Network } from '@/models/chain'
import { TransferResult, TxStatus } from '@/models/transfer'
import { truncateAddress } from '@/utils/address'
import { cn } from '@/utils/cn'

import CopyAddress from './ClipboardCopy'

function Account({
  network,
  address,
  transferResult,
  allowCopy = true,
}: {
  network: Network
  address: string
  transferResult?: TransferResult
  allowCopy?: boolean
}) {
  const accountName = useLookupName(network, address)
  const accountDisplay = accountName ? accountName : truncateAddress(address, 4, 4)

  return (
    <div className="flex items-center gap-x-1">
      {network === Network.Polkadot ? (
        <Identicon
          value={address}
          size={14}
          theme="polkadot"
          className={cn(
            'rounded-full border',
            !transferResult
              ? 'border-turtle-secondary-dark'
              : transferResult === TxStatus.Succeeded
                ? 'border-black'
                : 'border-turtle-error-dark',
          )}
        />
      ) : (
        <div
          className={cn(
            'h-4 w-4 rounded-full border bg-gradient-to-r from-violet-400 to-purple-300',
            !transferResult
              ? 'border-turtle-secondary-dark'
              : transferResult === TxStatus.Succeeded
                ? 'border-black'
                : 'border-turtle-error-dark',
          )}
        />
      )}
      {allowCopy ? (
        <CopyAddress content={accountDisplay} address={address} />
      ) : (
        <p className="text-sm">{accountDisplay}</p>
      )}
    </div>
  )
}
export default Account
