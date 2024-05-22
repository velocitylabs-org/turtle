import { SelectOption } from '@/models/selectOption'
import React, { useState } from 'react'
import ConnectEvmWalletButton from './ConnectEvmWalletButton'
import CustomSelectDialog from './CustomSelectDialog'

const WalletTypeSelect: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [walletType, setWalletType] = useState<string | null>(null)

  const options: SelectOption<string>[] = [
    {
      label: 'EVM Wallet',
      value: 'evm',
      logoURI:
        'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png',
    },
    {
      label: 'Substrate Wallet',
      value: 'substrate',
      logoURI: 'https://cnews24.ru/uploads/d41/d419a4c7028eaf6864f972e554d761e7b10e5d06.png',
    },
  ]

  const handleOpenDialog = () => setIsOpen(true)
  const handleCloseDialog = () => setIsOpen(false)

  const handleChange = (option: SelectOption<string>) => {
    setWalletType(option.value)
  }

  return (
    <div>
      <button className="btn" onClick={handleOpenDialog}>
        Connect Wallet
      </button>

      {isOpen && (
        <CustomSelectDialog
          title="Select Wallet Type"
          options={options}
          onChange={handleChange}
          onClose={handleCloseDialog}
        />
      )}

      {walletType === 'evm' && <ConnectEvmWalletButton label="Connect" />}
    </div>
  )
}

export default WalletTypeSelect
