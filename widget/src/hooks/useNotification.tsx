import { useNotificationStore } from '@/stores/notificationStore'

const useNotification = () => {
  const notifications = useNotificationStore((state) => state.notifications)
  const addNotification = useNotificationStore.getState().addNotification
  const removeNotification = useNotificationStore.getState().removeNotification

  return { notifications, addNotification, removeNotification }
}

export default useNotification
