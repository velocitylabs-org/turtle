import React, { FC } from 'react'
import { Tooltip as NextTooltip } from '@nextui-org/react'

export interface TooltipProps {
  children: React.ReactNode
}

export const Tooltip: FC<TooltipProps> = ({ children }) => {
  return (
    <NextTooltip
      showArrow
      content="I am a tooltip"
      classNames={{
        base: [
          // arrow color
          'before:bg-neutral-400 dark:before:bg-white',
        ],
        content: ['py-2 px-4 shadow-xl', 'text-black bg-gradient-to-br from-white to-neutral-400'],
      }}
    >
      {children}
    </NextTooltip>
  )
}
