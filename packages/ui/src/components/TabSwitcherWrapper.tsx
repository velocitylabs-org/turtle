'use client'
import { useState } from 'react'
import { cn } from '../helpers'

type TabSwitcherWrapperProps = {
  TransferComponent: React.ReactNode
  BuySellComponent: React.ReactNode
}

export const TabSwitcherWrapper = ({ TransferComponent, BuySellComponent }: TabSwitcherWrapperProps) => {
  const [selectedTab, setSelectedTab] = useState<'Transfer' | 'BuySell'>('Transfer')

  const Button = ({
    label,
    onClick,
    activeTab,
  }: {
    label: string
    onClick: () => void
    activeTab: 'Transfer' | 'BuySell'
  }) => {
    return (
      <div className="flex flex-col">
        <button className={cn('px-[1rem] py-[0.5rem]', selectedTab === activeTab && 'font-bold')} onClick={onClick}>
          <span className="text-[20px]">{label}</span>
        </button>
        {activeTab === selectedTab && <div className="h-0.5 w-full bg-turtle-primary" />}
      </div>
    )
  }

  return (
    <div>
      <div className="relative flex flex-col rounded-t-3xl border border-b-0 border-turtle-foreground bg-turtle-level1 p-6 sm:p-10 sm:pb-4 w-full max-w-[90vw] sm:w-[31.5rem] h-[5-">
        <div className="flex">
          <Button label="Transfer" onClick={() => setSelectedTab('Transfer')} activeTab="Transfer" />
          <Button label="Buy/Sell" onClick={() => setSelectedTab('BuySell')} activeTab="BuySell" />
        </div>
      </div>
      {selectedTab === 'Transfer' ? TransferComponent : BuySellComponent}
    </div>
  )
}
