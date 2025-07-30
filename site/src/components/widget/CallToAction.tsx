'use client'

import ArrowDown from '@velocitylabs-org/turtle-assets/icons/arrow-down.svg'
import Image from 'next/image'

export default function CallToAction() {
  return (
    <div className="flex items-center justify-center gap-2">
      <p className="text-lg text-white">Start Integrating</p>
      <Image src={ArrowDown} alt="arrow-down" />
    </div>
  )
}
