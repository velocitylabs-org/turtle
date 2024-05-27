import { AnimatePresence } from 'framer-motion'
import React, { useState } from 'react'
import Notification from './Notification'

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = (id: number) => {
    setNotifications(pv => pv.filter(n => n.id !== id))
  }

  return (
    <div className="pointer-events-none fixed right-2 top-2 z-50 flex w-72 flex-col gap-1">
      <AnimatePresence>
        {notifications.map(n => (
          <Notification key={n.id} notification={n} removeNotification={removeNotification} />
        ))}
      </AnimatePresence>
    </div>
  )
}
