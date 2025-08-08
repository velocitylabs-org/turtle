import NumberFlow from '@number-flow/react'
import { Chain, TokenAmount } from '@velocitylabs-org/turtle-registry'
import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import { spinnerSize, TokenLogo, Tooltip } from '@velocitylabs-org/turtle-ui'
import { AnimatePresence, motion } from 'framer-motion'
import useTokenPrice from '@/hooks/useTokenPrice'
import { AmountInfo } from '@/models/transfer'
import Delayed from './Delayed'
import FeesBreakdown from './FeesBreakdown'
import InfoIcon from './svg/Info'
import LoadingIcon from './svg/LoadingIcon'

interface TxSummaryProps {
  // Weather it's loading the fees
  loading?: boolean
  // The fees breakdown
  fees: FeeDetails[]
  // The amount the user will receive
  receivingAmount: TokenAmount | null
  // The chain in which the user will get the `receivingAmount`
  destChain: Chain | null

  // The estimate given for the transfer
  durationEstimate?: string

  // // The direction the transfer
  // direction?: Direction

  // canPayFees: boolean
  // canPayAdditionalFees: boolean

  // exceedsTransferableBalance: boolean
  // applyTransferableBalance: () => void

  className?: string
}

export interface FeeDetails {
  // The title of the fee - e.g. 'Delivery Fee'
  title: string
  // The chain in which the fee is charged
  chain: Chain
  // The amount to be charged
  amount: AmountInfo
}

const animationConfig = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: 'auto',
    transition: { type: 'spring', bounce: 0.6, duration: 0.5 },
  },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
}

const numberFlowFormat = {
  notation: 'compact' as const,
  maximumFractionDigits: 3,
}

export default function TxSummary({
  loading,
  fees,
  receivingAmount,
  destChain,
  durationEstimate,
}: TxSummaryProps) {
  const { price: receivingTokenPrice } = useTokenPrice(receivingAmount?.token)
  const totalFeeCostInDollars = fees.map(x => x.amount.inDollars).reduce((acc, x) => acc + x)

  const renderContent = () => {
    if (
      loading ||
      !receivingAmount ||
      !receivingAmount.amount ||
      !receivingAmount.token ||
      !receivingTokenPrice
    ) {
      return (
        <div className="mt-8 flex h-[10rem] h-[182px] w-full animate-pulse flex-col items-center justify-center rounded-[16px] bg-turtle-level1">
          <LoadingIcon
            className="animate-spin"
            width={spinnerSize['lg']}
            height={spinnerSize['lg']}
            color={colors['turtle-secondary']}
          />
          <div className="animate-slide-up-soft mt-2 text-sm font-bold text-turtle-secondary">
            Loading fees
          </div>
          <Delayed millis={7000}>
            <div className="animate-slide-up-soft mt-1 text-center text-xs text-turtle-secondary">
              Sorry that it&apos;s taking so long. Hang on or try again
            </div>
          </Delayed>
        </div>
      )
    }

    return (
      <div className="mt-8 flex flex-col items-start gap-[24px] rounded-[8px] border border-turtle-level3 p-[24px]">
        {/* You'll get section */}
        <div className="flex w-full flex-row items-start justify-between">
          {/* Left */}
          <div className="text-sm leading-none text-turtle-level6">You&apos;ll get</div>

          {/* Right */}
          <div className="-mt-[9px] flex flex-col items-end gap-1">
            <div className="flex flex-row items-baseline gap-2">
              <TokenLogo token={receivingAmount.token} sourceChain={destChain} size={25} />
              <div className="text-[32px] font-medium text-turtle-foreground">
                <NumberFlow value={receivingAmount.amount} format={numberFlowFormat} />
              </div>
            </div>
            <div className={'animate-slide-up -mt-[5px] text-sm leading-none text-turtle-level6'}>
              <NumberFlow
                value={receivingTokenPrice * receivingAmount.amount}
                prefix="$"
                format={numberFlowFormat}
              />
            </div>
          </div>
        </div>

        <div className="border-1 h-1 w-full border-t border-turtle-level3" />

        <div className="flex w-full flex-row items-start justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs leading-none text-turtle-level6">Fee</span>
            <span className="text-sm text-turtle-foreground">
              <NumberFlow value={totalFeeCostInDollars} prefix="$" format={numberFlowFormat} />
            </span>
            <Tooltip showIcon={false} content={<FeesBreakdown fees={fees} />}>
              <InfoIcon width={12} height={12} fill={colors['turtle-level6']} />
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-normal text-xs leading-none text-turtle-level6">Duration</span>
            <span className="text-sm text-turtle-foreground">{durationEstimate}</span>
          </div>
        </div>
      </div>
    )
  }

  // if (!loading && !fees && !bridgingFee) return null

  // const renderContent = () => {
  //   if (loading) {
  //     return (
  //       <div className="mt-4 flex h-[10rem] w-full animate-pulse flex-col items-center justify-center rounded-[8px] bg-turtle-level1">
  //         <LoadingIcon
  //           className="animate-spin"
  //           width={spinnerSize['lg']}
  //           height={spinnerSize['lg']}
  //           color={colors['turtle-secondary']}
  //         />
  //         <div className="animate-slide-up-soft mt-2 text-sm font-bold text-turtle-secondary">
  //           Loading fees
  //         </div>
  //         <Delayed millis={7000}>
  //           <div className="animate-slide-up-soft mt-1 text-center text-xs text-turtle-secondary">
  //             Sorry that it&apos;s taking so long. Hang on or try again
  //           </div>
  //         </Delayed>
  //       </div>
  //     )
  //   }

  //   /*

  //   display: flex;
  //   width: 424px;
  //   padding: 24px;
  //   flex-direction: column;
  //   align-items: flex-start;
  //   gap: 24px;

  //   border-radius: 8px;
  //   border: 1px solid var(--Greyscale-Level-3, #C5D1DB);

  //   */

  //   if (!destinationChain || !destinationTokenAmount || !(destinationTokenAmount.token) || !(destinationTokenAmount.amount)) return <></>
  //   const receiveAmountInDollars = (destPrice ?? 0) * destinationTokenAmount.amount

  //   return (
  //     <div className='flex flex-col items-start p-[24px] gap-[24px] rounded-[8px] border border-turtle-level3'>

  //       <div className='flex flex-row items-start justify-between w-full'>
  //         {/* Left */}
  //         <div className='text-turtle-level6 text-normal leading-none'>You'll get</div>

  //         {/* Right */}
  //         <div className='flex flex-col items-end gap-2'>
  //           <div className='flex flex-row items-baseline h-fit'>
  //           <TokenLogo
  //             token={destinationTokenAmount.token}
  //             sourceChain={destinationChain}
  //             size={25}
  //             className='h-fit'
  //           />
  //           <div className='text-turtle-foreground text-[32px] font-medium'>
  //             <NumberFlow
  //                 value={destinationTokenAmount.amount}
  //                 format={numberFlowFormat}
  //               />
  //           </div>
  //           </div>
  //           <div className={'animate-slide-up mt-[-3px] text-sm text-turtle-level6 leading-none'}>
  //               <NumberFlow
  //                 value={receiveAmountInDollars}
  //                 prefix="$"
  //                 format={numberFlowFormat}
  //               />
  //             </div>
  //         </div>
  //       </div>

  //       <div className='h-1 border-t border-1 border-turtle-level3'/>

  //     </div>
  //   )

  //   // const isAmountTooLow =
  //   //   transferAmount && transferAmount.inDollars < (fees?.inDollars ?? 0) * AMOUNT_VS_FEE_RATIO

  //   // const isBridgeTransfer =
  //   //   direction === Direction.ToEthereum || direction === Direction.ToPolkadot

  //   // const exceedsTransferableBalanceInFees =
  //   //   exceedsTransferableBalance &&
  //   //   transferAmount?.token?.id &&
  //   //   fees?.token?.id &&
  //   //   transferAmount.token.id === fees.token.id

  //   // const exceedsTransferableBalanceInBridgingFee =
  //   //   exceedsTransferableBalance &&
  //   //   !exceedsTransferableBalanceInFees &&
  //   //   transferAmount?.token?.id &&
  //   //   bridgingFee?.token?.id &&
  //   //   transferAmount.token.id === bridgingFee.token.id

  //   // return (
  //   //   <div className={cn('tx-summary p-0 pt-0', className)}>
  //   //     <div className="pt-3">
  //   //       <div className="mt-3 text-center text-lg font-bold text-turtle-foreground md:text-xl">
  //   //         Summary
  //   //       </div>
  //   //       <ul>
  //   //         {/* Execution fees */}
  //   //         {fees && (
  //   //           <li className="mt-4 flex items-start justify-between border-turtle-level2">
  //   //             <div className="items-left flex flex-col">
  //   //               <div className="pt-[3px] text-sm font-bold">
  //   //                 {bridgingFee ? 'Execution fee' : 'Fee'}{' '}
  //   //               </div>
  //   //               {!canPayFees && (
  //   //                 <div className="ml-[-6px] mt-1 flex w-auto flex-row items-center rounded-[6px] border border-black bg-turtle-warning px-2 py-1 text-xs">
  //   //                   <ExclamationMark
  //   //                     width={16}
  //   //                     height={16}
  //   //                     fill={colors['turtle-foreground']}
  //   //                     className="mr-2"
  //   //                   />
  //   //                   <span>You don&apos;t have enough {fees.token.symbol} </span>
  //   //                 </div>
  //   //               )}
  //   //               {exceedsTransferableBalanceInFees && canPayFees && (
  //   //                 <div className="ml-[-6px] mt-1 flex w-auto flex-row items-center rounded-[6px] border border-black bg-turtle-warning px-2 py-1 text-xs">
  //   //                   <ExclamationMark
  //   //                     width={16}
  //   //                     height={16}
  //   //                     fill={colors['turtle-foreground']}
  //   //                     className="mr-2"
  //   //                   />
  //   //                   <span>
  //   //                     We need some of that {fees.token.symbol} to pay fees{' '}
  //   //                     <span
  //   //                       role="button"
  //   //                       onClick={applyTransferableBalance}
  //   //                       className="ml-1 cursor-pointer underline"
  //   //                     >
  //   //                       Ok
  //   //                     </span>
  //   //                   </span>
  //   //                 </div>
  //   //               )}
  //   //             </div>
  //   //             <div className="items-right flex">
  //   //               <div>
  //   //                 <div className="flex items-center text-right text-lg text-turtle-foreground md:text-xl">
  //   //                   {formatAmount(toHuman(fees.amount, fees.token))} {fees.token.symbol}
  //   //                 </div>

  //   //                 {fees.inDollars > 0 && (
  //   //                   <div className="text-right text-sm text-turtle-level4">
  //   //                     ${formatAmount(fees.inDollars)}
  //   //                   </div>
  //   //                 )}
  //   //               </div>
  //   //             </div>
  //   //           </li>
  //   //         )}

  //   //         {/* Bridging fees */}
  //   //         {isBridgeTransfer && bridgingFee && (
  //   //           <li className="mt-4 flex items-start justify-between border-turtle-level2">
  //   //             <div className="items-left flex flex-col">
  //   //               <div className="pt-[3px] text-sm font-bold">Bridging fee</div>
  //   //               {!canPayAdditionalFees && (
  //   //                 <div className="ml-[-6px] mt-1 flex w-auto flex-row items-center rounded-[6px] border border-black bg-turtle-warning px-2 py-1 text-xs">
  //   //                   <ExclamationMark
  //   //                     width={16}
  //   //                     height={16}
  //   //                     fill={colors['turtle-foreground']}
  //   //                     className="mr-2"
  //   //                   />
  //   //                   <span>You don&apos;t have enough {bridgingFee.token.symbol}</span>
  //   //                 </div>
  //   //               )}
  //   //               {exceedsTransferableBalanceInBridgingFee && canPayAdditionalFees && (
  //   //                 <div className="ml-[-6px] mt-1 flex w-auto flex-row items-center rounded-[6px] border border-black bg-turtle-warning px-2 py-1 text-xs">
  //   //                   <ExclamationMark
  //   //                     width={16}
  //   //                     height={16}
  //   //                     fill={colors['turtle-foreground']}
  //   //                     className="mr-2"
  //   //                   />
  //   //                   <span>
  //   //                     We need some of that {bridgingFee.token.symbol} to pay fees{' '}
  //   //                     <span
  //   //                       role="button"
  //   //                       onClick={applyTransferableBalance}
  //   //                       className="ml-1 cursor-pointer underline"
  //   //                     >
  //   //                       Ok
  //   //                     </span>
  //   //                   </span>
  //   //                 </div>
  //   //               )}
  //   //             </div>
  //   //             <div className="items-right flex">
  //   //               <div>
  //   //                 <div className="flex items-center text-right text-lg text-turtle-foreground md:text-xl">
  //   //                   {formatAmount(toHuman(bridgingFee.amount, bridgingFee.token))}{' '}
  //   //                   {bridgingFee.token.symbol}
  //   //                 </div>

  //   //                 {bridgingFee.inDollars > 0 && (
  //   //                   <div className="text-right text-sm text-turtle-level4">
  //   //                     ${formatAmount(bridgingFee.inDollars)}
  //   //                   </div>
  //   //                 )}
  //   //               </div>
  //   //             </div>
  //   //           </li>
  //   //         )}

  //   //         <li className="mt-4 flex items-start justify-between border-turtle-level2">
  //   //           <div className="flex">
  //   //             <div className="pt-[3px] text-sm font-bold">Duration</div>
  //   //           </div>
  //   //           <div className="items-right flex items-center space-x-0.5">
  //   //             <div className="text-right text-lg text-turtle-foreground md:text-xl">
  //   //               {durationEstimate}
  //   //             </div>
  //   //           </div>
  //   //         </li>
  //   //       </ul>

  //   //       {canPayFees && !exceedsTransferableBalance && isAmountTooLow && (
  //   //         <div className="bg-turtle-secondary-transparent my-4 flex flex-row items-center justify-center rounded-[8px] p-2">
  //   //           <ExclamationMark
  //   //             width={20}
  //   //             height={20}
  //   //             fill={colors['turtle-foreground']}
  //   //             className="mr-3"
  //   //           />
  //   //           <div className="text-small">The amount is a bit too low to justify the fees</div>
  //   //         </div>
  //   //       )}
  //   //     </div>
  //   //   </div>
  //   // )
  // }

  return (
    <AnimatePresence>
      <motion.div {...animationConfig}>{renderContent()}</motion.div>
    </AnimatePresence>
  )
}
