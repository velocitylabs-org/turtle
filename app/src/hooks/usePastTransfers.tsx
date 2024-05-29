import { NotificationSeverity } from '@/models/notification'
import { Transfer } from '@/models/transfer'
import { getPastTransfers } from '@/services/pastTransfers'
import * as Sentry from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'
import useNotification from './useNotification'

const usePastTransfers = (address?: string) => {
  const { addNotification } = useNotification()

  const [pastTransfers, setPastTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPastTransfers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const loadedTransfers: Transfer[] = await getPastTransfers(address)

      setPastTransfers(loadedTransfers)
    } catch (err) {
      let errorMessage = 'An unknown error occurred'
      if (err instanceof Error) errorMessage = err.message

      setError(errorMessage)
      addNotification({
        header: 'Error loading past transfers',
        message: errorMessage,
        severity: NotificationSeverity.ERROR,
      })
      Sentry.captureException(err)
    } finally {
      setLoading(false)
    }
  }, [address, addNotification])

  useEffect(() => {
    fetchPastTransfers()
  }, [fetchPastTransfers])

  return {
    pastTransfers,
    loading,
    error,
  }
}

export default usePastTransfers
