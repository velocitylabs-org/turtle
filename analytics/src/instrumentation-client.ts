import { init, captureRouterTransitionStart } from '@sentry/nextjs'

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    debug: false,
  })
}

export const onRouterTransitionStart = captureRouterTransitionStart
