import { LoadingIcon, TokenLogo } from '@velocitylabs-org/turtle-ui'
import { FC } from 'react'
import { ArrowRight } from '@/assets/svg/ArrowRight'
import Account from '@/components/Account'
import { StoredTransfer } from '@/models/transfer'
import { formatOngoingTransferDate } from '@/utils/datetime'
import { formatAmount, isSwap, toHuman } from '@/utils/transfer'
import { colors } from '../../../../tailwind.config'

const OngoingTransfer: FC<{
  transfer: StoredTransfer
}> = ({ transfer }) => {
  return (
    //prettier-ignore
    <div className="hover:bg-turtle-secondary-light-50 mb-2 space-y-2 rounded-[16px] border border-turtle-level3 p-3 hover:cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <LoadingIcon
            className="mr-2 animate-spin"
            size="md"
            strokeWidth={5}
            color={colors['turtle-secondary']}
          />
          <div className="flex items-center text-lg font-normal tracking-[0] text-turtle-foreground sm:text-xl">
            {isSwap(transfer) ? (
              <span className="flex items-center gap-1">
                <span>{formatAmount(toHuman(transfer.destinationAmount, transfer.destinationToken))}</span>
                <TokenLogo token={transfer.destinationToken} sourceChain={transfer.destChain} size={25} />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span>{formatAmount(toHuman(transfer.sourceAmount, transfer.sourceToken))}</span>
                <TokenLogo token={transfer.sourceToken} sourceChain={transfer.sourceChain} size={25} />
              </span>
            )}
          </div>
          {/* From and to Chains */}
          <div className="ml-2 flex h-[24px] items-center space-x-1 rounded-full border border-turtle-level3 p-1">
            <img
              src={transfer.sourceChain.logoURI as string}
              alt="Source Chain"
              width={16}
              height={16}
              className="h-[16px] rounded-full border border-turtle-secondary-dark bg-turtle-background"
            />
            <ArrowRight
              className="h-[0.45rem] w-[0.45rem]"
              fill={colors['turtle-secondary-dark']}
            />
            <img
              src={transfer.destChain.logoURI as string}
              alt="Destination Chain"
              width={16}
              height={16}
              className="h-[16px] w-4 rounded-full border border-turtle-secondary-dark bg-turtle-background"
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
