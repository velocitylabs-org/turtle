import {
  TooltipArrow,
  Root as TooltipRoot,
  Portal as TooltipPortal,
  Provider as TooltipProvider,
  Trigger as TooltipTrigger,
  TooltipContent,
} from '@radix-ui/react-tooltip'
import clsx from 'clsx'
import TooltipIcon from '@/assets/svg/tooltip-icon.svg'
import { useEffect, useRef } from 'react'

interface TooltipProps {
  showIcon?: boolean
  content: React.ReactNode
  className?: string
  showArrow?: boolean
  children: React.ReactNode
}

export const Tooltip = ({
  showIcon = true,
  content,
  className,
  showArrow = true,
  children,
}: TooltipProps) => {
  return (
    <>
      <TooltipProvider>
        <TooltipRoot delayDuration={350}>
          <TooltipTrigger>{children}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              className={clsx(
                'z-100 flex gap-1 rounded-[8px] bg-black text-white px-[9px] py-[4px] font-semibold',
                'animate-in data-[state=closed]:animate-out data-[state=closed]:delay-100',
                'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 origin-[--radix-tooltip-content-transform-origin]',
                className,
              )}
            >
              {showIcon && <img src={TooltipIcon} alt="icon" className="mr-[2px]" />}
              {content}
              {showArrow && <TooltipArrow />}
            </TooltipContent>
          </TooltipPortal>
        </TooltipRoot>
      </TooltipProvider>
    </>
  )
}
