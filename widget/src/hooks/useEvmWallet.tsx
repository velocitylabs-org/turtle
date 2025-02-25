import { useAppKit } from '@reown/appkit/react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useMemo } from 'react'
import type { Account, Chain, Client, Transport } from 'viem'
import { type Config, useAccount, useConnectorClient, useDisconnect } from 'wagmi'

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new BrowserProvider(transport, network)
  const signer = new JsonRpcSigner(provider, account.address)
  return signer
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
const useEvmWallet = ({ chainId }: { chainId?: number } = {}) => {
  const { data: client } = useConnectorClient<Config>({ chainId })
  const { open, close } = useAppKit()
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()
  const signer = useMemo(() => (client ? clientToSigner(client) : undefined), [client])
  return { signer, openModal: open, closeModal: close, disconnect, isConnected }
}

export default useEvmWallet
