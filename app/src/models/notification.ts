export enum NotificationSeverity {
  DEFAULT = 'default',
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning',
  SUCCESS = 'success',
}

export interface Notification {
  id: number
  severity: NotificationSeverity
  header: string
  message?: string
}
