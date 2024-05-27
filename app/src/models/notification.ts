export interface Notification {
  id: number
  severity: 'info' | 'error' | 'warning' | 'success'
  header: string
  message?: string
}
