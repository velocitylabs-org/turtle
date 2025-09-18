import * as Sentry from '@sentry/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Widget from '@/components/Widget'
import './index.css'

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  // The percentage of transactions that get sent, defined between 0 and 1.
  // For example, to send 20% of transactions, set tracesSampleRate to 0.2
  tracesSampleRate: 1,

  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
  // results in 25% of transactions being profiled (0.5*0.5=0.25)
  profilesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  integrations: [
    // Add browser profiling integration to the list of integrations
    Sentry.browserProfilingIntegration(),

    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: false,
    }),

    Sentry.feedbackIntegration({
      colorScheme: 'light',
    }),
  ],
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="flex h-screen w-screen items-center justify-center">
      <Widget />
    </div>
  </StrictMode>,
)
