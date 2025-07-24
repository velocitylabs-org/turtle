import { create } from 'zustand'
import type { Notification } from '@/models/notification'

interface State {
  // State
  notifications: Notification[]

  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: number) => void
}

export const useNotificationStore = create<State>(set => ({
  notifications: [],
  addNotification: notification =>
    set(state => {
      const exists = state.notifications.some(
        n => n.message === notification.message && n.severity === notification.severity,
      )
      if (exists) return state
      return {
        notifications: [...state.notifications, { ...notification, id: Date.now() }],
      }
    }),
  removeNotification: id =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
}))
