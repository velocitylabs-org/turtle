import TooltipIcon from '@/../public/tooltip-icon.svg'
import { Tooltip as NextTooltip } from '@nextui-org/react'
import Image from 'next/image'
import React, { FC } from 'react'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
}

export const Tooltip: FC<TooltipProps> = ({ children, content }) => {
  if (!content) return <>{children}</>
  return (
    <NextTooltip
      showArrow
      content={
        <div className="flex gap-1">
          <Image src={TooltipIcon} alt="icon" />
          {content}
        </div>
      }
      classNames={{
        base: [
          // arrow color
          'before:bg-black before:rounded-[-10px] before:translate-y-[-1px]',
        ],
        content: ['p-[4px, 8px, 4px, 4px] rounded-[8px]', 'text-white bg-black'],
        arrow: ['bg-black'],
      }}
    >
      {children}
    </NextTooltip>
  )
}
