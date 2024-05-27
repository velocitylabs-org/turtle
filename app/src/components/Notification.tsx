'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Notification } from '@/models/notification'

const NOTIFICATION_TTL = 5000

interface NotificationProps {
  notification: Notification
  removeNotification: (id: number) => void
}

const Notification: React.FC<NotificationProps> = ({ notification, removeNotification }) => {
  useEffect(() => {
    const timeoutRef = setTimeout(() => {
      removeNotification(notification.id)
    }, NOTIFICATION_TTL)

    return () => clearTimeout(timeoutRef)
  }, [notification.id, removeNotification])

  return (
    <motion.div
      layout
      initial={{ y: -15, scale: 0.95 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="pointer-events-auto flex items-start gap-2 rounded bg-indigo-500 p-2 text-xs font-medium text-white shadow-lg"
    >
      {/* Icon placeholder */}
      <span>{notification.header}</span>
      <button onClick={() => removeNotification(notification.id)} className="ml-auto mt-0.5">
        {/* Close Icon placeholder */}
      </button>
    </motion.div>
  )
}

export default Notification
