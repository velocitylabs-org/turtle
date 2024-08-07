import { Network } from '@/models/chain'
import { TokenAmount } from '@/models/select'
import { captureException } from '@sentry/nextjs'
import { Context } from '@snowbridge/api'
import { assetStatusInfo } from '@snowbridge/api/dist/assets'
import { useCallback, useEffect, useState } from 'react'
import { toHuman } from '../utils/transfer'

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
  const [allowance, setAllowance] = useState<number | undefined>()
  const [loading, setLoading] = useState<boolean>(false)

  const fetchAllowance = useCallback(async () => {
    console.log('fetchAllowance')
    if (
      !context ||
      !network ||
      network !== Network.Ethereum ||
      !tokenAmount ||
      !tokenAmount.amount ||
      tokenAmount.amount <= 0 ||
      !tokenAmount.token ||
      !owner
    ) {
      console.log('fetchAllowance: failed if')
      setAllowance(undefined)
      return
    }
    console.log('will fetch')

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

  useEffect(() => {
    console.log('fetchAllowance: useEffect')
    fetchAllowance()
  }, [network, owner, tokenAmount, context])

  return { allowance, loading: loading }
}

export default useErc20Allowance
