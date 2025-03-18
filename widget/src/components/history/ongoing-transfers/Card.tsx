import { StoredTransfer } from '@/models/transfer'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, toHuman } from '@/utils/transfer'
import { FC } from 'react'
import { colors } from '../../../../tailwind.config'
import Account from '@/components/Account'
import { ArrowRight } from '@/assets/svg/ArrowRight'
import LoadingIcon from '@/assets/svg/LoadingIcon'

const OngoingTransfer: FC<{
  transfer: StoredTransfer
}> = ({ transfer }) => {
  return (
    <div className="mb-2 space-y-2 rounded-[16px] border border-turtle-level3 p-3 hover:cursor-pointer hover:bg-turtle-secondary-light/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <LoadingIcon
            className="mr-2 animate-spin"
            width={24}
            height={24}
            strokeWidth={5}
            color={colors['turtle-secondary']}
          />
          <p className="no-letter-spacing text-lg font-normal text-turtle-foreground sm:text-xl">
            {formatAmount(toHuman(transfer.amount, transfer.token))} {transfer.token.symbol}
          </p>
          {/* From and to Chains */}
          <div className="ml-2 flex h-[24px] items-center space-x-1 rounded-full border border-turtle-level3 p-1">
            <img
              src={transfer.sourceChain.logoURI}
              alt="Source Chain"
              width={16}
              height={16}
              className="h-[16px] rounded-full border border-turtle-secondary-dark bg-background"
            />
            <ArrowRight
              className="h-[0.45rem] w-[0.45rem]"
              fill={colors['turtle-secondary-dark']}
            />
            <img
              src={transfer.destChain.logoURI}
              alt="Destination Chain"
              width={16}
              height={16}
              className="h-[16px] w-4 rounded-full border border-turtle-secondary-dark bg-background"
            />
          </div>
        </div>
        <p className="text-right text-sm text-turtle-secondary">
          {formatOngoingTransferDate(transfer.date)}
        </p>
      </div>

      <div className="flex items-center">
        <Account
          network={transfer.sourceChain.network}
          addressType={transfer.sourceChain.supportedAddressTypes?.at(0)}
          address={transfer.sender}
          allowCopy={false}
        />
        <ArrowRight className="mx-3 h-[0.8rem] w-[0.8rem]" fill={colors['turtle-secondary-dark']} />
        <Account
          network={transfer.destChain.network}
          addressType={transfer.destChain.supportedAddressTypes?.at(0)}
          address={transfer.recipient}
          allowCopy={false}
        />
      </div>
    </div>
  )
}

export default OngoingTransfer
