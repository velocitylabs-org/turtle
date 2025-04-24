'use client'

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
    <div className="fixed left-1/2 top-2 z-50 -translate-x-1/2">
      <div className="mx-auto flex w-[90vw] flex-col items-center justify-center rounded-2xl bg-black/70 px-6 py-3 text-center backdrop-blur-sm sm:w-auto sm:max-w-2xl">
        <div className="flex flex-col gap-1">
          {title && <span className="text-sm font-semibold text-white">{title}</span>}
          {description && <span className="text-sm font-medium text-white">{description}</span>}
        </div>
        <div className="mt-1 flex items-center gap-3">
          {actionText && onAction && (
            <>
              <button onClick={onAction} className="text-sm text-white underline">
                {actionText}
              </button>
              <span className="text-sm text-white/50">/</span>
            </>
          )}
          <button
            onClick={onClose}
            className="text-sm text-white underline"
            aria-label="Close banner"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
