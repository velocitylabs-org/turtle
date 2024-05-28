'use client'
import DefaultIcon from '@/../public/notification-default-icon.svg'
import ErrorIcon from '@/../public/notification-error-icon.svg'
import InfoIcon from '@/../public/notification-info-icon.svg'
import SuccessIcon from '@/../public/notification-success-icon.svg'
import WarningIcon from '@/../public/notification-warning-icon.svg'
import { Notification, NotificationSeverity } from '@/models/notification'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

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
      removeNotification(notification.id!)
    }, NOTIFICATION_TTL_MS)

    return () => clearTimeout(timeoutRef)
  }, [notification.id, removeNotification])

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
        `alert-${notification.severity}`,
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
      <button className="btn btn-ghost btn-xs" onClick={() => removeNotification(notification.id!)}>
        Close
      </button>
    </motion.div>
  )
}

const renderSeverityIcon = (severity?: NotificationSeverity) => {
  switch (severity) {
    case NotificationSeverity.INFO:
      return <Image src={InfoIcon} alt="info icon" />

    case NotificationSeverity.ERROR:
      return <Image src={ErrorIcon} alt="error icon" />

    case NotificationSeverity.WARNING:
      return <Image src={WarningIcon} alt="warning icon" />

    case NotificationSeverity.SUCCESS:
      return <Image src={SuccessIcon} alt="success icon" />

    default:
      return <Image src={DefaultIcon} alt="default icon" />
  }
}

export default NotificationToast
