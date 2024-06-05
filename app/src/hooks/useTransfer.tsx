import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Direction, resolveDirection, toPolkadot } from '@/services/transfer'
import { Signer } from 'ethers'
import { environment } from '@snowbridge/api'
import { Environment } from '@/store/environmentStore'

interface TransferParams {
  environment: Environment
  signer: Signer
  sourceChain: Chain
  token: Token
  destinationChain: Chain
  recipient: string
  amount: number
}

interface TransferValidationParams {
  sender: string | null | undefined
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
  const transfer = ({
    environment,
    signer,
    sourceChain,
    token,
    destinationChain,
    recipient,
    amount,
  }: TransferParams) => {
    let direction = resolveDirection(sourceChain, destinationChain)

    if (direction == Direction.ToPolkadot) {
      console.log('toPolkadot')
      toPolkadot(environment, signer, token, amount, destinationChain, recipient)
    } else {
      console.log('Todo(nuno): Support toEthereum')
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
    console.log('Recipient: ', recipient)
    return (
      sender &&
      sourceChain &&
      token &&
      destinationChain &&
      recipient &&
      amount &&
      resolveDirection(sourceChain, destinationChain) == Direction.ToPolkadot
    )
  }

  return { transfer, isValid }
}

export default useTransfer
