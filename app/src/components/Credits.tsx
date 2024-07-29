import Image from 'next/image'
import { FC } from 'react'

const Credits: FC = () => {
  return (
    <div className="credits mt-6 flex flex-row items-center justify-center text-xs text-turtle-level5 sm:text-sm">
      Made with love by{' '}
      <a
        href="https://www.velocitylabs.org"
        target="_blank"
        rel="noopener noreferrer"
        className="px-2"
      >
        <Image
          src={'/velocitylabs.svg'}
          alt={'Velocity Labs'}
          width={24}
          height={24}
          className="rounded-full border-1"
        />
      </a>
      {' ・ '}
      Powered by{' '}
      <a
        href="https://docs.snowbridge.network/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-2"
      >
        <Image
          src={'/snowbridge.svg'}
          alt={'Snowbridge Network'}
          width={24}
          height={24}
          className="rounded-full border-1"
        />
      </a>
    </div>
  )
}

export default Credits
