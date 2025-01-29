import useNotification from '@/hooks/useNotification'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { AmountInfo } from '@/models/transfer'
import { getNativeToken } from '@/registry'
import { Eth, Polkadot } from '@/registry/mainnet/tokens'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { getPlaceholderAddress } from '@/utils/address'
import { getCurrencyId, getRelayNode } from '@/utils/paraspell'
import { safeConvertAmount, toHuman } from '@/utils/transfer'
import { getOriginFeeDetails, getTNode } from '@paraspell/sdk'
import { captureException } from '@sentry/nextjs'
import { toEthereum, toPolkadot } from '@snowbridge/api'
import { useCallback, useEffect, useState } from 'react'
import useEnvironment from './useEnvironment'
import useSnowbridgeContext from './useSnowbridgeContext'
import { WalletInfo } from './useWallet'
import { TokenAmount } from '@/models/select'

const useFees = (
  sourceChain?: Chain | null,
  destinationChain?: Chain | null,
  token?: Token | null,
  sourceWallet?: WalletInfo | undefined,
  recipient?: string,
  tokenAmount?: TokenAmount | null,
) => {
  const [fees, setFees] = useState<AmountInfo | null>(null)
  const [canPayFees, setCanPayFees] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const { snowbridgeContext, isSnowbridgeContextLoading, snowbridgeContextError } =
    useSnowbridgeContext()
  const { addNotification } = useNotification()
  const env = useEnvironment()

  const fetchFees = useCallback(async () => {
    if (!sourceChain || !destinationChain || !token) {
      setFees(null)
      return
    }

    const direction = resolveDirection(sourceChain, destinationChain)
    // TODO: this should be the fee token, not necessarily the native token. Also adjust the USD value accordingly below.
    const nativeToken = getNativeToken(sourceChain)

    try {
      setLoading(true)
      let fees: string
      let tokenUSDValue: number = 0

      if (
        (direction === Direction.ToEthereum || direction === Direction.ToPolkadot) &&
        isSnowbridgeContextLoading
      ) {
        setFees(null)
        return
      }

      switch (direction) {
        case Direction.ToEthereum: {
          if (!snowbridgeContext || snowbridgeContextError)
            throw snowbridgeContextError ?? new Error('Snowbridge context undefined')
          tokenUSDValue = (await getCachedTokenPrice(Polkadot.DOT))?.usd ?? 0
          fees = (await toEthereum.getSendFee(snowbridgeContext)).toString()
          break
        }

        case Direction.ToPolkadot: {
          if (!snowbridgeContext || snowbridgeContextError)
            throw snowbridgeContextError ?? new Error('Snowbridge context undefined')
          tokenUSDValue = (await getCachedTokenPrice(Eth.ETH))?.usd ?? 0

          const sendFee = await toPolkadot.getSendFee(
            snowbridgeContext,
            token.address,
            destinationChain.chainId,
            BigInt(0),
          )
          fees = sendFee.toString()

          if (
            !sourceWallet?.sender?.address ||
            !recipient ||
            !tokenAmount?.amount ||
            !token.address ||
            !sendFee
          ) {
            console.log('break')
            break
          }

          const { tx } = await toPolkadot.createTx(
            snowbridgeContext.config.appContracts.gateway,
            sourceWallet.sender?.address,
            recipient,
            token.address,
            destinationChain.chainId,
            safeConvertAmount(tokenAmount.amount, token) ?? 0n,
            sendFee,
            // destinationChain.destinationFeeDOT ?? 0n,
            0n, // to be confirmed with Alistair. getSendFee already add BigInt(0),
          )

          console.log('Plan tx:', tx)
          const gas = await snowbridgeContext.ethereum.api.estimateGas(tx)
          console.log('Plan gas:', gas)
          // const maxFeePerGas = (await snowbridgeContext.ethereum.api.getFeeData()).maxFeePerGas ?? 0n
          // const totalCostWei = gas * maxFeePerGas;
          // const totalCostEth = Number(totalCostWei) / 1e18;  // Convert to ETH
          // console.log(`Estimated cost: ${totalCostEth} ETH`);

          const feeData = await snowbridgeContext.ethereum.api.getFeeData()
          const baseFeePerGas = feeData.gasPrice ?? 0n
          const priorityFeePerGas = feeData.maxPriorityFeePerGas ?? 0n
          const effectiveGasPrice = baseFeePerGas + priorityFeePerGas

          const totalCostWei = gas * effectiveGasPrice
          const totalCostEth = Number(totalCostWei) / 1e18
          console.log(`Estimated cost: ${totalCostEth} ETH`)
          // console.log('Plan dry run:', await snowbridgeContext.ethereum.api.call(tx))
          break
        }

        case Direction.WithinPolkadot: {
          const relay = getRelayNode(env)
          const sourceChainNode = getTNode(sourceChain.chainId, relay)
          const destinationChainNode = getTNode(destinationChain.chainId, relay)
          if (!sourceChainNode || !destinationChainNode) throw new Error('Chain id not found')
          const currency = getCurrencyId(env, sourceChainNode, sourceChain.uid, token)

          const info = await getOriginFeeDetails({
            origin: sourceChainNode,
            destination: destinationChainNode,
            currency: { ...currency, amount: BigInt(10 ** token.decimals).toString() }, // hardcoded amount because the fee is usually independent of the amount
            account: getPlaceholderAddress(sourceChain.supportedAddressTypes[0]), // hardcode sender address because the fee is usually independent of the sender
            accountDestination: getPlaceholderAddress(destinationChain.supportedAddressTypes[0]), // hardcode recipient address because the fee is usually independent of the recipient
            api: sourceChain.rpcConnection,
          })
          tokenUSDValue = (await getCachedTokenPrice(nativeToken))?.usd ?? 0
          fees = info.xcmFee.toString()
          setCanPayFees(info.sufficientForXCM)
          break
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
    sourceWallet?.sender?.address,
    recipient,
    tokenAmount?.amount,
  ])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  return { fees, loading, refetch: fetchFees, canPayFees }
}

export default useFees
