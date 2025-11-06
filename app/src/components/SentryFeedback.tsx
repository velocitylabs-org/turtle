'use client'

import * as Sentry from '@sentry/nextjs'
import { feedbackIntegration } from '@sentry/nextjs'
import { useEffect } from 'react'

export default function SentryFeedback() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    // Small delay to ensure Sentry is fully initialized
    const timer = setTimeout(() => {
      try {
        const client = Sentry.getClient()
        if (!client) {
          console.warn('Sentry client not initialized')
          return
        }

        // Try to get existing feedback integration first
        let feedback = Sentry.getFeedback()

        // If getFeedback() doesn't work (returns undefined), create a new feedback integration instance
        if (!feedback) {
          console.log('Creating new feedback integration instance')
          feedback = feedbackIntegration({
            colorScheme: 'light',
            showBranding: false,
            isEmailRequired: true,
            autoInject: false,
          })
        }

        if (feedback && typeof feedback.createWidget === 'function') {
          const widget = feedback.createWidget({
            colorScheme: 'light',
            showBranding: false,
            isEmailRequired: true,
          })

          if (widget && typeof widget.appendToDom === 'function') {
            widget.appendToDom()
            console.log('Sentry feedback widget initialized successfully')
          }
        } else {
          console.warn('Sentry feedback integration not available')
          console.warn('Feedback object:', feedback)
          console.warn('Client:', client)
        }
      } catch (error) {
        console.error('Error initializing Sentry feedback:', error)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return null
}
