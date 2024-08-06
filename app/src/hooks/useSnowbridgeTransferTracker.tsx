import { getTransferStatus } from '@/utils/snowbridge'
import { ToEthereumTransferResult, ToPolkadotTransferResult } from '@snowbridge/api/dist/history'
import { useState, useEffect, useCallback } from 'react'

const useSnowbridgeTransferTracker = () => {
  const [transfers, setTransfers] = useState<
    (ToEthereumTransferResult | ToPolkadotTransferResult)[]
  >([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/history')
      const data = await response.json()
      setTransfers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransfers()
    const intervalId = setInterval(fetchTransfers, 120 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  const getStatusMessage = (result: ToEthereumTransferResult | ToPolkadotTransferResult) => {
    getTransferStatus(result)
  }

  return { transfers, loading, getStatusMessage }
}

export default useSnowbridgeTransferTracker
