import { Chain, Network } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { StoredTransfer } from '@/models/transfer'
import { getErc20TokenUSDValue } from '@/services/balance'
import { Direction } from '@/services/transfer'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { trackTransferMetrics } from '@/utils/analytics'
import { captureException } from '@sentry/nextjs'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'
import { AssetTransferApi, constructApiPromise } from '@substrate/asset-transfer-api'
import { JsonRpcSigner } from 'ethers'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { Sender, Status, TransferParams } from './useTransfer'

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
      console.log('Sender is ', JSON.stringify(sender))

      console.log(sourceChain)
      if (!sourceChain.rpcConnection || !sourceChain.specName)
        throw new Error('Source chain is missing rpcConnection or specName')

      const { api, safeXcmVersion } = await constructApiPromise(sourceChain.rpcConnection)
      const atApi = new AssetTransferApi(api, sourceChain.specName, safeXcmVersion)

      setStatus('Sending')

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

      //todo(nuno): remove once done
      console.log('AT API - txResult', txResult)

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
      handleSendError(e)
    } finally {
      setStatus('Idle')
    }
  }

  const _validate = async (
    _direction: Direction,
    _sender: Sender,
    _sourceChain: Chain,
    _token: Token,
    _destinationChain: Chain,
    _recipient: string,
    _amount: bigint,
    setStatus: (status: Status) => void,
  ): Promise<boolean> => {
    setStatus('Validating')

    //todo(noah)
    return false
  }

  const handleSendError = (e: unknown) => {
    console.error('Transfer error:', e)
    if (!(e instanceof Error) || !e.message.includes('Cancelled')) captureException(e)
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
