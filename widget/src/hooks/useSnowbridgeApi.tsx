import { toEthereumV2, toPolkadotV2 } from '@snowbridge/api'
import useNotification from './useNotification'
import useSnowbridgeContext from './useSnowbridgeContext'
import { NotificationSeverity } from '@/models/notification'
import { Sender, Status, TransferParams } from './useTransfer'
import { switchChain } from '@wagmi/core'
import { wagmiConfig } from '@/providers/config'
import { mainnet } from 'wagmi/chains'
import { Direction, resolveDirection, txWasCancelled } from '@/utils/transfer'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Signer, TransactionResponse } from 'ethers'
import { getSenderAddress } from '@/utils/address'
import { getTokenPrice } from '@/utils/token'
import useOngoingTransfers from './useOngoingTransfers'
import { StoredTransfer } from '@/models/transfer'
import { isAssetHub } from '@/registry/helpers'
import { SnowbridgeContext } from '@/models/snowbridge'
import { findValidationError } from '@/lib/snowbridge'

type TransferType = toPolkadotV2.Transfer | toEthereumV2.Transfer

const useSnowbridgeApi = () => {
  const { addOrUpdate } = useOngoingTransfers()
  const { addNotification } = useNotification()
  const { snowbridgeContext } = useSnowbridgeContext()

  // main transfer function which is exposed to the components.
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    const { sender, sourceChain, sourceToken, destinationChain, recipient, sourceAmount } = params

    try {
      if (snowbridgeContext === undefined) {
        addNotification({
          message: 'Some nuts and bolts are not quite there yet',
          severity: NotificationSeverity.Error,
        })
        return
      }
      await switchChain(wagmiConfig, { chainId: mainnet.id })
      const direction = resolveDirection(sourceChain, destinationChain)

      const transfer = (await createTx(
        direction,
        snowbridgeContext,
        sender,
        sourceToken,
        destinationChain,
        recipient,
        sourceAmount,
        setStatus,
      )) as toPolkadotV2.Transfer

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

      const validationError = findValidationError(validation)
      if (validationError) {
        addNotification({
          message: validationError.message ?? 'Validation Failed',
          severity: NotificationSeverity.Error,
        })
        return
      }

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
    transfer: TransferType,
    params: TransferParams,
    direction: Direction,
    setStatus: (status: Status) => void,
  ) => {
    const {
      sourceChain,
      sourceToken,
      destinationToken,
      destinationChain,
      recipient,
      sourceAmount,
      environment,
      fees,
      bridgingFee,
      onComplete,
    } = params
    try {
      setStatus('Sending')
      let response: TransactionResponse

      switch (direction) {
        case Direction.ToPolkadot: {
          response = await (sender as Signer).sendTransaction(
            (transfer as toPolkadotV2.Transfer).tx,
          )
          const receipt = await response.wait(1)
          if (!receipt) {
            throw Error(`Transaction ${response.hash} not included`)
          }

          break
        }

        case Direction.ToEthereum: {
          //todo(nuno): fix this
          response = await (sender as Signer).sendTransaction(
            (transfer as toPolkadotV2.Transfer).tx,
          )
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
      const tokenUSDValue = (await getTokenPrice(sourceToken))?.usd ?? 0
      const date = new Date()

      addOrUpdate({
        id: response.hash,
        sourceChain,
        sourceToken,
        destinationToken,
        sourceTokenUSDValue: tokenUSDValue,
        sender: senderAddress,
        destChain: destinationChain,
        sourceAmount: sourceAmount.toString(),
        recipient,
        date,
        environment,
        fees,
        bridgingFee,
      } satisfies StoredTransfer)

      // trackTransferMetrics({
      // id: response.hash,
      // sender: senderAddress,
      // sourceChain,
      // token: sourceToken,
      // amount: sourceAmount,
      // destinationChain,
      // tokenUSDValue,
      // fees,
      // recipient,
      // date,
      // environment,
      // })
    } catch (e) {
      handleSendError(sender, e)
    } finally {
      setStatus('Idle')
    }
  }

  const createTx = async (
    direction: Direction,
    snowbridgeContext: SnowbridgeContext,
    sender: Sender,
    // sourceChain: Chain,
    token: Token,
    destinationChain: Chain,
    recipient: string,
    amount: bigint,
    setStatus: (status: Status) => void,
  ): Promise<TransferType | undefined> => {
    setStatus('Validating')

    switch (direction) {
      case Direction.ToPolkadot: {
        const fee = await toPolkadotV2.getDeliveryFee(
          {
            gateway: snowbridgeContext.gateway(),
            assetHub: await snowbridgeContext.assetHub(),
            destination: await snowbridgeContext.parachain(destinationChain.chainId),
          },
          snowbridgeContext.registry,
          token.address,
          destinationChain.chainId,
        )

        return await toPolkadotV2.createTransfer(
          snowbridgeContext.registry,
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
    // if (!cancelledByUser) captureException(e) - Sentry

    addNotification({
      message: cancelledByUser ? 'Transfer rejected' : 'Failed to submit the transfer',
      severity: NotificationSeverity.Error,
    })
  }

  return { transfer }
}

export default useSnowbridgeApi
