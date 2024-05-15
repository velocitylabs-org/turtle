'use client'
import { testchains, testTokens } from '@/__tests__/testdata'
import { Chain } from '@/models/chain'
import { chainsToSelectOptions, chainToSelectOption } from '@/models/selectOption'
import { Token } from '@/models/token'
import { FC, useState } from 'react'
import AddressInput from './AddressInput'
import CustomSelect from './CustomSelect'
import TokenSelect from './TokenSelect'
import TransferButton from './TransferButton'
import ValueInput from './ValueInput'
import WalletConnectButton from './WalletConnectButton'

const Transfer: FC = () => {
  const [sourceChain, setSourceChain] = useState<Chain | null>(null)
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null)
  const [token, setToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [receiverAddress, setReceiverAddress] = useState<string>('')

  return (
    <div className="card h-full w-full max-w-xl rounded-lg border-2 border-green-300 bg-gray-800 bg-opacity-25 p-5 shadow-xl backdrop-blur-sm sm:max-h-[32rem]">
      <div className="flex flex-col gap-3">
        {/* Wallet Connect Button */}
        <WalletConnectButton label="Connect Wallet" className="self-end" />

        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-6">
          {/* Source Chain */}
          <div>
            <span className="label label-text">Source Chain</span>
            <CustomSelect
              value={chainToSelectOption(sourceChain)}
              onChange={(option) => setSourceChain(option?.value as Chain)}
              options={chainsToSelectOptions(testchains)}
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
              disabled={!sourceChain}
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
          <CustomSelect
            value={chainToSelectOption(destinationChain)}
            onChange={(option) => setDestinationChain(option?.value as Chain)}
            options={chainsToSelectOptions(testchains)}
            title="Select Destination Chain"
            className="w-full"
          />
        </div>

        {/* Receiver Address */}
        <div>
          <span className="label label-text">Receiver</span>
          <AddressInput
            value={receiverAddress}
            onChange={setReceiverAddress}
            placeholder="Receiver Address"
          />
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
