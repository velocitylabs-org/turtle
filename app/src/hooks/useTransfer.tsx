import { Chain } from '@/models/chain'
import { Token } from '@/models/token'

interface TransferParams {
  token: Token
  sourceChain: Chain
  destinationChain: Chain
  amount: number
  receiverAddress: string
}

interface TransferValidationParams {
  token: Token | null
  sourceChain: Chain | null
  destinationChain: Chain | null
  amount: number | null
  receiverAddress?: string
}

/**
 * Used to initiate a transfer from source chain to destination chain.
 * It figures out which api to use based on token, source and destination chain.
 */
const useTransfer = () => {
  // TODO: Adjust this once dependent functions are implemented. Also create a way for supporting the 2-step transfers.

  const transfer = ({
    token,
    sourceChain,
    destinationChain,
    amount,
    receiverAddress,
  }: TransferParams) => {
    // TODO: Create some helper functions such as isParachainToEthereumTransfer, isEthereumToParachainTransfer, isXcmOnlyTransfer, etc. and use to make the right call
    console.log(
      `Token: ${token?.name ?? 'null'}, ` +
        `Source Chain: ${sourceChain?.name ?? 'null'}, ` +
        `Destination Chain: ${destinationChain?.name ?? 'null'}, ` +
        `Amount: ${amount ?? 'null'}, ` +
        `Receiver Address: ${receiverAddress ?? 'undefined'}`,
    )

    return
  }

  const validate = ({
    token,
    sourceChain,
    destinationChain,
    amount,
    receiverAddress,
  }: TransferValidationParams) => {
    // TODO: Implement validation logic
    return true
  }

  return { transfer, validate }
}

export default useTransfer
