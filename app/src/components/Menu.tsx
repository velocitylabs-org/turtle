import { DisplaysTransfers } from '@/models/transfer'
import { cn } from '@/utils/cn'

import Button from './Button'

const Menu = ({
  newTransferInit,
  setNewTransferInit,
  hasCompletedTransfers,
}: DisplaysTransfers) => {
  const initNewTransaction = newTransferInit === 'New'
  return (
    <div className="relative flex items-center gap-2">
      <Button
        variant={initNewTransaction ? 'primary' : 'ghost'}
        size="lg"
        className="xl-letter-spacing relative z-10 rounded-2xl text-xl sm:text-large"
        onClick={() => !initNewTransaction && setNewTransferInit('New')}
      >
        <span className={cn(initNewTransaction ? 'text-black' : 'text-white')}>New</span>
      </Button>
      <Button
        variant={!initNewTransaction ? 'primary' : 'ghost'}
        className="xl-letter-spacing relative z-10 rounded-2xl text-xl sm:text-large"
        size="lg"
        disabled={!hasCompletedTransfers}
        onClick={() => initNewTransaction && setNewTransferInit('Done')}
      >
        <span className={cn('text-large', !initNewTransaction ? 'text-black' : 'text-white')}>
          Done
        </span>
      </Button>
    </div>
  )
}

export default Menu
