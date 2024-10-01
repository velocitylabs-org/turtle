import { getNativeToken } from '@/config/registry'
import useNotification from '@/hooks/useNotification'
import { Chain, Network } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { Fees } from '@/models/transfer'
import { getTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { toHuman } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { toEthereum, toPolkadot } from '@snowbridge/api'
import { useCallback, useEffect, useState } from 'react'
import useSnowbridgeContext from './useSnowbridgeContext'
import { AssetTransferApi, constructApiPromise } from '@substrate/asset-transfer-api'
import { getDestChainId } from './useAssetTransferApi'

const useFees = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
) => {
  const [fees, setFees] = useState<Fees | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext } = useSnowbridgeContext()
  const { addNotification } = useNotification()

  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !token || !snowbridgeContext) {
      setFees(null)
      return
    }

    const direction = resolveDirection(sourceChain, destinationChain)
    const nativeToken = getNativeToken(sourceChain)

    try {
      setLoading(true)
      let amount: string
      let tokenUSDValue: number = 0
      switch (direction) {
        case Direction.ToEthereum: {
          tokenUSDValue = (await getTokenPrice('polkadot'))?.usd ?? 0
          amount = (await toEthereum.getSendFee(snowbridgeContext)).toString()
          break
        }
        case Direction.ToPolkadot: {
          tokenUSDValue = (await getTokenPrice('ethereum'))?.usd ?? 0
          amount = (
            await toPolkadot.getSendFee(
              snowbridgeContext,
              token.address,
              destinationChain.chainId,
              BigInt(0),
            )
          ).toString()
          break
        }
        case Direction.WithinPolkadot: {
          if (!sourceChain.rpcConnection || !sourceChain.specName)
            throw new Error('Source chain is missing rpcConnection or specName')

          const { api, safeXcmVersion } = await constructApiPromise(sourceChain.rpcConnection)
          const atApi = new AssetTransferApi(api, sourceChain.specName, safeXcmVersion)
          const tx = await atApi.createTransferTransaction(
            getDestChainId(destinationChain),
            '13gXC9QmeFyZFY595TMnMLZsEAq34h13xpLTLCuqbrGnTNNv',
            // asset id
            ['WETH'],
            // the amount (pairs with the asset ids above)
            ['1000000000000000000'],
            {
              format: 'call',
              xcmVersion: safeXcmVersion,
            },
          )
          const feesInfo = await atApi.fetchFeeInfo(tx.tx, 'call')
          console.log("FeesInfo: ", feesInfo?.toJSON() ?? "null");

          amount = '0'
          tokenUSDValue = 0
          // TODO(nuno): Support fees fetching for xcm transfers
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
      console.log("Error is ", error)
      addNotification({
        severity: NotificationSeverity.Error,
        message: 'Failed to fetch the fees. Please try again later.',
        dismissible: true,
      })
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceChain, destinationChain, token?.id, snowbridgeContext, addNotification])

  // call fetch fees
  useEffect(() => {
    fetchFees()
  }, [sourceChain, destinationChain, token?.id, fetchFees])

  return { fees, loading, refetch: fetchFees }
}

export default useFees
