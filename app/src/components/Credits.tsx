import { FC } from 'react'

const Credits: FC = () => {
  return (
    <div className="credits mt-6 text-center text-xs text-turtle-level5">
      Made with love by{' '}
      <a href="https://www.velocitylabs.org" target="_blank" rel="noopener noreferrer">
        Velocity Labs
      </a>
      <span className="hidden md:inline">{' ・ '}</span>
      <div className="mt-2 sm:block md:inline">
        Powered by{' '}
        <a href="https://docs.snowbridge.network" target="_blank" rel="noopener noreferrer">
          Snowbridge
        </a>
      </div>
    </div>
  )
}

export default Credits
