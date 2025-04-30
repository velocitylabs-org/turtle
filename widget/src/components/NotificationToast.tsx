import { Notification, NotificationSeverity } from '@/models/notification'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

import InfoIcon from '@/assets/svg/severity-info-icon.svg'
import ErrorIcon from '@/assets/svg/severity-error-icon.svg'
import WarningIcon from '@/assets/svg/severity-warning-icon.svg'
import SuccessIcon from '@/assets/svg/severity-success-icon.svg'
import DefaultIcon from '@/assets/svg/severity-default-icon.svg'

const NOTIFICATION_TTL_MS = 5000

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
    }, NOTIFICATION_TTL_MS)

    return () => clearTimeout(timeoutRef)
  }, [notification.id, removeNotification])

  const header =
    (notification.severity && getSeverityHeader(notification.severity)) || notification.header

  return (
    <motion.div
      layout
      initial={{ y: -15, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      role="alert"
      className={twMerge(
        'pointer-events-auto flex h-[2rem] flex-row items-center gap-[0.25rem] text-nowrap rounded-[8px] bg-turtle-foreground py-[0.25rem] pl-[0.25rem] pr-[0.5rem]',
      )}
    >
      {/* Notification Icon */}
      {renderSeverityIcon(notification.severity)}

      {/* Notification Content */}
      {header && <span className="sm:text-normal text-xs font-bold text-white">{header}</span>}
      {notification.message && (
        <span className="sm:text-normal text-sm text-white">{notification.message}</span>
      )}

      {/* Close Button */}
      {notification.dismissible && (
        <button
          type="button"
          className="sm:text-normal text-xs text-white underline"
          onClick={() => removeNotification(notification.id)}
        >
          Dismiss
        </button>
      )}
    </motion.div>
  )
}

const renderSeverityIcon = (severity?: NotificationSeverity) => {
  switch (severity) {
    case NotificationSeverity.Info:
      return <img src={InfoIcon} alt="info icon" />

    case NotificationSeverity.Error:
      return <img src={ErrorIcon} alt="error icon" />

    case NotificationSeverity.Warning:
      return <img src={WarningIcon} alt="warnign icon" />

    case NotificationSeverity.Success:
      return <img src={SuccessIcon} alt="success icon" />

    case NotificationSeverity.Default:
      return <img src={DefaultIcon} alt="default icon" />
    default:
      return
  }
}

const getSeverityHeader = (severity: NotificationSeverity) => {
  switch (severity) {
    case NotificationSeverity.Info:
      return 'Btw'

    case NotificationSeverity.Error:
      return 'Oops!'

    case NotificationSeverity.Warning:
      return 'Watch it!'

    case NotificationSeverity.Success:
      return 'Yay!'

    default:
      return ''
  }
}

export default NotificationToast
