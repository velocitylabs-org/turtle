import { captureException } from '@sentry/nextjs'

export default function captureServerError(error: Error) {
  if (process.env.NODE_ENV !== 'production') return

  captureException(error)
}