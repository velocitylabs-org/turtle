import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ActionBannerProps {
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

export default function ActionBanner({ disabled, header, text, image, btn }: ActionBannerProps) {
  return (
    <div
      className={cn(
        'mt-8 rounded-[20px] bg-turtle-secondary-light px-3 py-5',
        disabled ? 'animate-pulse cursor-progress' : '',
      )}
    >
      <div className="justify-items flex flex-col items-center md:flex-row">
        {image}
        <div className="justify-left mt-4 flex flex-col md:ml-3 md:mt-0">
          <div className="text-center text-small font-bold text-turtle-foreground md:text-left">
            {header}
          </div>
          <div className="mt-1 pb-2 text-center text-small text-turtle-foreground md:text-left">
            {text}
            {btn && (
              <button
                className={cn(
                  'ml-1 text-center text-sm text-turtle-foreground underline md:text-left',
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
