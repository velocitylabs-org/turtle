import { Network } from '@/models/chain'
import { Token } from '@/models/token'
import { useEffect, useState } from 'react'

interface useBalanceParams {
  network: Network
  token: Token // Could be extended to support multiple tokens
  address: string
}

const useBalance = ({ network, token, address }: useBalanceParams) => {
  const [balance, setBalance] = useState<bigint>()

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    switch (network) {
      case Network.Ethereum: {
        // Fetch balance from Ethereum
        break
      }
      case Network.Polkadot: {
        // Fetch balance from Polkadot
        break
      }
    }
  }

  return { balance }
}
