import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import { AlertIcon } from '@/assets/svg/AlertIcon.tsx'
import type { FeeDetails, FeeSufficiency } from '@/models/transfer'
import { getSrcFromLogo } from '@/utils/getSrcFromLogo.ts'
import { formatAmount, toHuman } from '@/utils/transfer'

interface FeesBreakdownProps {
  fees: FeeDetails[] | null | undefined
  hasFeesFailed: boolean
}

export default function FeesBreakdown({ fees, hasFeesFailed }: FeesBreakdownProps) {
  const insufficientFees = getFeesBySufficiency('insufficient', fees ?? [])
  const undeterminedFees = getFeesBySufficiency('undetermined', fees ?? [])

  return (
    <div className="w-[360px] bg-turtle-foreground p-3 pb-1 text-turtle-background">
      <div className="w-full pb-3 pt-0.5 text-center text-sm font-bold">Fees Breakdown</div>
      <ul>
        {fees?.map((fee, idx) => (
          <li className="pb-3.5" key={idx}>
            <div className="flex flex-row items-center justify-between">
              {/* Left - Token & Type of Fee */}
              <div className="flex flex-row items-center justify-between gap-1">
                <img
                  src={getSrcFromLogo(fee.chain)}
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
      {insufficientFees.size > 0 && (
        <AlertRow key={'insufficient-fees'} variant="error">
          You don&apos;t have enough ${toReadableList(insufficientFees)}
        </AlertRow>
      )}

      {undeterminedFees.size > 0 && (
        <AlertRow key={'undetermined-fees'} variant="error">
          You don&apos;t have enough ${toReadableList(undeterminedFees)}
        </AlertRow>
      )}

      {hasFeesFailed && (
        <AlertRow variant="error">
          <span className="font-bold">Error:</span> Failed to load fees. Please try again
        </AlertRow>
      )}
    </div>
  )
}

interface AlertRowProps {
  variant: 'error' | 'warning' | 'info'
  children: React.ReactNode
}

function AlertRow({ variant, children }: AlertRowProps) {
  const variantStyles = {
    error: {
      bg: 'bg-turtle-error',
      iconFill: 'white',
      textColor: 'text-white',
    },
    warning: {
      bg: 'bg-gray-100',
      iconFill: colors['turtle-foreground'],
      textColor: 'text-turtle-foreground',
    },
    info: {
      bg: 'bg-gray-100',
      iconFill: colors['turtle-foreground'],
      textColor: 'text-turtle-foreground',
    },
  }

  const style = variantStyles[variant]

  return (
    <div className={`mb-3.5 flex flex-row items-center rounded-[6px] ${style.bg} px-1.5 py-1 w-full`}>
      <AlertIcon width={16} height={16} fill={style.iconFill} className="mr-2 flex-shrink-0" />
      <span className={`text-xs ${style.textColor}`}>{children}</span>
    </div>
  )
}

function getFeesBySufficiency(sufficiency: FeeSufficiency, fees: FeeDetails[]): Map<string, Set<string>> {
  return groupByToken(fees?.filter(fee => fee.sufficient === sufficiency) ?? [])
}

function toReadableList(xs: Map<string, Set<string>>): string {
  return Array.from(xs.entries())
    .map(([token, chains], _) => `${token} on ${Array.from(chains).join(', ')}`)
    .join('; ')
    .concat('.')
}

function groupByToken(fees: FeeDetails[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()

  for (const { amount, chain } of fees) {
    const token = amount.token.symbol
    const chainName = chain.name

    if (!map.has(token)) {
      map.set(token, new Set())
    }
    map.get(token)!.add(chainName)
  }

  return map
}
