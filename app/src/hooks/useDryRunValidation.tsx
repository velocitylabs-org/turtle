import { NotificationSeverity } from '@/models/notification'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { AssetTransferApi, constructApiPromise } from '@substrate/asset-transfer-api'
import { useState } from 'react'
import { getDestChainId } from './useAssetTransferApi'
import useNotification from './useNotification'
import { TransferParams } from './useTransfer'

type DryRunState = 'Success' | 'Error' | 'Loading' | 'Idle'

/**
 * Hook to make an AT API dry run call for validation purposes.
 */
const useDryRunValidation = () => {
  const { addNotification } = useNotification()
  const [state, setState] = useState<DryRunState>('Idle')

  const dryRun = async ({
    sender,
    sourceChain,
    token,
    recipient,
    amount,
    destinationChain,
  }: Omit<TransferParams, 'fees' | 'onSuccess' | 'environment'>) => {
    try {
      setState('Loading')
      if (!sourceChain.rpcConnection || !sourceChain.specName)
        throw new Error('Source chain is missing rpcConnection or specName')

      // setup AT API
      const { api, safeXcmVersion } = await constructApiPromise(sourceChain.rpcConnection)
      const atApi = new AssetTransferApi(api, sourceChain.specName, safeXcmVersion)

      // create tx
      const txResult = await atApi.createTransferTransaction(
        getDestChainId(destinationChain),
        recipient,
        [token.multilocation],
        [amount.toString()],
        {
          format: 'submittable',
          xcmVersion: safeXcmVersion,
        },
      )

      // sign and send tx
      const account = sender as SubstrateAccount
      const result = await atApi.api
        .tx(txResult.tx)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .dryRun(account.address, { signer: account.signer as any })

      // TODO: check result for success or failure

      addNotification({
        message: 'Validation Successful. Continue with the transfer.',
        severity: NotificationSeverity.Success,
      })
      setState('Success')

      return result.isOk
    } catch (e) {
      setState('Error')
      if (!txWasCancelled(sender, e)) captureException(e)
      addNotification({
        message: 'Sorry the validation failed.',
        severity: NotificationSeverity.Error,
      })
      return false
    }
  }

  return { state, dryRun }
}

export default useDryRunValidation
