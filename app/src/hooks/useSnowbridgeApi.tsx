import { config } from '@/config'
import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { StoredTransfer } from '@/models/transfer'
import { getCachedTokenPrice } from '@/services/balance'
import { Direction, resolveDirection } from '@/services/transfer'
import { getSenderAddress } from '@/utils/address'
import { trackTransferMetrics } from '@/utils/analytics'
import { txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import {
  Context,
  toEthereumV2,
  toPolkadotV2,
  assetsV2,
} from '@snowbridge/api'
import { switchChain } from '@wagmi/core'
import { Signer } from 'ethers'
import { mainnet } from 'wagmi/chains'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import useSnowbridgeContext from './useSnowbridgeContext'
import { Sender, Status, TransferParams } from './useTransfer'
import { isAssetHub } from '@/registry/helpers'

type TransferType = toPolkadotV2.Transfer | toEthereumV2.Transfer

const useSnowbridgeApi = () => {
  const { addOrUpdate } = useOngoingTransfers()
  const { addNotification } = useNotification()
  const { snowbridgeContext } = useSnowbridgeContext()

  const checkValidation = (
    validation: toPolkadotV2.ValidationResult | toEthereumV2.ValidationResult,
  ): 'Succeeded' | 'Failed' => {
    const error = validation.logs.find(log => log.kind == toPolkadotV2.ValidationKind.Error)
    if (error) {
      addNotification({
        message: error.message ?? 'Validation Failed',
        severity: NotificationSeverity.Error,
      })
      return 'Failed'
    }

    return 'Succeeded'
  }

  // main transfer function which is exposed to the components.
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    const {
      sender,
      sourceChain,
      token,
      destinationChain,
      recipient,
      amount,
      // environment,
      // fees,
      // bridgingFee,
      // onComplete,
    } = params

    try {
      if (snowbridgeContext === undefined) {
        addNotification({
          message: 'Some nuts and bolts are not quite there yet',
          severity: NotificationSeverity.Error,
        })
        return
      }
      await switchChain(config, { chainId: mainnet.id })
      const direction = resolveDirection(sourceChain, destinationChain)

      const transfer = (await createTx(
        direction,
        snowbridgeContext,
        sender,
        token,
        destinationChain,
        recipient,
        amount,
        setStatus,
      )) as toPolkadotV2.Transfer

      // Step 3. Validate the transaction.
      const validation = await toPolkadotV2.validateTransfer(
        {
          ethereum: snowbridgeContext.ethereum(),
          gateway: snowbridgeContext.gateway(),
          bridgeHub: await snowbridgeContext.bridgeHub(),
          assetHub: await snowbridgeContext.assetHub(),
          destParachain: isAssetHub(destinationChain)
            ? undefined
            : await snowbridgeContext.parachain(destinationChain.chainId),
        },
        transfer,
      )

      if (checkValidation(validation) === 'Failed') return

      await submitTransfer(sender, transfer, params, direction, setStatus)

    
    } catch (e) {
      console.error('Transfer initialization error:', e)
      addNotification({
        message: 'Transfer failed!',
        severity: NotificationSeverity.Error,
      })
    } finally {
      setStatus('Idle')
    }
  }

  // Executes the transfer. Validation should happen before.
  const submitTransfer = async (
    sender: Sender,
    transfer: toPolkadotV2.Transfer | toEthereumV2.Transfer,
    params: TransferParams,
    direction: Direction,
    setStatus: (status: Status) => void,
  ) => {
    const {
      sourceChain,
      token,
      destinationChain,
      recipient,
      amount,
      environment,
      fees,
      bridgingFee,
      onComplete,
    } = params
    try {
      setStatus('Sending')
      let response

      switch (direction) {
        case Direction.ToPolkadot: {
          response = await (sender as Signer).sendTransaction((transfer as toPolkadotV2.Transfer).tx)
          const receipt = await response.wait(1)
          if (!receipt) {
            throw Error(`Transaction ${response.hash} not included`)
          }

          break
        }

        case Direction.ToEthereum: {          
          //todo(nuno): fix this
          response = await (sender as Signer).sendTransaction((transfer as toPolkadotV2.Transfer).tx)
          const receipt = await response.wait(1)
          if (!receipt) {
            throw Error(`Transaction ${response.hash} not included`)
          }
          break
        }
        default:
          throw new Error('Unsupported flow')
      }

      onComplete?.()

      const senderAddress = await getSenderAddress(sender)
      const tokenUSDValue = (await getCachedTokenPrice(token))?.usd ?? 0
      const date = new Date()

      addOrUpdate({
        id: response.hash,
        sourceChain,
        token,
        tokenUSDValue,
        sender: senderAddress,
        destChain: destinationChain,
        amount: amount.toString(),
        recipient,
        date,
        environment,
        fees,
        bridgingFee,
      } satisfies StoredTransfer)

      trackTransferMetrics({
        id: response.hash,
        sender: senderAddress,
        sourceChain,
        token,
        amount,
        destinationChain,
        tokenUSDValue,
        fees,
        recipient,
        date,
        environment,
      })
    } catch (e) {
      if (!txWasCancelled(sender, e)) captureException(e)
      handleSendError(sender, e)
    } finally {
      setStatus('Idle')
    }
  }

  const createTx = async (
    direction: Direction,
    snowbridgeContext: Context,
    sender: Sender,
    // sourceChain: Chain,
    token: Token,
    destinationChain: Chain,
    recipient: string,
    amount: bigint,
    setStatus: (status: Status) => void,
  ): Promise<TransferType | undefined> => {
    setStatus('Validating')

    //todo(nuno): DRY and cache this
    const registry = await assetsV2.buildRegistry(await assetsV2.fromContext(snowbridgeContext))

    switch (direction) {
      case Direction.ToPolkadot: {
        const fee = await toPolkadotV2.getDeliveryFee(
          {
            gateway: snowbridgeContext.gateway(),
            assetHub: await snowbridgeContext.assetHub(),
            destination: await snowbridgeContext.parachain(destinationChain.chainId),
          },
          registry,
          token.address,
          destinationChain.chainId,
        )

        return await toPolkadotV2.createTransfer(
          registry,
          sender.address,
          recipient,
          token.address,
          destinationChain.chainId,
          amount,
          fee,
        )

        break
      }
      case Direction.ToEthereum:
        {
          // todo(nuno)
          // const account = sender as SubstrateAccount
          // const signer = { signer: account.pjsSigner, address: sender.address }
          // return await toEthereum.validateSend(
          //   snowbridgeContext,
          //   signer as WalletOrKeypair,
          //   sourceChain.chainId,
          //   recipient,
          //   token.address,
          //   amount,
          // )
        }
        break

      default:
        throw new Error('Unsupported flow')
    }
  }

  const handleSendError = (sender: Sender, e: unknown) => {
    console.log('Transfer error:', e)
    
    const cancelledByUser = txWasCancelled(sender, e)
    if (!cancelledByUser) captureException(e)

    addNotification({
      message: cancelledByUser ? 'Transfer rejected' : 'Failed to submit the transfer',
      severity: NotificationSeverity.Error,
    })
  }

  return { transfer }
}

export default useSnowbridgeApi
