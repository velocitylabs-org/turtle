'use client'
import { Chain } from '@/models/chain'
import { Token } from '@/models/token'
import { FC, useState } from 'react'
import CustomSelect from './CustomSelect'

interface TransferPageProps {}

const testchains = [
  {
    id: 'acala',
    name: 'Acala',
    logoURI:
      'https://yt3.googleusercontent.com/fxd3QjjeYi0j8RXHa5NwQ03_Puk8AgMpUg48fhtYUBJMaXtzadkFswjQ2fpOCpBEVBnXs0ZWnA=s900-c-k-c0x00ffffff-no-rj',
  },
  {
    id: 'polkadot-relaychain',
    name: 'Polkadot Relay Chain',
    logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    logoURI:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  },
]

const testTokens = [
  {
    id: 'acala',
    name: 'Acala',
    symbol: 'ACA',
    logoURI:
      'https://yt3.googleusercontent.com/fxd3QjjeYi0j8RXHa5NwQ03_Puk8AgMpUg48fhtYUBJMaXtzadkFswjQ2fpOCpBEVBnXs0ZWnA=s900-c-k-c0x00ffffff-no-rj',
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
  },
  {
    id: 'ethereum',
    name: 'Ether',
    symbol: 'ETH',
    logoURI:
      'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
  },
]

const TransferPage: FC<TransferPageProps> = ({}) => {
  const [sourceChain, setSourceChain] = useState<Chain | null>(testchains[0])
  const [destinationChain, setDestinationChain] = useState<Chain | null>(testchains[1])
  const [token, setToken] = useState<Token | null>(null)

  return (
    <div className="card h-full max-h-[30rem] w-full max-w-xl rounded-lg border-2 border-green-300 bg-white/10 p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-6">
          {/* Source Chain */}
          <div>
            <span className="label label-text">Source Chain</span>
            <CustomSelect
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
            <CustomSelect
              value={token}
              onChange={setToken}
              options={testTokens}
              title="Select Token"
              className="w-full"
            />
          </div>
        </div>

        {/* Destination Chain */}
        <span className="label label-text">Destination Chain</span>
        <CustomSelect
          value={destinationChain}
          onChange={setDestinationChain}
          options={testchains}
          title="Select Destination Chain"
          className="w-full"
        />
      </div>
    </div>
  )
}

export default TransferPage
