import { getNativeToken } from '@/config/registry'
import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { TokenAmount } from '@/models/select'
import { Fees } from '@/models/transfer'
import { getTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { convertAmount, toHuman } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { toEthereum, toPolkadot } from '@snowbridge/api'
import { AssetTransferApi, constructApiPromise } from '@substrate/asset-transfer-api'
import { useCallback, useEffect, useState } from 'react'
import { getDestChainId } from './useAssetTransferApi'
import useSnowbridgeContext from './useSnowbridgeContext'

const useFees = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  tokenAmount?: TokenAmount | null,
  recipient?: string | null,
) => {
  const [fees, setFees] = useState<Fees | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext } = useSnowbridgeContext()
  const { addNotification } = useNotification()

  const fetchFees = useCallback(async () => {
    if (
      !sourceChain ||
      !destinationChain ||
      !tokenAmount?.token ||
      !tokenAmount?.amount ||
      !recipient
    ) {
      setFees(null)
      return
    }

    const direction = resolveDirection(sourceChain, destinationChain)
    // TODO: this should be the fee token, not necessirly the native token. Also adjust the USD value accordingly below.
    const nativeToken = getNativeToken(sourceChain)

    try {
      setLoading(true)
      let amount: string
      let tokenUSDValue: number = 0
      switch (direction) {
        case Direction.ToEthereum: {
          if (!snowbridgeContext) throw new Error('Snowbridge context undefined')

          tokenUSDValue = (await getTokenPrice('polkadot'))?.usd ?? 0
          amount = (await toEthereum.getSendFee(snowbridgeContext)).toString()
          break
        }
        case Direction.ToPolkadot: {
          if (!snowbridgeContext) throw new Error('Snowbridge context undefined')

          tokenUSDValue = (await getTokenPrice('ethereum'))?.usd ?? 0
          amount = (
            await toPolkadot.getSendFee(
              snowbridgeContext,
              tokenAmount.token.address,
              destinationChain.chainId,
              BigInt(0),
            )
          ).toString()
          break
        }
        case Direction.WithinPolkadot: {
          if (!sourceChain.rpcConnection || !sourceChain.specName)
            throw new Error('Source chain is missing rpcConnection or specName')

          console.log('Hello')
          const { api, safeXcmVersion } = await constructApiPromise(sourceChain.rpcConnection)
          const atApi = new AssetTransferApi(api, sourceChain.specName, safeXcmVersion)

          const tx = await atApi.createTransferTransaction(
            getDestChainId(destinationChain),
            recipient,
            // asset id
            [tokenAmount.token.symbol],
            // the amount (pairs with the asset ids above)
            [convertAmount(tokenAmount.amount, tokenAmount.token).toString()],
            {
              format: 'call',
              xcmVersion: 4, //todo(nuno): how to define this safely
            },
          )

          console.log('Goodbye')

          // set token fees
          const feesInfo = await atApi.fetchFeeInfo(tx.tx, 'call')
          amount = feesInfo?.partialFee.toString() ?? '0'

          // set USD fees
          const tokenCoingeckoId = nativeToken.coingeckoId ?? nativeToken.symbol
          console.log('Token id to coingeko', tokenCoingeckoId)
          tokenUSDValue = (await getTokenPrice(tokenCoingeckoId))?.usd ?? 0
          break
        }

        default:
          throw new Error('Unsupported direction')
      }

      setFees({
        amount,
        token: nativeToken,
        inDollars: tokenUSDValue ? toHuman(amount, nativeToken) * tokenUSDValue : 0,
      })
    } catch (error) {
      setFees(null)
      captureException(error)
      console.log('Error is ', error)
      addNotification({
        severity: NotificationSeverity.Error,
        message: 'Failed to fetch the fees. Please try again later.',
        dismissible: true,
      })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sourceChain,
    destinationChain,
    tokenAmount?.token,
    tokenAmount?.amount,
    recipient,
    snowbridgeContext,
    addNotification,
  ])

  // call fetch fees
  useEffect(() => {
    fetchFees()
  }, [sourceChain, destinationChain, tokenAmount?.token, tokenAmount?.amount, recipient, fetchFees])

  return { fees, loading, refetch: fetchFees }
}

export default useFees
