'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import DefaultIcon from '@/../public/severity-default-icon.svg'
import ErrorIcon from '@/../public/severity-error-icon.svg'
import InfoIcon from '@/../public/severity-info-icon.svg'
import SuccessIcon from '@/../public/severity-success-icon.svg'
import WarningIcon from '@/../public/severity-warning-icon.svg'
import { Notification, NotificationSeverity } from '@/models/notification'

const NOTIFICATION_TTL_MS = 5000

const motionProps = {
  initial: { y: -15, scale: 0.95 },
  animate: { y: 0, scale: 1 },
  exit: { x: '100%', opacity: 0 },
  transition: { duration: 0.35, ease: 'easeOut' },
}

interface NotificationToastProps {
  notification: Notification
  removeNotification: (id: number) => void
}

export default function NotificationToast({
  notification,
  removeNotification,
}: NotificationToastProps) {
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
      role="alert"
      className={twMerge(
        'pointer-events-auto flex h-[2rem] flex-row items-center gap-[0.25rem] text-nowrap rounded-[8px] bg-turtle-foreground py-[0.25rem] pl-[0.25rem] pr-[0.5rem]',
      )}
      {...motionProps}
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
          className="sm:text-normal text-xs text-white underline"
          onClick={() => removeNotification(notification.id)}
        >
          Dismiss
        </button>
      )}
    </motion.div>
  )
}

function renderSeverityIcon(severity?: NotificationSeverity) {
  switch (severity) {
    case NotificationSeverity.Info:
      return <Image src={InfoIcon} alt="info icon" />

    case NotificationSeverity.Error:
      return <Image src={ErrorIcon} alt="error icon" />

    case NotificationSeverity.Warning:
      return <Image src={WarningIcon} alt="warning icon" />

    case NotificationSeverity.Success:
      return <Image src={SuccessIcon} alt="success icon" />

    case NotificationSeverity.Default:
      return <Image src={DefaultIcon} alt="default icon" />

    default:
      return
  }
}

function getSeverityHeader(severity: NotificationSeverity) {
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
