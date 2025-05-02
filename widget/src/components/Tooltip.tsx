import { Tooltip as UiTooltip } from '@velocitylabs-org/turtle-ui'
import TooltipIcon from '@/assets/svg/tooltip-icon.svg'
import { cn } from '@/utils/helper'
import React, { FC } from 'react'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
  showIcon?: boolean
  showArrow?: boolean
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
    <UiTooltip
      showArrow={showArrow}
      content={
        <div className={cn('flex gap-1', showIcon ? 'pl-[4px] pr-[6px]' : 'px-[5px]', className)}>
          {showIcon && <img src={TooltipIcon} alt="icon" className="mr-[2px]" />}
          {content}
        </div>
      }
    >
      {children}
    </UiTooltip>
  )
}
