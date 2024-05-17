import { InjectedExtension } from '@polkadot/extension-inject/types'
import { WalletSelect, web3FromSource } from '@talismn/connect-components'
import { FC } from 'react'
const { ApiPromise, WsProvider } = require('@polkadot/api')

interface ConnectSubstrateWalletButtonProps {}

const ConnectSubstrateWalletButton: FC<ConnectSubstrateWalletButtonProps> = () => {
  const handleTest = async () => {
    const provider = new WsProvider('wss://rpc.polkadot.io')
    const api = await ApiPromise.create({ provider })

    const injector = web3FromSource() as InjectedExtension
    api.setSigner(injector.signer)

    const transfer = api.tx.balances.transferAllowDeath(
      '5Gza9nxUQiiErg5NotZ6FPePcjBEHhawoNL3sGqpmjrVhgeo',
      12345,
    )

    const hash = await transfer.signAndSend('5Gza9nxUQiiErg5NotZ6FPePcjBEHhawoNL3sGqpmjrVhgeo', {
      signer: injector.signer,
    })
  }

  return (
    <div>
      <button className="btn" onClick={handleTest}>
        Test
      </button>

      <WalletSelect
        onlyShowInstalled
        dappName="turtle"
        open={false}
        showAccountsList={true}
        triggerComponent={
          <button
            className="btn btn-sm max-w-40 rounded-2xl text-white"
            // `onClick` is optional here
            onClick={(wallets) => {
              console.log(wallets)
            }}
          >
            Connect Substrate
          </button>
        }
        onAccountSelected={(account) => {
          console.log(account)
          const injector = web3FromSource() as InjectedExtension
        }}
      />
    </div>
  )
}

export default ConnectSubstrateWalletButton
