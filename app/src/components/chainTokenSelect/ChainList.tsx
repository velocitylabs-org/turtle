import ClearButton from '@/components/chainTokenSelect/ClearButton'
import SearchBar from '@/components/chainTokenSelect/SearchBar'
import { Chain } from '@/models/chain'
import { cn } from '@/utils/cn'
import Image from 'next/image'

interface ChainListProps {
  searchString: string
  setSearchString: (value: string) => void
  options: Chain[]
  selectedChain: Chain | null
  clearable?: boolean
  onSelect: (chain: Chain) => void
  onClear: () => void
}

const ChainList = ({
  searchString,
  setSearchString,
  options,
  selectedChain,
  clearable,
  onSelect,
  onClear,
}: ChainListProps) => {
  return (
    <>
      <SearchBar placeholder="Search" value={searchString} onChange={setSearchString} />
      <div className="max-h-[15rem] overflow-y-auto">
        <ul className="flex flex-col">
          {options.map(option => (
            <li
              key={option.uid}
              className={cn(
                'flex cursor-pointer items-center justify-between px-3 py-3 hover:bg-turtle-level1',
                selectedChain?.uid === option.uid &&
                  'bg-turtle-secondary-light hover:bg-turtle-secondary-light',
              )}
              onClick={() => onSelect(option)}
            >
              <div className="flex items-center gap-2">
                <Image
                  src={option.logoURI}
                  alt={option.name}
                  width={24}
                  height={24}
                  priority
                  className="h-[2rem] w-[2rem] rounded-full border-1 border-turtle-foreground bg-background"
                />
                <span className="text-sm">{option.name}</span>
              </div>

              {selectedChain?.uid === option.uid && clearable && <ClearButton onClick={onClear} />}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default ChainList
