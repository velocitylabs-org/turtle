'use client'

import { getFeedback } from '@sentry/nextjs'
import { useEffect } from 'react'

export default function SentryFeedback() {
  useEffect(() => {
    // Small delay to ensure Sentry is fully initialized
    const timer = setTimeout(() => {
      const feedback = getFeedback()

      if (feedback) {
        const widget = feedback.createWidget({
          colorScheme: 'light',
          showBranding: false,
          isEmailRequired: true,
        })

        if (widget) {
          widget.appendToDom()
          console.log('Sentry feedback widget initialized and appended to DOM')
        }
      } else {
        console.warn('Sentry feedback integration not available')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return null
}
