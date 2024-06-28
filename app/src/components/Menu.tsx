import { DisplaysTransfers } from '@/models/transfer'
import { cn } from '@/utils/cn'

import Button from './Button'

const Menu = ({
  isNewTransaction,
  setIsNewTransaction,
  isCompletedTransactions,
}: DisplaysTransfers) => {
  return (
    <div className="relative flex items-center gap-2">
      <Button
        variant={isNewTransaction ? 'primary' : 'ghost'}
        size="lg"
        className="relative z-10 rounded-2xl text-xl sm:text-large"
        onClick={() => !isNewTransaction && setIsNewTransaction(!isNewTransaction)}
      >
        <span className={cn(isNewTransaction ? 'text-black' : 'text-white')}>New</span>
      </Button>
      <Button
        variant={!isNewTransaction ? 'primary' : 'ghost'}
        className="relative z-10 rounded-2xl text-xl sm:text-large"
        size="lg"
        disabled={!isCompletedTransactions}
        onClick={() => isNewTransaction && setIsNewTransaction(!isNewTransaction)}
      >
        <span className={cn('text-large', !isNewTransaction ? 'text-black' : 'text-white')}>
          Completed
        </span>
      </Button>
    </div>
  )
}

export default Menu
