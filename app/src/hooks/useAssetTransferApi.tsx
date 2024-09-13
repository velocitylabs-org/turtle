import { Chain, Network } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { StoredTransfer } from '@/models/transfer'
import { getErc20TokenUSDValue } from '@/services/balance'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { trackTransferMetrics } from '@/utils/analytics'
import { txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'
import { AssetTransferApi, constructApiPromise } from '@substrate/asset-transfer-api'
import { JsonRpcSigner } from 'ethers'
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

    setStatus('Loading')
    try {
      if (!sourceChain.rpcConnection || !sourceChain.specName)
        throw new Error('Source chain is missing rpcConnection or specName')

      const { api, safeXcmVersion } = await constructApiPromise(sourceChain.rpcConnection)
      console.log('before')
      const atApi = new AssetTransferApi(api, sourceChain.specName, safeXcmVersion)
      console.log(atApi)

      console.log(token.multilocation)
      console.log(getDestChainId(destinationChain))
      console.log(recipient)
      setStatus('Sending')

      // TODO here it fails on muse to eth transfer
      const txResult = await atApi.createTransferTransaction(
        getDestChainId(destinationChain),
        recipient,
        // asset id
        [token.multilocation],
        // the amount (pairs with the asset ids above)
        [amount.toString()],
        {
          format: 'submittable',
          xcmVersion: safeXcmVersion,
        },
      )
      console.log('after2')

      const account = sender as SubstrateAccount

      const hash = await atApi.api
        .tx(txResult.tx)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .signAndSend(account.address, { signer: account.signer as any })

      if (!hash) throw new Error('Transfer failed')
      onSuccess?.()
      addNotification({
        message: 'Transfer initiated. See below!',
        severity: NotificationSeverity.Success,
      })

      const senderAddress =
        sender instanceof JsonRpcSigner
          ? await sender.getAddress()
          : (sender as WalletOrKeypair).address

      const tokenData = await getErc20TokenUSDValue(token.address)
      const tokenUSDValue =
        tokenData && Object.keys(tokenData).length > 0 ? tokenData[token.address]?.usd : 0
      const date = new Date()

      addTransferToStorage({
        id: hash.toString(),
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
      } satisfies StoredTransfer)

      // metrics
      if (environment === Environment.Mainnet)
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
    } catch (e) {
      if (!txWasCancelled(sender, e)) captureException(e)
      handleSendError(e)
    } finally {
      setStatus('Idle')
    }
  }

  const handleSendError = (e: unknown) => {
    console.error('Transfer error:', e)
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
