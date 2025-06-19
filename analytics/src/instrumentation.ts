import { captureRequestError, init } from '@sentry/nextjs'

export async function register() {
  const isProduction = process.env.NODE_ENV === 'production'

  if (!isProduction) {
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      debug: false,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      debug: false,
    })
  }
}

export const onRequestError = captureRequestError
