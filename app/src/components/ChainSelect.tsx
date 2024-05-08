'use client'

import { Chain } from '@/models/chain'
import Image from 'next/image'
import { FC } from 'react'

interface ChainSelectProps {
  value: Chain | null
  onChange: (newValue: Chain | null) => void
  chains: Chain[]
  disabled?: boolean
  className?: string
}

const ChainSelect: FC<ChainSelectProps> = ({ value, onChange, chains, disabled, className }) => {
  return (
    <div className="flex items-center justify-center">
      <button
        className="btn w-full"
        onClick={() =>
          (document.getElementById('source-chain-dialog') as HTMLDialogElement).showModal()
        }
      >
        Select Chain
      </button>

      <dialog id="source-chain-dialog" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Select Chain</h3>
          {chains.map((chain) => (
            <button key={chain.id} className="rounded-lg p-4" onClick={() => onChange(chain)}>
              <Image
                src={chain.logoURI}
                alt={chain.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              {chain.name}
            </button>
          ))}
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}

export default ChainSelect
