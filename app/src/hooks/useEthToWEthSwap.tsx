import { Network } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { TokenAmount } from '@/models/select'
import { captureException } from '@sentry/nextjs'
import { Context, toPolkadot } from '@snowbridge/api'
import { Signer } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { convertAmount, toHuman } from '../utils/transfer'
import useNotification from './useNotification'
import { Mainnet } from '@/config/registry'
import useErc20Balance from './useErc20Balance'

interface Params {
  context?: Context
  network?: Network
  tokenAmount: TokenAmount | null
  owner?: string
}

/**
 * Hook to swap ETH to wETH
 */
const useEthToWEthSwap = ({ network, tokenAmount, owner, context }: Params) => {
  const { addNotification } = useNotification()
  const { fetchBalance: fetchWEthBalance } = useErc20Balance({
    network,
    token: tokenAmount?.token ?? undefined,
    address: owner,
    context,
  })
  const [ethBalance, setEthBalance] = useState<number | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const [swapping, setSwapping] = useState<boolean>(false)

  const fetchEthBalance = useCallback(async () => {
    if (
      !context ||
      network !== Network.Ethereum ||
      !tokenAmount ||
      !tokenAmount.amount ||
      tokenAmount.amount <= 0 ||
      !tokenAmount.token ||
      !owner
    ) {
      setEthBalance(undefined)
      return
    }

    const balance = await context.ethereum.api.getBalance(owner).then(x => toHuman(x, Mainnet.ETH))
    console.log('Eth balance is ', balance)
    setEthBalance(balance)

    //todo(nuno)
  }, [network, owner, tokenAmount, context])

  // Reactively fetch the eth balance when the relevant form fields change
  useEffect(() => {
    fetchEthBalance()
  }, [fetchEthBalance])

  const swapEthtoWEth = useCallback(
    async (signer: Signer, amount: number) => {
      setSwapping(true)

      console.log('swap amount:', amount)
      if (
        !context ||
        !network ||
        network !== Network.Ethereum ||
        !tokenAmount ||
        !tokenAmount.token ||
        tokenAmount.token.symbol !== 'wETH'
      ) {
        setSwapping(false)
        return
      }

      try {
        await toPolkadot
          .depositWeth(
            context,
            signer,
            tokenAmount!.token!.address,
            convertAmount(amount, Mainnet.ETH),
          )
          .then(x => x.wait())
          // Fetch the wETH balance again to update the Transfer form
          .then(_ => fetchWEthBalance())

        setSwapping(false)
        addNotification({
          message: 'Swapped ETH for wETH',
          severity: NotificationSeverity.Success,
        })
      } catch (error) {
        addNotification({
          message: 'Failed to swap ETH for wETH',
          severity: NotificationSeverity.Error,
        })
        if (!(error instanceof Error) || !error.message.includes('ethers-user-denied'))
          captureException(error)
      } finally {
        setSwapping(false)
      }
    },
    [network, tokenAmount, context, fetchEthBalance, addNotification],
  )

  return { ethBalance, loading: loading, swapEthtoWEth, swapping }
}

export default useEthToWEthSwap
