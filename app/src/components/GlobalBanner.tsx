'use client'
import Cross from '@/components/svg/Cross'

interface GlobalBannerProps {
  isVisible: boolean
  onClose: () => void
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
}

export default function GlobalBanner({
  isVisible = false,
  onClose = () => {},
  title = '',
  description = '',
  actionText = '',
  onAction = () => {},
}: GlobalBannerProps) {
  if (!isVisible) return null

  return (
    <div className="fixed left-0 right-0 top-0 z-50 w-full bg-black/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2.5 text-center">
        <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
          <span className="text-sm font-medium text-white">
            {title && <span className="font-semibold">{title} </span>}
            {description}
          </span>
          {actionText && onAction && (
            <button onClick={onAction} className="text-sm text-white underline sm:ml-2">
              {actionText}
            </button>
          )}
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors hover:bg-white/10"
            aria-label="Close banner"
          >
            <Cross className="h-4 w-4" stroke="white" />
          </button>
        </div>
      </div>
    </div>
  )
}
