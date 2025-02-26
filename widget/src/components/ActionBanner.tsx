import { cn } from '@/utils/helper'
import { FC, ReactNode } from 'react'

interface Props {
  disabled: boolean
  header: string
  text: string
  image: ReactNode
  btn?: Button
}

interface Button {
  label: string
  onClick: () => void
}

const ActionBanner: FC<Props> = ({ disabled, header, text, image, btn }) => {
  return (
    <div
      className={cn(
        'mt-8 rounded-[20px] bg-turtle-secondary-light px-3 py-5',
        disabled ? 'animate-pulse cursor-progress' : '',
      )}
    >
      <div className="justify-items flex flex-row items-center">
        {image}
        <div className="justify-left ml-3 flex flex-col">
          <div className="text-left text-small font-bold text-turtle-foreground">{header}</div>
          <div className="pb-2 text-left text-small text-turtle-foreground">
            {text}

            {btn && (
              <button
                type="button"
                className={cn(
                  'ml-1 text-left text-small text-turtle-foreground underline',
                  disabled ? 'cursor-not-allowed' : '',
                )}
                onClick={btn.onClick}
                disabled={disabled}
              >
                {btn.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActionBanner
