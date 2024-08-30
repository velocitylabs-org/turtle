import { Chain, Network } from '@/models/chain'
import { NotificationSeverity } from '@/models/notification'
import { Token } from '@/models/token'
import { Direction } from '@/services/transfer'
import useNotification from './useNotification'
import useOngoingTransfers from './useOngoingTransfers'
import { Sender, Status, TransferParams } from './useTransfer'
import { AssetTransferApi, constructApiPromise, TxResult } from '@substrate/asset-transfer-api'
import { WalletOrKeypair, WalletSigner } from '@snowbridge/api/dist/toEthereum'
import { IKeyringPair, Signer } from '@polkadot/types/types'

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

      //todo(nuno): get the wss and specName from the source chain
      const { api, safeXcmVersion } = await constructApiPromise(
        'wss://rococo-asset-hub-rpc.polkadot.io',
      )
      const atApi = new AssetTransferApi(api, 'asset-hub-rococo', safeXcmVersion)

      console.log('Will try to create transfer')
      setStatus('Sending')
      //todo(nuno): fix params here
      const txResult: TxResult<'call'> = await atApi.createTransferTransaction(
        `{"parents":"2","interior":{"X1":{"GlobalConsensus":{"Ethereum":{"chainId":"11155111"}}}}}`,
        '0x6E733286C3Dc52C67b8DAdFDd634eD9c3Fb05B5B',
        [
          `{"parents":"2","interior":{"X2":[{"GlobalConsensus":{"Ethereum":{"chainId":"11155111"}}},{"AccountKey20":{"network":null,"key":"0xfff9976782d46cc05630d1f6ebab18b2324d6b14"}}]}}`,
        ],
        [amount.toString()],
        {
          format: 'call',
          xcmVersion: safeXcmVersion,
        },
      )

      //todo(nuno): remove once done
      console.log('AT API - txResult', txResult)

      //todo(nuno): clean this up, maybe move to separate function
      const signer = sender as WalletOrKeypair
      let addressOrPair: string | IKeyringPair
      let walletSigner: Signer | undefined = undefined
      if (isWallet(signer)) {
        addressOrPair = signer.address
        walletSigner = signer.signer
      } else {
        addressOrPair = signer
      }

      console.log('Will ask to sign')
      const result = await atApi.api
        .tx(txResult.tx)
        .signAsync(addressOrPair, { signer: walletSigner })

      console.log('result is ', result)
      //todo(nuno): follow up here - make sure it's submitted and add to ongoing transfers
    } catch (e) {
      console.log('Transfer submition error:', e)
      addNotification({
        message: 'Transfer failed!',
        severity: NotificationSeverity.Error,
      })
    } finally {
      setStatus('Idle')
    }
  }

  const validate = async (
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

  return { transfer }
}

function isWallet(walletOrKeypair: WalletSigner | IKeyringPair): walletOrKeypair is WalletSigner {
  return (walletOrKeypair as WalletSigner).signer !== undefined
}

/* Return the AssetTransferApi-compatible destChainId for a given destination chain */
function getDestChainId(destChain: Chain): string {
  switch (destChain.network) {
    case Network.Ethereum: {
      return `{"parents":"2","interior":{"X1":{"GlobalConsensus":{"Ethereum":{"chainId":"${destChain.chainId}"}}}}}`
    }
    default:
      return destChain.chainId.toString()
  }
}

export default useAssetTransferApi
