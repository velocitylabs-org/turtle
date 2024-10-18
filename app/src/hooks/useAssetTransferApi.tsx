import { getNativeToken } from '@/config/registry'
import { Chain, Network } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { StoredTransfer } from '@/models/transfer'
import { getTokenPrice } from '@/services/balance'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { getSenderAddress } from '@/utils/address'
import { trackTransferMetrics } from '@/utils/analytics'
import { txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { AssetTransferApi, constructApiPromise } from '@substrate/asset-transfer-api'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { Status, TransferParams } from './useTransfer'

const useAssetTransferApi = () => {
  const { addTransfer: addTransferToStorage } = useOngoingTransfers()
  const { addNotification } = useNotification()

  // main transfer function which is exposed to the components.
  const transfer = async (params: TransferParams, setStatus: (status: Status) => void) => {
    setStatus('Loading')
    const {
      sender,
      sourceChain,
      token,
      destinationChain,
      recipient,
      amount,
      environment,
      fees,
      onSuccess,
    } = params

    try {
      if (!sourceChain.rpcConnection || !sourceChain.specName)
        throw new Error('Source chain is missing rpcConnection or specName')

      const { api, safeXcmVersion } = await constructApiPromise(sourceChain.rpcConnection)
      const atApi = new AssetTransferApi(api, sourceChain.specName, safeXcmVersion)

      const dryRunResult = await validate(atApi, params, setStatus)
      if (dryRunResult.xcmExecutionResult.isErr) throw new Error('Dry run failed')

      setStatus('Sending')
      const account = sender as SubstrateAccount
      let isComplete = false

      await atApi.api
        .tx(dryRunResult.tx)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .signAndSend(account.address, { signer: account.signer as any }, async result => {
          const { txHash, status, events } = result

          // verify transaction hash & transfer isn't completed
          if (!txHash) throw new Error('Transfer error: Failed to generate the transaction hash')
          if (isComplete) return

          // Wait until block is finalized before handling transfer data
          if (status.isFinalized) {
            let messageHash: string | undefined
            let messageId: string | undefined
            let extrinsicSuccess: boolean = false

            // Filter the events to get the needed data
            events.forEach(({ event: { data, method, section } }) => {
              if (
                method === 'XcmpMessageSent' &&
                section === 'xcmpQueue' &&
                'messageHash' in data
              ) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                messageHash = (data.messageHash as any).toString()
              }
              if (method === 'Sent' && section === 'polkadotXcm' && 'messageId' in data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                messageId = (data.messageId as any).toString()
              }
              if (method === 'ExtrinsicSuccess' && section === 'system') {
                extrinsicSuccess = true
              }
            })

            if (!extrinsicSuccess)
              throw new Error('Transfer failed. Returned extrinsicSuccess: false')
            if (!messageHash) throw new Error('Cross chain messageHash missing')
            if (!messageId) throw new Error('Parachain messageId missing')

            // Add transfer to storage
            const senderAddress = await getSenderAddress(sender)
            const tokenUSDValue = (await getTokenPrice(token.coingeckoId ?? token.symbol))?.usd ?? 0
            const date = new Date()

            addTransferToStorage({
              id: txHash.toString(),
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
              crossChainMessageHash: messageHash,
              parachainMessageId: messageId,
            } satisfies StoredTransfer)

            onSuccess?.()
            addNotification({
              message: 'Transfer initiated. See below!',
              severity: NotificationSeverity.Success,
            })

            // metrics
            if (environment === Environment.Mainnet) {
              trackTransferMetrics({
                sender: senderAddress,
                sourceChain: sourceChain.name,
                token: token.name,
                amount: amount.toString(),
                destinationChain: destinationChain.name,
                usdValue: tokenUSDValue,
                usdFees: fees.inDollars,
                recipient: recipient,
                date: date.toISOString(),
              })
            }
            // Mark the transfer as complete and return
            isComplete = true
            setStatus('Idle')
            return
          }
        })
    } catch (e) {
      if (!txWasCancelled(sender, e)) captureException(e)
      handleSendError(e)
      setStatus('Idle')
    }
  }

  const validate = async (
    atApi: AssetTransferApi,
    params: TransferParams,
    setStatus: (status: Status) => void,
  ) => {
    setStatus('Validating')
    const { sender, sourceChain, token, destinationChain, recipient, amount } = params

    const callInfo = await atApi.createTransferTransaction(
      getDestChainId(destinationChain),
      recipient,
      // asset id
      [token.symbol],
      // the amount (pairs with the asset ids above)
      [amount.toString()],
      {
        format: 'submittable',
        xcmVersion: 4, //todo(nuno): pass safe value here
        dryRunCall: true,
        sendersAddr: sender.address,
        xcmFeeAsset: getNativeToken(sourceChain).symbol, // TODO: support other fee assets
      },
    )

    return callInfo
  }

  const handleSendError = (e: unknown) => {
    console.log('Transfer error:', e)
    addNotification({
      message: 'Failed to submit the transfer',
      severity: NotificationSeverity.Error,
    })
  }

  return { transfer }
}

/* Return the AssetTransferApi-compatible destChainId for a given destination chain */
export function getDestChainId(destChain: Chain): string {
  switch (destChain.network) {
    case Network.Ethereum: {
      return `{"parents":"2","interior":{"X1":{"GlobalConsensus":{"Ethereum":{"chainId":"${destChain.chainId}"}}}}}`
    }
    default:
      return destChain.chainId.toString()
  }
}

export default useAssetTransferApi
