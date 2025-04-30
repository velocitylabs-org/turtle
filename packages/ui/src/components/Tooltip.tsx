import {
  TooltipArrow,
  Root as TooltipRoot,
  Content as TooltipContent,
  Portal as TooltipPortal,
  Provider as TooltipProvider,
  Trigger as TooltipTrigger,
} from '@radix-ui/react-tooltip'
import clsx from 'clsx'
import TooltipIcon from '../assets/svg/tooltip-icon.svg'

interface TooltipProps {
  showIcon?: boolean
  content: React.ReactNode
  className?: string
  showArrow?: boolean
}

export const Tooltip = ({
  showIcon = true,
  content,
  className,
  showArrow = true,
}: TooltipProps) => {
  return (
    <TooltipProvider>
      <TooltipRoot open={true}>
        <TooltipTrigger>trigger test</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            className={clsx(
              'flex gap-1 rounded-[10px] bg-black',
              showIcon ? 'px-[6px] py-[8px]' : 'px-[6px]',
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
  )
}
