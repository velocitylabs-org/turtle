import { Network } from '@/models/chain'
import { lookupName } from '@/utils/transfer'
import { useCallback, useEffect, useState } from 'react'

const useLookupName = (network: Network, address: string) => {
  const [accountName, setAccountName] = useState<string | null>()

  const fetchName = useCallback(async () => {
    try {
      const name = await lookupName(network, address)
      setAccountName(name)
    } catch (e) {
      // Do not throw an error here
      console.error(e)
    }
  }, [network, address])

  useEffect(() => {
    fetchName()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, address])

  return accountName
}

export default useLookupName
