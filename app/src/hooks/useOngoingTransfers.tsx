import { NotificationSeverity } from '@/models/notification'
import { Transfer } from '@/models/transfer'
import { getOngoingTransfers } from '@/services/ongoingTransfers'
import * as Sentry from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'
import useNotification from './useNotification'

const useOngoingTransfers = (address?: string) => {
  const { addNotification } = useNotification()

  const [ongoingTransfers, setOngoingTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOngoingTransfers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const loadedTransfers: Transfer[] = await getOngoingTransfers(address)

      setOngoingTransfers(loadedTransfers)
    } catch (err) {
      let errorMessage = 'An unknown error occurred'
      if (err instanceof Error) errorMessage = err.message

      setError(errorMessage)
      addNotification({
        header: 'Error loading ongoing transfers',
        message: errorMessage,
        severity: NotificationSeverity.Error,
      })
      Sentry.captureException(err)
    } finally {
      setLoading(false)
    }
  }, [address, addNotification])

  useEffect(() => {
    fetchOngoingTransfers()
  }, [fetchOngoingTransfers])

  return {
    ongoingTransfers,
    loading,
    error,
  }
}

export default useOngoingTransfers
