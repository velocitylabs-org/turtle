import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Direction, resolveDirection, toPolkadot, toEthereum } from '@/services/transfer'
import { JsonRpcSigner, Signer } from 'ethers'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { WalletSigner } from '@snowbridge/api/dist/toEthereum'

interface TransferParams {
  environment: Environment
  sender: JsonRpcSigner | SubstrateAccount
  sourceChain: Chain
  token: Token
  destinationChain: Chain
  recipient: string
  amount: number
}

interface TransferValidationParams {
  sender: any | null | undefined
  sourceChain: Chain | null
  token: Token | null
  destinationChain: Chain | null
  recipient: string | undefined | null
  amount: number | null
}

/**
 * Used to initiate a transfer from source chain to destination chain.
 * It figures out which api to use based on token, source and destination chain.
 */
const useTransfer = () => {
  const transfer = async ({
    environment,
    sender,
    sourceChain,
    token,
    destinationChain,
    recipient,
    amount,
  }: TransferParams) => {
    console.log('From -> To', sourceChain.network, destinationChain.network)
    let direction = resolveDirection(sourceChain, destinationChain)

    console.log('Direction: ', direction)

    switch (direction) {
      case Direction.ToPolkadot:
        toPolkadot(environment, sender as Signer, token, amount, destinationChain, recipient)
      case Direction.ToEthereum:
        toEthereum(environment, sourceChain, sender as WalletSigner, token, amount, recipient)
      default:
        throw Error('Unsupported flow')
    }
  }

  const isValid = ({
    sender,
    sourceChain,
    token,
    destinationChain,
    recipient,
    amount,
  }: TransferValidationParams) => {
    return sender && sourceChain && token && destinationChain && recipient && amount
  }

  return { transfer, isValid }
}

export default useTransfer
