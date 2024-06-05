import { Notification } from '@/models/notification'
import { create } from 'zustand'

interface State {
  // State
  notifications: Notification[]

  // Actions
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: number) => void
}

export const useNotificationStore = create<State>(set => ({
  // State
  notifications: [],

  // Actions
  addNotification: notification =>
    set(state => ({
      notifications: [...state.notifications, { ...notification, id: state.notifications.length }], // override id
    })),

  removeNotification: id =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
}))
