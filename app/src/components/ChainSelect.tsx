'use client'

import { Chain } from '@/models/chain'
import Image from 'next/image'
import { FC, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface ChainSelectProps {
  value: Chain | null
  onChange: (newValue: Chain | null) => void
  chains: Chain[]
  disabled?: boolean
  className?: string
}

const ChainSelect: FC<ChainSelectProps> = ({ value, onChange, chains, disabled, className }) => {
  const [showDialog, setShowDialog] = useState(false)

  const openDialog = () => setShowDialog(true)
  const closeDialog = () => setShowDialog(false)

  return (
    <div className={twMerge(`flex items-center justify-center`, className)}>
      <button className="btn w-full" onClick={openDialog} disabled={disabled}>
        {value ? (
          <div className="flex items-center gap-2">
            <Image
              src={value.logoURI}
              alt={value.name}
              width={30}
              height={30}
              className="rounded-full"
            />
            {value.name}
          </div>
        ) : (
          'Select Chain'
        )}
      </button>

      {showDialog && (
        <dialog open className="modal">
          <div className="modal-box">
            <div className="flex items-center gap-1">
              <button className="btn btn-circle btn-ghost" onClick={closeDialog}>
                {'<'}-
              </button>
              <h3 className="text-lg font-bold">Select Chain</h3>
            </div>

            <div className="flex flex-col gap-2">
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  className="btn btn-ghost w-full justify-start rounded-lg"
                  onClick={() => {
                    onChange(chain)
                    closeDialog()
                  }}
                >
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
          </div>
          <form method="dialog" className="modal-backdrop" onClick={closeDialog}></form>
        </dialog>
      )}
    </div>
  )
}

export default ChainSelect
