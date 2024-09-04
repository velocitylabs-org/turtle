import { cn } from '@/utils/cn'
import { FC, ReactNode } from 'react'

interface Props {
  onClick: () => void
  disabled: boolean
  header: string
  text: string
  buttonText: string
  image: ReactNode
}

const ActionBanner: FC<Props> = ({ onClick, disabled, header, text, buttonText, image }) => {
  return (
    <div
      className={cn(
        'mt-8 rounded-[20px] bg-turtle-secondary-light px-3 py-5',
        disabled ? 'animate-pulse cursor-progress' : '',
      )}
    >
      <div className="justify-items flex flex-row items-start">
        {image}
        <div className="justify-left ml-3 flex flex-col">
          <div className="text-left text-small font-bold text-turtle-foreground">{header}</div>
          <div className="pb-2 text-left text-small text-turtle-foreground">
            {text}
            <button
              className={cn(
                'ml-1 text-left text-small text-turtle-foreground underline',
                disabled ? 'cursor-not-allowed' : '',
              )}
              onClick={onClick}
              disabled={disabled}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionBanner
