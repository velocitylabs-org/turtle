import { Chain } from '../models/chain'
import { Token } from '../models/token'
import { Keyring } from '@polkadot/keyring'
import { Signer } from 'ethers'
import { getEnvironment, getContext } from '../context/snowbridge'
import * as Snowbridge from '@snowbridge/api'

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

export const doTransferTmp = async (signer: Signer, amount: number): Promise<void> => {
  //todo(nuno): make the network an injected value that's set globally
  const snowbridgeEnv = getEnvironment('rococo_sepolia')
  const context = await getContext(snowbridgeEnv)
  const POLL_INTERVAL_MS = 10_000
  const WETH_CONTRACT = snowbridgeEnv.locations[0].erc20tokensReceivable['WETH']

  // await Snowbridge.toPolkadot.approveTokenSpend(context, signer, WETH_CONTRACT, BigInt('1000000000000000000000'))
  // await Snowbridge.toPolkadot.depositWeth(context, signer, WETH_CONTRACT, BigInt('2000000000000000000'))

  const polkadot_keyring = new Keyring({ type: 'sr25519' })
  const POLKADOT_ACCOUNT = polkadot_keyring.addFromAddress(
    '5Gxxx5B9fXHJvo5eFpMtdLJXdbhjfs78UJ8ra7puFcFUvpY2',
  )
  const POLKADOT_ACCOUNT_PUBLIC = POLKADOT_ACCOUNT.address

  const plan = await Snowbridge.toPolkadot.validateSend(
    context,
    signer,
    POLKADOT_ACCOUNT_PUBLIC,
    WETH_CONTRACT,
    1000,
    BigInt(amount),
    BigInt(0),
  )
  console.log('Plan:', plan, plan.failure?.errors)

  const sent = await Snowbridge.toPolkadot.send(context, signer, plan)
  console.log('Submitted transfer')

  while (true) {
    const { status } = await Snowbridge.toPolkadot.trackSendProgressPolling(context, sent)
    if (status !== 'pending') {
      break
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
  }

  console.log('Result: ', sent)
}

export const doTransfer = async (
  sourceChain: Chain,
  token: Token,
  amount: number,
  destinationChain: Chain,
): Promise<void> => {
  console.log(
    'Transfer {} {} from {} to on {}',
    token.id,
    amount,
    sourceChain.name,
    destinationChain.id,
  )

  let direction = resolveDirection(sourceChain, destinationChain)
  // 1. Snowbridge.toEthereum.validateSend
  // 2. Snowbridge.toEthereum.send

  switch (direction) {
    case Direction.ToEthereum: {
      console.log('ToEthereum')
      break
    }
    case Direction.ToPolkadot: {
      console.log('ToPolkadot')
      break
    }
    case Direction.WithinPolkadot: {
      throw new Error('Polkadot internal transfers are not supported')
    }
  }
}
