'use client'
import TooltipIcon from '@/../public/tooltip-icon.svg'
import { cn } from '@/utils/cn'
import { Tooltip as NextTooltip } from '@heroui/react'
import Image from 'next/image'
import React, { FC } from 'react'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
  showIcon?: boolean
  showArrow?: boolean
}

const classNames = {
  base: [
    // arrow color
    'before:bg-black before:rounded-[-10px] before:translate-y-[-1px]',
  ],
  content: ['p-[4px] rounded-[8px]', 'text-white bg-black'],
  arrow: ['bg-black'],
}

export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  className,
  showIcon = true,
  showArrow = true,
}) => {
  if (!content) return <>{children}</>
  return (
    <NextTooltip
      showArrow={showArrow}
      delay={350}
      closeDelay={100}
      content={
        <div className={cn('flex gap-1', showIcon ? 'pl-[4px] pr-[6px]' : 'px-[5px]', className)}>
          {showIcon && <Image src={TooltipIcon} alt="icon" className="mr-[2px]" />}
          {content}
        </div>
      }
      classNames={classNames}
    >
      {children}
    </NextTooltip>
  )
}
