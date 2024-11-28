import { FC } from 'react'

const Credits: FC = () => {
  return (
    <div className="credits rainbow-text mt-6 flex flex-col text-center text-xs">
      <div>
        Made with love by{' '}
        <a href="https://www.velocitylabs.org" target="_blank" rel="noopener noreferrer">
          Velocity Labs
        </a>
      </div>
      <div className="mt-1">
        Powered by{' '}
        <a href="https://docs.snowbridge.network" target="_blank" rel="noopener noreferrer">
          Snowbridge
        </a>
        {' & '}
        <a href="https://paraspell.github.io/docs/" target="_blank" rel="noopener noreferrer">
          ParaSpell
        </a>
      </div>
    </div>
  )
}

export default Credits
