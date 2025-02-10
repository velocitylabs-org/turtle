import useBalance from '@/hooks/useBalance'
import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { TokenAmount } from '@/models/select'
import { EthereumTokens } from '@/registry/mainnet/tokens'
import { Environment } from '@/store/environmentStore'
import { captureException } from '@sentry/nextjs'
import { Context, environment, toPolkadot } from '@snowbridge/api'
import { Signer } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { convertAmount, toHuman } from '../utils/transfer'

interface Params {
  env: Environment
  context?: Context
  chain?: Chain | null
  tokenAmount: TokenAmount | null
  owner?: string
}

/** Hook to swap ETH for wETH */
// TODO: refactor this hook. Add wagmi eth balance fetching. Improve wETH token check. Hook 'useErc20Balance' is never used in the functions.
const useEthForWEthSwap = ({ env, chain, tokenAmount, owner, context }: Params) => {
  const { addNotification } = useNotification()
  const { balance: tokenBalance } = useBalance({
    env,
    chain,
    token: tokenAmount?.token ?? undefined,
    address: owner,
  })
  const [ethBalance, setEthBalance] = useState<number | undefined>()
  const [isSwapping, SetIsSwapping] = useState<boolean>(false)

  const fetchEthBalance = useCallback(async () => {
    if (
      !environment ||
      !context ||
      chain?.network !== 'Ethereum' ||
      !owner ||
      !tokenAmount ||
      tokenAmount.token?.symbol !== 'wETH'
    ) {
      setEthBalance(undefined)
      return
    }

    try {
      const balance = await context.ethereum()
        .getBalance(owner)
        .then(x => toHuman(x, EthereumTokens.ETH))
      setEthBalance(balance)
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('ethers-user-denied'))
        captureException(error)
    }
  }, [chain?.network, owner, tokenAmount, context])

  // Reactively fetch the eth balance when the relevant form fields change
  useEffect(() => {
    fetchEthBalance()
  }, [fetchEthBalance, tokenBalance])

  const swapEthtoWEth = useCallback(
    async (signer: Signer, amount: number) => {
      SetIsSwapping(true)

      if (
        !env ||
        !context ||
        chain?.network !== 'Ethereum' ||
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
            convertAmount(amount, EthereumTokens.ETH),
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
    [env, chain?.network, tokenAmount, context, ethBalance, owner, addNotification],
  )

  return { ethBalance, swapEthtoWEth, isSwapping }
}

export default useEthForWEthSwap
