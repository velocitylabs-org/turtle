import { Notification } from '@/models/notification'
import { create } from 'zustand'

interface State {
  // State
  notifications: Notification[]

  // Actions
  addNotification: (notification: Notification) => void
  removeNotification: (id: number) => void
}

export const useNotificationStore = create<State>(set => ({
  // State
  notifications: [],

  // Actions
  addNotification: notification =>
    set(state => ({ notifications: [...state.notifications, notification] })),

  removeNotification: id =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
}))
