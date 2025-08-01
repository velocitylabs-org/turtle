import { type Context, toPolkadot } from '@snowbridge/api'
import { assetStatusInfo } from '@snowbridge/api/dist/assets'
import { EthereumTokens, type Network, type TokenAmount } from '@velocitylabs-org/turtle-registry'
import type { Signer } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { NotificationSeverity } from '@/models/notification'
import { convertAmount, toHuman } from '@/utils/transfer'
import useNotification from './useNotification'

interface Params {
  context?: Context
  network?: Network
  tokenAmount: TokenAmount | null
  owner?: string
  refetchFees: () => Promise<void>
}

/**
 * Hook to fetch the ERC20 token spend allowance for a given token and owner account.
 */
const useErc20Allowance = ({ network, tokenAmount, owner, context, refetchFees }: Params) => {
  const { addNotification } = useNotification()
  const [allowance, setAllowance] = useState<number | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const [approving, setApproving] = useState<boolean>(false)

  const fetchAllowance = useCallback(async () => {
    if (
      !context ||
      network !== 'Ethereum' ||
      !tokenAmount ||
      !tokenAmount.amount ||
      tokenAmount.amount <= 0 ||
      !tokenAmount.token ||
      !owner
    ) {
      setAllowance(undefined)
      return
    }

    try {
      setLoading(true)
      const fetchedAllowance = (await assetStatusInfo(context, tokenAmount.token.address, owner)).tokenGatewayAllowance
      setAllowance(toHuman(fetchedAllowance, tokenAmount.token))
      refetchFees()
    } catch (error) {
      console.error('Failed to fetch ERC-20 Token Allowance', error)
      // captureException(error) - Sentry
    } finally {
      setLoading(false)
    }
  }, [network, owner, tokenAmount, context, refetchFees])

  // Reactively fetch the erc20 spend allowance when the relevant form fields change
  useEffect(() => {
    fetchAllowance()
  }, [fetchAllowance])

  const approveAllowance = useCallback(
    async (signer: Signer) => {
      setApproving(true)

      if (
        !context ||
        !network ||
        network !== 'Ethereum' ||
        !tokenAmount ||
        !tokenAmount.amount ||
        tokenAmount.amount <= 0 ||
        !tokenAmount.token
      ) {
        setApproving(false)
        return
      }

      try {
        if (tokenAmount.token.id === EthereumTokens.USDT.id) {
          if (allowance == null) await fetchAllowance()

          if (allowance !== 0) {
            // USDT first need, to revoke the current allowance, before setting the new one.
            await toPolkadot
              .approveTokenSpend(context, signer, tokenAmount!.token!.address, 0n)
              .then(x => x.wait())
              .then(() => fetchAllowance())
          }
        }

        await toPolkadot
          .approveTokenSpend(
            context,
            signer,
            tokenAmount!.token!.address,
            convertAmount(tokenAmount!.amount, tokenAmount!.token),
          )
          .then(x => x.wait())
          .then(() => fetchAllowance())

        setApproving(false)
        addNotification({
          message: 'Updated ERC-20 spend allowance',
          severity: NotificationSeverity.Success,
        })
      } catch (error) {
        addNotification({
          message: 'Failed to approve ERC-20 spend',
          severity: NotificationSeverity.Error,
        })
        console.log(error)
        //if (!(error instanceof Error) || !error.message.includes('ethers-user-denied'))
        // captureException(error) - Sentry
        setApproving(false)
      }
    },
    [allowance, network, tokenAmount, context, fetchAllowance, addNotification],
  )

  return { allowance, loading: loading, approveAllowance, approving }
}

export default useErc20Allowance
