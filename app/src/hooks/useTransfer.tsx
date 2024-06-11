import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Direction, resolveDirection, toPolkadot, toEthereum } from '@/services/transfer'
import { JsonRpcSigner, Signer } from 'ethers'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { WalletSigner } from '@snowbridge/api/dist/toEthereum'

export type Sender = JsonRpcSigner | SubstrateAccount

interface TransferParams {
  environment: Environment
  sender: Sender
  sourceChain: Chain
  token: Token
  destinationChain: Chain
  recipient: string
  amount: number
}

interface TransferValidationParams {
  sender?: Sender | null
  sourceChain: Chain | null
  token: Token | null
  destinationChain: Chain | null
  recipient?: string | null
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
    let direction = resolveDirection(sourceChain, destinationChain)
    let basedAmount = amount ** token.decimals

    switch (direction) {
      case Direction.ToPolkadot:
        toPolkadot(environment, sender as Signer, token, amount, destinationChain, recipient)
        break
      case Direction.ToEthereum:
        toEthereum(environment, sourceChain, sender as WalletSigner, token, amount, recipient)
        break
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
