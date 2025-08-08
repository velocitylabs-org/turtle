import Image from 'next/image'
import { FeeDetails } from './TxSummary'

interface FeesBreakdownProps {
  fees: FeeDetails[]
}

export default function FeesBreakdown({fees}: FeesBreakdownProps) {
  return (
    <div className="w-[359px] bg-turtle-foreground p-4 pb-0 text-turtle-background">
      <div className="w-full pb-4 text-center text-sm font-bold">Fees Breakdown</div>
      <ul>
        {fees.map(fee => (
          <li className="pb-4">
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
                  {fee.amount.amount} {fee.amount.token.symbol}
                </span>
                <span className="text-xs font-bold">${fee.amount.inDollars}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
