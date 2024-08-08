import { Network } from '@/models/chain'
import { TokenAmount } from '@/models/select'
import { captureException } from '@sentry/nextjs'
import { Context, toPolkadot } from '@snowbridge/api'
import { assetStatusInfo } from '@snowbridge/api/dist/assets'
import { useCallback, useEffect, useState } from 'react'
import { convertAmount, toHuman } from '../utils/transfer'
import { Signer } from 'ethers'
import useNotification from './useNotification'
import { NotificationSeverity } from '@/models/notification'

interface Params {
  context?: Context
  network?: Network
  tokenAmount: TokenAmount | null
  owner?: string
}

/**
 * Hook to fetch the ERC20 token spend allowance for a given token and owner account.
 */
const useErc20Allowance = ({ network, tokenAmount, owner, context }: Params) => {
  const { addNotification } = useNotification()

  const [allowance, setAllowance] = useState<number | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const [approving, setApproving] = useState<boolean>(false)

  const fetchAllowance = useCallback(async () => {
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

    try {
      setLoading(true)
      const fetchedAllowance = (await assetStatusInfo(context, tokenAmount.token.address, owner))
        .tokenGatewayAllowance
      setAllowance(toHuman(fetchedAllowance, tokenAmount.token))
    } catch (error) {
      console.error('Failed to fetch ERC-20 Token Allowance', error)
      captureException(error)
    } finally {
      setLoading(false)
    }
  }, [network, owner, tokenAmount, context])

  // Reactively fetch the erc20 spend allowance when the relevant form fields change
  useEffect(() => {
    fetchAllowance()
  }, [network, owner, tokenAmount, context])

  const approveAllowance = useCallback(
    async (signer: Signer) => {
      setApproving(true)

      if (
        !context ||
        !network ||
        network !== Network.Ethereum ||
        !tokenAmount ||
        !tokenAmount.amount ||
        tokenAmount.amount <= 0 ||
        !tokenAmount.token
      ) {
        setApproving(false)
        return
      }

      try {
        await toPolkadot
          .approveTokenSpend(
            context,
            signer,
            tokenAmount!.token!.address,
            convertAmount(tokenAmount!.amount, tokenAmount!.token),
          )
          .then(x => x.wait())
          .then(_ => fetchAllowance())

        setApproving(false)
        addNotification({
          message: 'Updated ERC-20 spend allowance',
          severity: NotificationSeverity.Success,
        })
      } catch (error) {
        console.log('Failed to approve ERC-20 spend:', error)
        addNotification({
          message: 'Failed to approve ERC-20 spend',
          severity: NotificationSeverity.Error,
        })
        captureException(error)
        setApproving(false)
      }
    },
    [network, tokenAmount, context],
  )

  return { allowance, loading: loading, approveAllowance, approving }
}

export default useErc20Allowance
