'use client'
import useNotification from '@/hooks/useNotification'
import { AnimatePresence } from 'framer-motion'
import NotificationToast from './NotificationToast'

export default function NotificationSystem() {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="pointer-events-none fixed right-[5vw] top-6 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map(n => (
          <NotificationToast key={n.id} notification={n} removeNotification={removeNotification} />
        ))}
      </AnimatePresence>
    </div>
  )
}
