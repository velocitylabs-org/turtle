import React, { Dispatch, SetStateAction } from 'react'
import Button from './Button'
import { cn } from '@/utils/cn'

interface MenuProps {
  isNewTransaction: boolean
  setIsNewTransaction: Dispatch<SetStateAction<boolean>>
}

const Menu = ({ isNewTransaction, setIsNewTransaction }: MenuProps) => {
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
