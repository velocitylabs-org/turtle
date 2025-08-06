'use client'

import ArrowDown from '@velocitylabs-org/turtle-assets/icons/arrow-down.svg'
import Image from 'next/image'

export default function CallToAction() {
  const onClick = () => {
    const element = document.getElementById('what-is-turtle-widget')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button className="flex items-center justify-center gap-2" onClick={onClick}>
      <p className="text-lg text-white">Start Integrating</p>
      <Image src={ArrowDown} alt="arrow-down" />
    </button>
  )
}
