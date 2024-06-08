import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { Direction, resolveDirection, toPolkadot, toEthereum } from '@/services/transfer'
import { Signer } from 'ethers'
import { Environment } from '@/store/environmentStore'
import { Account as SubstrateAccount } from '@/store/substrateWalletStore'
import { WalletSigner } from '@snowbridge/api/dist/toEthereum'

interface TransferParams {
  environment: Environment
  signer: Signer
  sourceChain: Chain
  token: Token
  destinationChain: Chain
  recipient: SubstrateAccount
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
  const transfer = async ({
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
      toPolkadot(environment, signer, token, amount, destinationChain, recipient.address)
    } else if (direction == Direction.ToEthereum) {
      console.log('toEthereum')
      toEthereum(
        environment,
        sourceChain,
        recipient as WalletSigner,
        token,
        amount,
        await signer.getAddress(),
      )
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
    return sender && sourceChain && token && destinationChain && recipient && amount
  }

  return { transfer, isValid }
}

export default useTransfer
