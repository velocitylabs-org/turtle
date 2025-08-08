import { AssetHub, Hydration } from '@velocitylabs-org/turtle-registry';
import Image from 'next/image';

interface FeesBreakdownProps {
  
}

const fees = [
  {
    title: 'Execution Fees',
    chain: Hydration,
    amount: { value: 0.31, symbol: 'HDX'},
    dollars: 0.0034,
  },
  {
    title: 'Execution Fees',
    chain: Hydration,
    amount: { value: 0.20, symbol: 'HDX'},
    dollars: 0.0022,
  },
  {
    title: 'Delivery Fees',
    chain: AssetHub,
    amount: { value: 0.15, symbol: 'DOT'},
    dollars: 0.51,
  },
]

export default function FeesBreakdown({ }: FeesBreakdownProps) {
  return (
    <div className='bg-turtle-foreground p-4 pb-0 text-turtle-background w-[359px]'>
      <div className='text-sm font-bold text-center w-full pb-4'>Fees Breakdown</div>
      <ul>
        {fees.map(fee => (
          <li className='pb-4'>
            <div className='flex flex-row justify-between items-center'>
              {/* Left - Token & Type of Fee */}
              <div className='flex flex-row justify-between items-center gap-1'>
                <Image
                    src={(fee.chain.logoURI as Record<string, string>).src}
                    alt={fee.chain.name}
                    width={16}
                    height={16}
                    className="h-4 w-4 rounded-full border border-turtle-background bg-turtle-foreground"
                  />
                <span className='text-xs'>{fee.title}</span>
              </div>

              {/* Right - Amount & Dollars */}
              <div className='flex flex-row justify-between items-center gap-2'>
                <span className='text-xs'>{fee.amount.value}{' '}{fee.amount.symbol}</span>
                <span className='text-xs font-bold'>${fee.dollars}</span>
              </div>
            </div>
          </li>
      ))}
      </ul>
    </div>
  )
}
