import { captureException } from '@sentry/nextjs'

export default async function captureServerError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') return

  return context
    ? captureException(error, {
        extra: {
          ...context,
        },
        level: 'error',
      })
    : captureException(error)
}
