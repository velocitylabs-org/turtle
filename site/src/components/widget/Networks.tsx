'use client'

import { useState } from 'react'
import { Body, Switch, Large, Icon } from '@velocitylabs-org/turtle-ui'
import { tokensById, chainsByUid, Chain, Token } from '@velocitylabs-org/turtle-registry'

const Networks = () => {
  const [visible, setVisible] = useState('Chains')

  const items = visible === 'Chains' ? Object.values(chainsByUid) : Object.values(tokensById)

  const handleVisibleChange = () => {
    if (visible === 'Chains') {
      return setVisible('Tokens')
    }

    setVisible('Chains')
  }

  const TableRow = ({ item }: { item: Chain | Token }) => {
    const id = 'uid' in item ? item.uid : item.id

    return (
      <div className="flex items-center justify-between" key={id}>
        <div className="flex items-center gap-6">
          <Icon
            src={typeof item.logoURI === 'string' ? item.logoURI : item.logoURI.src}
            width={32}
            height={32}
          />
          <div className="flex flex-col">
            <p className="text-sm font-bold">{item.name}</p>
            {'symbol' in item && item.symbol && (
              <p className="text-sm text-turtle-level6">{item.symbol}</p>
            )}
          </div>
        </div>
        <p className="text-sm">{id}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex justify-center gap-2">
        <Body className={visible === 'Chains' ? 'font-bold' : ''}>Chains</Body>
        <Switch checked={visible === 'Tokens'} onChange={handleVisibleChange} />
        <Body className={visible === 'Tokens' ? 'font-bold' : ''}>Tokens</Body>
      </div>
      <section className="flex flex-col gap-6 rounded-3xl border border-turtle-foreground p-6">
        <header className="flex justify-between">
          <Large>All {visible}</Large>
          <Large>ID</Large>
        </header>
        <div className="flex max-h-[350px] flex-col gap-8 overflow-y-auto">
          {items.map((item) => (
            <TableRow key={'uid' in item ? item.uid : item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Networks
