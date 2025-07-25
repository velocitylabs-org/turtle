import { colors } from '@velocitylabs-org/turtle-tailwind-config'
import SearchIcon from './svg/SearchIcon'

interface SearchBarProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-turtle-level3 bg-turtle-background px-3 py-3">
      <div className="flex h-[2rem] w-[2rem] shrink-0 items-center justify-center">
        <SearchIcon fill={colors['turtle-level5']} width={17} height={17} />
      </div>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border-0 bg-transparent text-sm placeholder:text-turtle-level5 focus:border-0 focus:outline-none"
      />
    </div>
  )
}
