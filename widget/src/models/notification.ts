export enum NotificationSeverity {
  Info = 'info',
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
  Default = 'default',
}

export interface Notification {
  id: number
  severity?: NotificationSeverity
  header?: string
  message?: string
  dismissible?: boolean
}
