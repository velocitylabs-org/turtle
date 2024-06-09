import { Chain, Network } from '../models/chain'
import { Token } from '../models/token'
import { Keyring } from '@polkadot/keyring'
import { Signer } from 'ethers'
import { getEnvironment, getContext } from '../context/snowbridge'
import * as Snowbridge from '@snowbridge/api'
import { Environment, toSnowbridgeNetwork } from '../store/environmentStore'
import { WalletOrKeypair } from '@snowbridge/api/dist/toEthereum'

/**
 * The direction of a transfer, i.e, from and to which network the tokens
 * will be sent.
 *
 */
export enum Direction {
  ToEthereum,
  ToPolkadot,
  WithinPolkadot,
  WithinEthereum,
}

/**
 * This function resolves the direction of a transfer given the source and destination chains.
 * It assumes that validations for unsupported flows have been done before being called.
 */
export const resolveDirection = (source: Chain, destination: Chain): Direction => {
  switch ([source.network, destination.network]) {
    case [Network.Ethereum, Network.Polkadot]:
      return Direction.ToPolkadot
    case [Network.Polkadot, Network.Ethereum]:
      return Direction.ToEthereum
    case [Network.Ethereum, Network.Ethereum]:
      return Direction.WithinEthereum
    default:
      return Direction.WithinPolkadot
  }
}

export const getErc20TokenContract = (
  token: Token,
  env: Snowbridge.environment.SnowbridgeEnvironment,
): string => {
  switch (token.id) {
    case 'weth':
      return env.locations[0].erc20tokensReceivable['WETH']
    default:
      throw Error('Token not supported or it is not an ERC20 token')
  }
}

export const toPolkadot = async (
  environment: Environment,
  signer: Signer,
  token: Token,
  amount: number,
  destinationChain: Chain,
  recipient: string,
): Promise<void> => {
  const snowbridgeEnv = getEnvironment(toSnowbridgeNetwork(environment))
  const context = await getContext(snowbridgeEnv)
  const tokenContract = getErc20TokenContract(token, snowbridgeEnv)

  await Snowbridge.toPolkadot
    .validateSend(
      context,
      signer,
      recipient,
      tokenContract,
      destinationChain.chainId,
      BigInt(amount),
      BigInt(0),
    )
    .then(plan => Snowbridge.toPolkadot.send(context, signer, plan))
    .then(sent => trackToPolkadot(context, sent))
    .then(res => console.log('Result:', res))
    .catch(e => console.log('Failed to transfer: ', e))
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
  amount: number,
  recipient: string,
): Promise<void> => {
  const snowbridgeEnv = getEnvironment(toSnowbridgeNetwork(environment))
  const context = await getContext(snowbridgeEnv)
  const tokenContract = getErc20TokenContract(token, snowbridgeEnv)

  await Snowbridge.toEthereum
    .validateSend(context, sender, sourceChain.chainId, recipient, tokenContract, BigInt(amount))
    .then(plan => Snowbridge.toEthereum.send(context, sender, plan))
    .then(sent => trackToEthereum(context, sent))
    .then(res => console.log('Result:', res))
    .catch(e => console.log('Failed to transfer: ', e))
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
