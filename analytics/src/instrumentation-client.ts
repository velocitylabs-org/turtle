import { init, captureRouterTransitionStart } from '@sentry/nextjs'

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: false,
})

export const onRouterTransitionStart = captureRouterTransitionStart
