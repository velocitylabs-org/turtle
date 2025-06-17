import { cn, Button } from '@velocitylabs-org/turtle-ui'
import { Dispatch, SetStateAction } from 'react'
import { TabOptions } from '@/models/transfer'

interface TabNavigationProps {
  selectedTab: TabOptions
  setSelectedTab: Dispatch<SetStateAction<TabOptions>>
  hasCompletedTransfers: boolean
}

export default function TabNavigation({
  selectedTab,
  setSelectedTab,
  hasCompletedTransfers,
}: TabNavigationProps) {
  const isNewTabSelected = selectedTab === 'New'
  return (
    <div className="relative flex items-center gap-2">
      <Button
        variant={isNewTabSelected ? 'primary' : 'ghost'}
        size="lg"
        className="xl-letter-spacing relative z-10 rounded-2xl text-xl sm:text-large"
        onClick={() => !isNewTabSelected && setSelectedTab('New')}
      >
        <span className={cn(isNewTabSelected ? 'text-black' : 'text-white')}>New</span>
      </Button>
      <Button
        variant={!isNewTabSelected ? 'primary' : 'ghost'}
        className="xl-letter-spacing relative z-10 rounded-2xl text-xl sm:text-large"
        size="lg"
        disabled={!hasCompletedTransfers}
        onClick={() => isNewTabSelected && setSelectedTab('Done')}
      >
        <span className={cn('text-large', !isNewTabSelected ? 'text-black' : 'text-white')}>
          Done
        </span>
      </Button>
    </div>
  )
}
