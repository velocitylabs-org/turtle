import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { getChains } from '@/services/chains'
import * as Sentry from '@sentry/nextjs'
import { useCallback, useEffect, useState } from 'react'
import useNotification from './useNotification'
import useEnvironment from './useEnvironment'

interface Params {
  supportedToken?: Token
  supportedSourceChain?: Chain
  supportedDestChain?: Chain
}

const useChains = ({ supportedToken, supportedSourceChain, supportedDestChain }: Params = {}) => {
  const { addNotification } = useNotification()

  const { environment, switchTo } = useEnvironment()
  const [chains, setChains] = useState<Chain[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChains = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const loadedChains: Chain[] = await getChains({
        environment,
        token: supportedToken,
        sourceChain: supportedSourceChain,
        destChain: supportedDestChain,
      })

      setChains(loadedChains)
    } catch (err) {
      let errorMessage = 'An unknown error occurred'
      if (err instanceof Error) errorMessage = err.message

      setError(errorMessage)
      addNotification({
        header: 'Error loading chains',
        message: errorMessage,
        severity: NotificationSeverity.Error,
      })
      Sentry.captureException(err)
    } finally {
      setLoading(false)
    }
  }, [supportedToken, supportedSourceChain, supportedDestChain, addNotification])

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
