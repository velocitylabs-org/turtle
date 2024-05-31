'use client'
import { testchains, testTokens } from '@/__tests__/testdata'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { FC, useState } from 'react'
import ChainSelect from './ChainSelect'
import ConnectEvmWalletButton from './ConnectEvmWalletButton'
import ConnectSubstrateWalletButton from './ConnectSubstrateWalletButton'
import TokenSelect from './TokenSelect'
import TransferButton from './TransferButton'
import ValueInput from './ValueInput'

const Transfer: FC = () => {
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null)
  const [token, setToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [receiverAddress, setReceiverAddress] = useState<string>('')

  return (
    <div className="card h-full w-full max-w-xl rounded-lg border-2 border-primary bg-gray-800 bg-opacity-25 p-5 shadow-xl backdrop-blur-sm sm:max-h-[32rem]">
      <div className="flex flex-col gap-3">
        {/* Wallet Connect Buttons */}
        <div className="flex gap-2 self-end">
          <ConnectEvmWalletButton label="Connect EVM" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-6">
          {/* Source Chain */}
          <div>
            <span className="label label-text">Source Chain</span>
            <ChainSelect
              value={sourceChain}
              onChange={setSourceChain}
              options={testchains}
              title="Select Source Chain"
              className="w-full"
            />
          </div>

          {/* Token */}
          <div>
            <span className="label label-text">Token</span>
            <TokenSelect
              value={token}
              onChange={setToken}
              options={testTokens}
              className="w-full"
            />
          </div>
        </div>

        {/* Token Amount */}
        <div>
          <span className="label label-text">Amount</span>
          <ValueInput
            value={amount}
            onChange={setAmount}
            placeholder="0"
            disabled={!token}
            unit={token?.symbol}
            className="w-full"
          />
        </div>

        {/* Destination Chain */}
        <div>
          <span className="label label-text">Destination Chain</span>
          <ChainSelect
            value={destinationChain}
            onChange={setDestinationChain}
            options={testchains}
            title="Select Destination Chain"
            className="w-full"
          />
        </div>

        {/* Receiver Address */}
        <div>
          <span className="label label-text">Receiver Address</span>
          <ConnectSubstrateWalletButton label="Connect Substrate" />
        </div>

        {/* Transfer Button */}
        <TransferButton
          label="Transfer"
          onClick={() => console.log('Transfer')}
          className="max-w-xs self-center"
        />
      </div>
    </div>
  )
}

export default Transfer
