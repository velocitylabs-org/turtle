'use client'
import { Chain } from '@/models/chain'
import { FC, useState } from 'react'
import ChainSelect from './ChainSelect'

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

const TransferPage: FC<TransferPageProps> = ({}) => {
  const [sourceChain, setSourceChain] = useState<Chain | null>(testchains[0])

  return (
    <div className="card h-full max-h-[30rem] w-full max-w-xl rounded-lg border-2 border-green-300 bg-white/10 p-5 shadow-xl backdrop-blur-sm">
      <ChainSelect
        value={sourceChain}
        onChange={setSourceChain}
        chains={testchains}
        className="w-full"
      />
    </div>
  )
}

export default TransferPage
