import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import Image from 'next/image'
import type { FeeDetails } from '@/models/transfer'
import { formatAmount, toHuman } from '@/utils/transfer'
import AlertIcon from './svg/AlertIcon'

interface FeesBreakdownProps {
  fees: FeeDetails[]
}

export default function FeesBreakdown({ fees }: FeesBreakdownProps) {
  return (
    <div className="w-[360px] bg-turtle-foreground p-3 pb-0 text-turtle-background">
      <div className="w-full pb-3 text-center text-sm font-bold">Fees Breakdown</div>
      <ul>
        {fees.map(fee => (
          <li className="pb-4" key={fee.title}>
            <div className="flex flex-row items-center justify-between">
              {/* Left - Token & Type of Fee */}
              <div className="flex flex-row items-center justify-between gap-1">
                <Image
                  src={(fee.chain.logoURI as Record<string, string>).src}
                  alt={fee.chain.name}
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded-full border border-turtle-background bg-turtle-foreground"
                />
                <span className="text-xs">{fee.title}</span>
              </div>

              {/* Right - Amount & Dollars */}
              <div className="flex flex-row items-center justify-between gap-2">
                <span className="text-xs">
                  {formatAmount(toHuman(fee.amount.amount, fee.amount.token))} {fee.amount.token.symbol}
                </span>
                <span className="text-xs font-bold">${formatAmount(fee.amount.inDollars)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Insufficient fees warning */}
      {fees
        .filter(fee => fee.sufficient === 'insufficient')
        .map(fee => (
          <div
            key={`insufficient-${fee.title}`}
            className="mb-3 flex w-auto flex-row items-center rounded-[6px] bg-turtle-error px-1.5 py-1"
          >
            <AlertIcon width={16} height={16} fill="white" className="mr-2 flex-shrink-0" />
            <span className="text-xs text-white">
              You don&apos;t have enough {fee.amount.token.symbol} on {fee.chain.name}
            </span>
          </div>
        ))}

      {/* Undetermined fees warning */}
      {fees
        .filter(fee => fee.sufficient === 'undetermined')
        .map(fee => (
          <div
            key={`undetermined-${fee.title}`}
            className="mb-3 flex w-auto flex-row items-center rounded-[6px] bg-gray-100 px-1.5 py-1"
          >
            <AlertIcon width={16} height={16} fill={colors['turtle-foreground']} className="mr-2 flex-shrink-0" />
            <span className="text-xs text-turtle-foreground">
              Unable to verify {fee.amount.token.symbol} balance on {fee.chain.name}
            </span>
          </div>
        ))}
    </div>
  )
}
