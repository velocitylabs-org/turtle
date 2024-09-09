import { Network } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { TokenAmount } from '@/models/select'
import { captureException } from '@sentry/nextjs'
import { Context, toPolkadot } from '@snowbridge/api'
import { Signer } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { convertAmount } from '../utils/transfer'
import useNotification from './useNotification'

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
  const [ethBalance, setAllowance] = useState<number | undefined>()
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
      setAllowance(undefined)
      return
    }

    //todo(nuno)
    setAllowance(123)
  }, [network, owner, tokenAmount, context])

  // Reactively fetch the eth balance when the relevant form fields change
  useEffect(() => {
    fetchEthBalance()
  }, [fetchEthBalance])

  const swapEthtoWEth = useCallback(
    async (signer: Signer) => {
      setSwapping(true)

      console.log('hey')
      if (
        !context ||
        !network ||
        network !== Network.Ethereum ||
        !tokenAmount ||
        !tokenAmount.amount ||
        tokenAmount.amount <= 0 ||
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
            convertAmount(tokenAmount!.amount, tokenAmount!.token),
          )
          .then(x => x.wait())
          .then(_ => fetchEthBalance())

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
        setSwapping(false)
      }
    },
    [network, tokenAmount, context, fetchEthBalance, addNotification],
  )

  return { ethBalance, loading: loading, swapEthtoWEth, swapping }
}

export default useEthToWEthSwap
