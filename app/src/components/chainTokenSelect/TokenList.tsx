import ClearButton from '@/components/chainTokenSelect/ClearButton'
import SearchBar from '@/components/chainTokenSelect/SearchBar'
import TokenLogo from '@/components/TokenLogo'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { cn } from '@/utils/cn'

interface TokenListProps {
  searchString: string
  setSearchString: (value: string) => void
  options: Token[]
  selectedToken: Token | null
  clearable?: boolean
  sourceChainToDetermineOriginBanner: Chain | null
  onSelect: (token: Token) => void
  onClear: () => void
}

const TokenList = ({
  searchString,
  setSearchString,
  options,
  selectedToken,
  clearable,
  sourceChainToDetermineOriginBanner,
  onSelect,
  onClear,
}: TokenListProps) => {
  return (
    <>
      <SearchBar placeholder="Search" value={searchString} onChange={setSearchString} />
      <div className="max-h-[15rem] overflow-y-auto">
        <ul className="flex flex-col">
          {options.map(option => (
            <li
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center justify-between px-3 py-3 hover:bg-turtle-level1',
                selectedToken?.id === option.id &&
                  'bg-turtle-secondary-light hover:bg-turtle-secondary-light',
              )}
              onClick={() => onSelect(option)}
            >
              <div className="flex items-center gap-2">
                <TokenLogo token={option} sourceChain={sourceChainToDetermineOriginBanner} />
                <span className="text-sm">{option.symbol}</span>
              </div>

              {selectedToken?.id === option.id && clearable && <ClearButton onClick={onClear} />}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default TokenList
