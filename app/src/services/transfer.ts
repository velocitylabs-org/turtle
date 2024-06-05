import { Chain } from '../models/chain'
import { Token } from '../models/token'
import { Keyring } from '@polkadot/keyring'
import { Signer } from 'ethers'
import { getEnvironment, getContext } from '../context/snowbridge'
import * as Snowbridge from '@snowbridge/api'
import { Environment, toSnowbridgeNetwork } from '../store/environmentStore'

/**
 * The direction of a transfer, i.e, from and to which network the tokens
 * will be sent.
 *
 */
export enum Direction {
  ToEthereum,
  ToPolkadot,
  WithinPolkadot,
}

export const resolveDirection = (source: Chain, destination: Chain): Direction => {
  if (source.id == 'ethereum') return Direction.ToPolkadot
  if (destination.id == 'ethereum') return Direction.ToEthereum

  return Direction.WithinPolkadot
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

  // await Snowbridge.toPolkadot.depositWeth(context, signer, tokenContract, BigInt('2000000000000000000'))
  // await Snowbridge.toPolkadot.approveTokenSpend(context, signer, tokenContract, BigInt('2000000000000000000000'))
  // return

  const polkadot_keyring = new Keyring({ type: 'sr25519' })
  const POLKADOT_ACCOUNT = polkadot_keyring.addFromAddress(recipient)
  const POLKADOT_ACCOUNT_PUBLIC = POLKADOT_ACCOUNT.address

  const plan = await Snowbridge.toPolkadot.validateSend(
    context,
    signer,
    POLKADOT_ACCOUNT_PUBLIC,
    tokenContract,
    destinationChain.chainId,
    BigInt(amount),
    BigInt(0),
  )
  console.log('Plan:', plan, plan.failure?.errors)

  console.log(
    'Transfer is: ',
    await signer.getAddress(),
    POLKADOT_ACCOUNT_PUBLIC,
    token.name,
    tokenContract,
    amount,
  )

  const sent = await Snowbridge.toPolkadot.send(context, signer, plan)
  console.log('Submitted transfer')

  while (true) {
    const { status } = await Snowbridge.toPolkadot.trackSendProgressPolling(context, sent)
    if (status !== 'pending') {
      break
    }
    const POLL_INTERVAL_MS = 10_000
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
  }

  console.log('Result: ', sent)
}
