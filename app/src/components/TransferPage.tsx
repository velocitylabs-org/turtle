'use client'
import { FC } from 'react'
import ChainSelect from './ChainSelect'

interface TransferPageProps {}

const TransferPage: FC<TransferPageProps> = ({}) => {
  return (
    <div className="h-full max-h-[30rem] w-full max-w-lg rounded-lg border-4 border-green-300 p-5 ">
      <ChainSelect
        value={{
          id: 'acala',
          name: 'Acala',
          logoURI:
            'https://yt3.googleusercontent.com/fxd3QjjeYi0j8RXHa5NwQ03_Puk8AgMpUg48fhtYUBJMaXtzadkFswjQ2fpOCpBEVBnXs0ZWnA=s900-c-k-c0x00ffffff-no-rj',
        }}
        onChange={() => {}}
        chains={[
          {
            id: 'acala',
            name: 'Acala',
            logoURI:
              'https://yt3.googleusercontent.com/fxd3QjjeYi0j8RXHa5NwQ03_Puk8AgMpUg48fhtYUBJMaXtzadkFswjQ2fpOCpBEVBnXs0ZWnA=s900-c-k-c0x00ffffff-no-rj',
          },
        ]}
        className="w-full"
      />
    </div>
  )
}

export default TransferPage
