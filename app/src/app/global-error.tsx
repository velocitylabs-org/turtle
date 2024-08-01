'use client'
import { captureException } from '@sentry/nextjs'
import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const GlobalError: React.FC<GlobalErrorProps> = ({ error, reset }) => {
  useEffect(() => {
    captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}

export default GlobalError
