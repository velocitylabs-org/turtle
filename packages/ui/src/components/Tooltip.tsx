import {
  TooltipArrow,
  Root as TooltipRoot,
  Portal as TooltipPortal,
  Provider as TooltipProvider,
  Trigger as TooltipTrigger,
  TooltipContent,
} from '@radix-ui/react-tooltip'
import clsx from 'clsx'
import TooltipIcon from '../assets/svg/icons/tooltip-icon.svg'

interface TooltipProps {
  showIcon?: boolean
  content: React.ReactNode
  className?: string
  showArrow?: boolean
  children: React.ReactNode
}

export const Tooltip = ({
  content,
  className,
  showIcon = true,
  showArrow = true,
  children,
}: TooltipProps) => {
  return (
    <TooltipProvider>
      <TooltipRoot delayDuration={350}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        {content && (
          <TooltipPortal>
            <TooltipContent
              sideOffset={5}
              className={clsx(
                'z-50 flex rounded-[8px] gap-1 bg-black text-white px-[9px] py-[2px]',
                'animate-in data-[state=delayed-open]:duration-350 data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:delay-100',
                'data-[state=closed]:fade-out-0 data-[state=closed]:duration-300 data-[state=closed]:zoom-out-95 origin-[--radix-tooltip-content-transform-origin]',
                className,
              )}
            >
              {showIcon && <img src={TooltipIcon} alt="icon" className="mr-[2px]" />}
              {content}
              {showArrow && <TooltipArrow />}
            </TooltipContent>
          </TooltipPortal>
        )}
      </TooltipRoot>
    </TooltipProvider>
  )
}
