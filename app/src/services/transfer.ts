import { Chain, Network } from '../models/chain'
import { Token } from '../models/token'
import { Signer } from 'ethers'
import { getEnvironment, getContext } from '../context/snowbridge'
import * as Snowbridge from '@snowbridge/api'
import { Environment } from '../store/environmentStore'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'
import { convertAmount } from '@/utils/transfer'

/**
 * The direction of a transfer, i.e, from and to which network the tokens
 * will be sent.
 *
 */
export enum Direction {
  ToEthereum = 'ToThereum',
  ToPolkadot = 'toPolkadot',
  WithinPolkadot = 'WithinPolkadot',
  WithinEthereum = 'WithinEthereum',
}

/**
 * Resolve the direction of a transfer given the source and destination chains.
 */
export const resolveDirection = (source: Chain, destination: Chain): Direction => {
  if (source.network == Network.Ethereum && destination.network == Network.Polkadot)
    return Direction.ToPolkadot
  if (source.network == Network.Polkadot && destination.network == Network.Ethereum)
    return Direction.ToEthereum
  if (source.network == Network.Ethereum && destination.network == Network.Ethereum)
    return Direction.WithinEthereum
  if (source.network == Network.Polkadot && destination.network == Network.Polkadot)
    return Direction.WithinPolkadot

  throw Error('The impossible happened')
}

async function trackToPolkadot(
  context: Snowbridge.Context,
  result: Snowbridge.toPolkadot.SendResult,
): Promise<Snowbridge.toPolkadot.SendResult> {
  while (true) {
    const { status } = await Snowbridge.toPolkadot.trackSendProgressPolling(context, result)
    if (status !== 'pending') break

    await new Promise(r => setTimeout(r, 10_000))
  }

  return result
}

// To Ethereum

export const toEthereum = async (
  environment: Environment,
  sourceChain: Chain,
  sender: WalletOrKeypair,
  token: Token,
  amount: bigint,
  recipient: string,
): Promise<Snowbridge.toEthereum.SendResult> => {
  const snowbridgeEnv = getEnvironment(environment)
  const context = await getContext(snowbridgeEnv)

  return Snowbridge.toEthereum
    .validateSend(context, sender, sourceChain.chainId, recipient, token.address, amount)
    .then(plan => Snowbridge.toEthereum.send(context, sender, plan))
}

async function trackToEthereum(
  context: Snowbridge.Context,
  result: Snowbridge.toEthereum.SendResult,
): Promise<Snowbridge.toEthereum.SendResult> {
  while (true) {
    const { status } = await Snowbridge.toEthereum.trackSendProgressPolling(context, result)
    if (status !== 'pending') break

    await new Promise(r => setTimeout(r, 10_000))
  }

  return result
}
