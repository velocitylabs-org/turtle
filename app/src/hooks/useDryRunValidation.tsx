import { Chain } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { getRoute } from '@/utils/routes'
import { safeConvertAmount, txWasCancelled } from '@/utils/transfer'
import { captureException } from '@sentry/nextjs'
import { AssetTransferApi, constructApiPromise } from '@substrate/asset-transfer-api'
import { useCallback, useEffect, useState } from 'react'
import { getDestChainId } from './useAssetTransferApi'
import useNotification from './useNotification'
import { Sender } from './useTransfer'

export type DryRunState = 'Success' | 'Error' | 'Loading' | 'Idle'

interface Params {
  environment: Environment
  sender?: Sender | null
  sourceChain?: Chain | null
  token?: Token | null
  recipient?: string | null
  amount?: number | null
  destinationChain?: Chain | null
}

/**
 * Hook to make an AT API dry run call for validation purposes.
 */
const useDryRunValidation = ({
  environment,
  sender,
  sourceChain,
  token,
  recipient,
  amount,
  destinationChain,
}: Params) => {
  const { addNotification } = useNotification()
  const [hasDryRun, setHasDryRun] = useState(false)
  const [state, setState] = useState<DryRunState>('Idle')

  const dryRun = useCallback(async () => {
    try {
      setState('Loading')

      if (!sourceChain?.rpcConnection || !sourceChain?.specName)
        throw new Error('Source chain is missing rpcConnection or specName')

      if (
        !sender ||
        !sourceChain ||
        !recipient ||
        !amount ||
        !token ||
        !token.multilocation ||
        !destinationChain
      ) {
        throw new Error('Data is missing for dry run validation')
      }
      const convertedAmount = safeConvertAmount(amount, token)
      if (!convertedAmount) throw new Error('Failed to convert')

      // setup AT API
      const { api, safeXcmVersion } = await constructApiPromise(sourceChain.rpcConnection)
      const atApi = new AssetTransferApi(api, sourceChain.specName, safeXcmVersion)

      // create tx
      const txResult = await atApi.createTransferTransaction(
        getDestChainId(destinationChain),
        recipient,
        [token.multilocation],
        [convertedAmount.toString()],
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

      if (result.isOk) {
        console.log('Dry Run Successful')
        addNotification({
          message: 'Looking good! Ready when you are',
          severity: NotificationSeverity.Success,
        })
        setState('Success')
      } else {
        console.log('Dry Run Not Successful')
        addNotification({
          message: 'Something is off. Proceed at your own risk.',
          severity: NotificationSeverity.Error,
        })
      }

      return result.isOk
    } catch (e) {
      setState('Error')
      if (!txWasCancelled(sender!, e)) captureException(e)
      addNotification({
        message: 'Sorry the validation failed.',
        severity: NotificationSeverity.Error,
      })
      return false
    }
  }, [sourceChain, token, recipient, amount, destinationChain, sender, addNotification])

  const updateHasDryRun = useCallback(async () => {
    setHasDryRun(
      !!sourceChain &&
        !!destinationChain &&
        getRoute(environment, sourceChain, destinationChain)?.sdk === 'AssetTransferApi',
    )
  }, [setHasDryRun, sourceChain, destinationChain, environment])

  // reset state on form change
  useEffect(() => {
    setState('Idle')
    updateHasDryRun()
  }, [dryRun, updateHasDryRun])

  return { state, dryRun, hasDryRun }
}

export default useDryRunValidation
