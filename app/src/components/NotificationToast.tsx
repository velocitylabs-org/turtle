'use client'
import { Notification, NotificationSeverity } from '@/models/notification'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

const NOTIFICATION_TTL = 5000

interface NotificationToastProps {
  notification: Notification
  removeNotification: (id: number) => void
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  removeNotification,
}) => {
  // Remove notification after TTL
  useEffect(() => {
    const timeoutRef = setTimeout(() => {
      removeNotification(notification.id)
    }, NOTIFICATION_TTL)

    return () => clearTimeout(timeoutRef)
  }, [notification.id, removeNotification])

  // Determine daisyui severity classname
  const severityClass =
    notification.severity !== NotificationSeverity.DEFAULT ? `alert-${notification.severity}` : null

  return (
    <motion.div
      layout
      initial={{ y: -15, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="alert"
      className={twMerge(
        'alert pointer-events-auto flex items-center gap-2 shadow-lg',
        severityClass,
      )}
    >
      {/* Notification Icon */}
      {renderSeverityIcon(notification.severity)}

      {/* Notification Content */}
      <div className="flex flex-col">
        <h4 className="font-bold">{notification.header}</h4>
        <span className="text-xs">{notification.message}</span>
      </div>

      {/* Close Button */}
      <button className="btn btn-ghost btn-xs" onClick={() => removeNotification(notification.id)}>
        Close
      </button>
    </motion.div>
  )
}

const renderSeverityIcon = (severity: NotificationSeverity) => {
  switch (severity) {
    case NotificationSeverity.DEFAULT:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-info"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      )

    case NotificationSeverity.INFO:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      )

    case NotificationSeverity.ERROR:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )

    case NotificationSeverity.WARNING:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )

    case NotificationSeverity.SUCCESS:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
  }
}

export default NotificationToast
