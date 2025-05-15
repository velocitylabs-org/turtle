import { Network } from '@velocitylabs-org/turtle-registry'
import { useCallback, useEffect, useState } from 'react'
import { lookupName } from '@/utils/transfer'

const useLookupName = (network?: Network, address?: string) => {
  const [accountName, setAccountName] = useState<string | null>(null)

  const fetchName = useCallback(async () => {
    if (!network || !address) {
      setAccountName(null)
      return
    }

    try {
      const name = await lookupName(network, address)
      setAccountName(name)
    } catch (e) {
      // Do not throw an error here
      console.error('Address lookup error:', e)
    }
  }, [network, address])

  useEffect(() => {
    fetchName()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, address])

  return accountName
}

export default useLookupName
