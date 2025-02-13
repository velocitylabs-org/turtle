import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { EthereumTokens, PolkadotTokens } from '@/registry/mainnet/tokens'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { getPlaceholderAddress } from '@/utils/address'
import { getCurrencyId, getNativeToken, getRelayNode } from '@/utils/paraspell'
import { safeConvertAmount, toHuman } from '@/utils/transfer'
import { getOriginFeeDetails, getTNode } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { toEthereum, toPolkadot } from '@snowbridge/api'
import { useCallback, useEffect, useState } from 'react'
import useEnvironment from './useEnvironment'
import useSnowbridgeContext from './useSnowbridgeContext'
import { getRoute } from '@/utils/routes'
import { estimateTransactionFees } from '@/utils/snowbridge'

const useFees = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
  amount?: number | null,
  senderAddress?: string,
  recipientAddress?: string,
) => {
  const [fees, setFees] = useState<AmountInfo | null>(null)
  const [ethereumTxfees, setEthereumTxFees] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } =
    useSnowbridgeContext()
  const { addNotification } = useNotification()
  const env = useEnvironment()

  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !token) {
      setFees(null)
      setEthereumTxFees(null)
      return
    }

    // nuno
    const route = getRoute(env, sourceChain, destinationChain)
    if (!route) throw new Error('Route not supported')
    

    let direction = resolveDirection(sourceChain, destinationChain)
    direction = sourceChain.chainId === 2034 ? Direction.WithinPolkadot : direction
    // TODO: this should be the fee token, not necessarily the native token. Also adjust the USD value accordingly below.
    const nativeToken = getNativeToken(sourceChain)

    console.log("Direction is ", direction)

    try {
      setLoading(true)
      let fees: string
      let tokenUSDValue: number = 0


      switch (route.sdk) {
        case 'ParaSpellApi': {
          const relay = getRelayNode(env)
            const sourceChainNode = getTNode(sourceChain.chainId, relay)
            if (!sourceChainNode) throw new Error('Source chain id not found')
           
            const destinationChainNode = destinationChain.network === "Ethereum" && destinationChain.chainId === 1 ? "Ethereum" : getTNode(destinationChain.chainId, relay)
            if (!destinationChainNode) throw new Error('Destination chain id not found')
  
            const currency = getCurrencyId(env, sourceChainNode, sourceChain.uid, token)
            const info = await getOriginFeeDetails({
              origin: sourceChainNode,
              destination: destinationChainNode,
              currency: { ...currency, amount: BigInt(10 ** token.decimals).toString() }, // hardcoded amount because the fee is usually independent of the amount
              account: getPlaceholderAddress(sourceChain.supportedAddressTypes[0]), // hardcode sender address because the fee is usually independent of the sender
              accountDestination: getPlaceholderAddress(destinationChain.supportedAddressTypes[0]), // hardcode recipient address because the fee is usually independent of the recipient
              api: sourceChain.rpcConnection,
              ahAccount: getPlaceholderAddress(sourceChain.supportedAddressTypes[0]),
            })
            tokenUSDValue = (await getCachedTokenPrice(nativeToken))?.usd ?? 0
            fees = info.xcmFee.toString()
            setCanPayFees(info.sufficientForXCM)
            break
        }

        case 'SnowbridgeApi':  {
          const direction = resolveDirection(sourceChain, destinationChain)
          if (
            (direction === Direction.ToEthereum || direction === Direction.ToPolkadot) &&
            isSnowbridgeContextLoading
          ) {
            setFees(null)
            setEthereumTxFees(null)
            return
          }

          switch (direction) {
            case Direction.ToEthereum: {
              if (!snowbridgeContext || snowbridgeContextError)
                throw snowbridgeContextError ?? new Error('Snowbridge context undefined')
              tokenUSDValue = (await getCachedTokenPrice(PolkadotTokens.DOT))?.usd ?? 0
              fees = (await toEthereum.getSendFee(snowbridgeContext)).toString()
              break
            }

            case Direction.ToPolkadot: {
              if (!snowbridgeContext || snowbridgeContextError)
                throw snowbridgeContextError ?? new Error('Snowbridge context undefined')
              tokenUSDValue = (await getCachedTokenPrice(EthereumTokens.ETH))?.usd ?? 0
    
              const sendFee = await toPolkadot.getSendFee(
                snowbridgeContext,
                token.address,
                destinationChain.chainId,
                BigInt(0),
              )
              fees = sendFee.toString()
    
              try {
                if (!senderAddress || !recipientAddress || !amount || !sendFee) {
                  setEthereumTxFees(null)
                  break
                }
                // Sender, Recipient and amount can't be defaulted here since the Smart contract verify the ERC20 token allowance.
                const { tx } = await toPolkadot.createTx(
                  snowbridgeContext.config.appContracts.gateway,
                  senderAddress,
                  recipientAddress,
                  token.address,
                  destinationChain.chainId,
                  safeConvertAmount(amount, token) ?? 0n,
                  sendFee,
                  BigInt(0),
                )
    
                const { txFees, txFeesInDollars } = await estimateTransactionFees(
                  tx,
                  snowbridgeContext,
                  nativeToken,
                  tokenUSDValue,
                )
    
                setEthereumTxFees({
                  amount: txFees,
                  token: nativeToken,
                  inDollars: txFeesInDollars ? txFeesInDollars : 0,
                })
                break
              } catch (error) {
                // Estimation can fail for multiple reasons, including errors such as insufficient token approval.
                console.log('Estimated Tx cost failed', error instanceof Error && { ...error })
                captureException(new Error('Estimated Tx cost failed'), {
                  level: 'warning',
                  tags: {
                    useFeesHook:
                      error instanceof Error && 'action' in error && typeof error.action === 'string'
                        ? error.action
                        : 'estimateTransactionFees',
                  },
                  extra: { error },
                })
                break
              }
            }

            default:
              throw new Error('Unsupported direction for the SnowbridgeAPI')

        }
      }

      default:
          throw new Error('Unsupported direction')
    }

    setFees({
      amount: fees,
      token: nativeToken,
      inDollars: tokenUSDValue ? toHuman(fees, nativeToken) * tokenUSDValue : 0,
    })
  
    } catch (error) {
      setFees(null)
      setEthereumTxFees(null)
      captureException(error)
      console.error(error)
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
    env,
    sourceChain,
    destinationChain,
    token?.id,
    snowbridgeContext,
    addNotification,
    senderAddress,
    recipientAddress,
    amount,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return { fees, ethereumTxfees, loading, refetch: fetchFees, canPayFees }
}


export default useFees
