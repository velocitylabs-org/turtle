import { create } from 'zustand'
import { Notification } from '@/models/notification'

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
    set(state => ({
      notifications: [...state.notifications, { ...notification, id: Date.now() }],
    })),
  removeNotification: id =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
}))
