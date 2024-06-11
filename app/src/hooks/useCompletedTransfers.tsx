import { NotificationSeverity } from '@/models/notification'
import { Transfer } from '@/models/transfer'
import { getCompletedTransfers } from '@/services/completedTransfers'
import * as Sentry from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'
import useNotification from './useNotification'

const useCompletedTransfers = (address?: string) => {
  const { addNotification } = useNotification()

  const [completedTransfers, setCompletedTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompletedTransfers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const loadedTransfers: Transfer[] = await getCompletedTransfers(address)

      setCompletedTransfers(loadedTransfers)
    } catch (err) {
      let errorMessage = 'An unknown error occurred'
      if (err instanceof Error) errorMessage = err.message

      setError(errorMessage)
      addNotification({
        header: 'Error loading completed transfers',
        message: errorMessage,
        severity: NotificationSeverity.Error,
      })
      Sentry.captureException(err)
    } finally {
      setLoading(false)
    }
  }, [address, addNotification])

  useEffect(() => {
    fetchCompletedTransfers()
  }, [fetchCompletedTransfers])

  return {
    completedTransfers,
    loading,
    error,
  }
}

export default useCompletedTransfers
