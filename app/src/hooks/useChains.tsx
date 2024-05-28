import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import * as Sentry from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'
import useNotification from './useNotification'

interface Params {
  supportedToken?: Token
  supportedSourceChain?: Chain
  supportedDestChain?: Chain
}

const useChains = ({ supportedToken, supportedSourceChain, supportedDestChain }: Params) => {
  const { addNotification } = useNotification()

  const [chains, setChains] = useState<Chain[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChains = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      /* const loadedChains: Chain[] = await getChains({
        token: supportedToken,
        sourceChain: supportedSourceChain,
        destChain: supportedDestChain,
      }) // TODO change to chains service

      setChains(loadedChains) */
    } catch (err) {
      let errorMessage = 'An unknown error occurred'
      if (err instanceof Error) errorMessage = err.message

      setError(errorMessage)
      addNotification({
        header: 'Error loading chains',
        message: errorMessage,
        severity: NotificationSeverity.ERROR,
      })
      Sentry.captureException(err)
    } finally {
      setLoading(false)
    }
  }, [supportedToken, supportedSourceChain, supportedDestChain])

  useEffect(() => {
    fetchChains()
  }, [fetchChains])

  return {
    chains,
    loading,
    error,
  }
}

export default useChains
