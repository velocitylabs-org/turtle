import {
  TooltipArrow,
  TooltipContent,
  Portal as TooltipPortal,
  Provider as TooltipProvider,
  Root as TooltipRoot,
  Trigger as TooltipTrigger,
} from '@radix-ui/react-tooltip'
import TooltipIcon from '@velocitylabs-org/turtle-assets/icons/tooltip-icon.svg'
import { Fragment } from 'react'
import { cn } from '@/helpers'

interface TooltipProps {
  showIcon?: boolean
  content: React.ReactNode
  className?: string
  showArrow?: boolean
  children: React.ReactNode
  portal?: boolean
}

export const Tooltip = ({
  content,
  className,
  showIcon = true,
  showArrow = true,
  children,
  portal = true,
}: TooltipProps) => {
  const iconSrc = typeof TooltipIcon === 'string' ? TooltipIcon : TooltipIcon.src
  const PortalEl = portal ? TooltipPortal : Fragment

  return (
    <TooltipProvider>
      <TooltipRoot delayDuration={350}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        {content && (
          <PortalEl>
            <TooltipContent
              sideOffset={5}
              className={cn(
                'turtle-wrapper z-50 flex rounded-[8px] gap-1 bg-black text-white px-[9px] py-[2px]',
                'animate-in data-[state=delayed-open]:duration-350 data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:delay-100',
                'data-[state=closed]:fade-out-0 data-[state=closed]:duration-300 data-[state=closed]:zoom-out-95 origin-[--radix-tooltip-content-transform-origin]',
                className,
              )}
            >
              {showIcon && <img src={iconSrc} alt="icon" className="mr-[2px]" />}
              {content}
              {showArrow && <TooltipArrow />}
            </TooltipContent>
          </PortalEl>
        )}
      </TooltipRoot>
    </TooltipProvider>
  )
}
