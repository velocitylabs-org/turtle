import { Mainnet } from '@/config/registry'
import useErc20Balance from '@/hooks/useErc20Balance'
import useNotification from '@/hooks/useNotification'
import { Chain, Network } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { TokenAmount } from '@/models/select'
import { SupportedChains } from '@/utils/papi'
import { captureException } from '@sentry/nextjs'
import { Context, toPolkadot } from '@snowbridge/api'
import { Signer } from 'ethers'
import { TypedApi } from 'polkadot-api'
import { useCallback, useEffect, useState } from 'react'
import { convertAmount, toHuman } from '../utils/transfer'

interface Params {
  api?: TypedApi<SupportedChains>
  context?: Context
  chain?: Chain | null
  tokenAmount: TokenAmount | null
  owner?: string
}

/** Hook to swap ETH for wETH */
// TODO: refactor this hook. Add wagmi eth balance fetching. Improve wETH token check. Hook 'useErc20Balance' is never used in the functions.
const useEthForWEthSwap = ({ api, chain, tokenAmount, owner, context }: Params) => {
  const { addNotification } = useNotification()
  const { data: tokenBalance } = useErc20Balance({
    api,
    chain,
    token: tokenAmount?.token ?? undefined,
    address: owner,
    context,
  })
  const [ethBalance, setEthBalance] = useState<number | undefined>()
  const [isSwapping, SetIsSwapping] = useState<boolean>(false)

  const fetchEthBalance = useCallback(async () => {
    if (
      !context ||
      chain?.network !== Network.Ethereum ||
      !owner ||
      !tokenAmount ||
      tokenAmount.token?.symbol !== 'wETH'
    ) {
      setEthBalance(undefined)
      return
    }

    try {
      const balance = await context.ethereum.api
        .getBalance(owner)
        .then(x => toHuman(x, Mainnet.ETH))
      setEthBalance(balance)
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('ethers-user-denied'))
        captureException(error)
    }
  }, [chain?.network, owner, tokenAmount, tokenBalance, context])

  // Reactively fetch the eth balance when the relevant form fields change
  useEffect(() => {
    fetchEthBalance()
  }, [fetchEthBalance, tokenBalance])

  const swapEthtoWEth = useCallback(
    async (signer: Signer, amount: number) => {
      SetIsSwapping(true)

      if (
        !context ||
        chain?.network !== Network.Ethereum ||
        !owner ||
        !ethBalance ||
        ethBalance <= amount ||
        tokenAmount?.token?.symbol !== 'wETH'
      ) {
        SetIsSwapping(false)
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

        SetIsSwapping(false)
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
        SetIsSwapping(false)
      }
    },
    [chain?.network, tokenAmount, context, fetchEthBalance, tokenBalance, addNotification],
  )

  return { ethBalance, swapEthtoWEth, isSwapping }
}

export default useEthForWEthSwap
