import Link from 'next/link'
import { TurtleSocialData, TurtleSocialIcons } from './assets/social-icons'
import { TurtleIcon } from './assets/turtle-icon'
import { WaveLine } from './assets/waves-lines'

export default function Footer() {
  return (
    <footer className="relative z-50">
      <WaveLine
        name="footerWave"
        withStroke={true}
        className="absolute inset-0 -top-24 -z-10 sm:-top-28 md:-top-36 lg:-top-64"
      />

      <div className="absolute inset-0 lg:-top-24">
        <div className="flex flex-col items-center justify-center space-y-8 pb-20 2xl:pb-0">
          <div>
            <TurtleIcon size={28} />
          </div>

          <h3 className="space-y-2 text-center text-4xl font-medium tracking-tighter sm:text-5xl md:text-h-sub md:leading-12">
            <p>Trustless, Simple, Turtle.</p>
          </h3>

          <div className="flex flex-col items-center space-y-2 md:flex-row md:justify-between md:space-x-10 md:space-y-0">
            <div className="space-x-5 text-sm underline md:space-x-10">
              <Link
                href="https://app.turtle.cool"
                aria-label="Turle bridge decentralized application"
              >
                Start a transfer
              </Link>
            </div>
            <div className="flex items-center space-x-10 md:hidden">
              <TurtleSocialIcons />
            </div>
            <div className="mr-10 hidden space-x-10 text-sm capitalize underline md:flex">
              {TurtleSocialData.map((item, idx) => {
                return (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.alt}
                  >
                    {item.name}
                  </a>
                )
              })}
            </div>
          </div>
          <p className="text-xs">
            Made with love 💚 by {' '}
            <a href="https://www.velocitylabs.org/" target="_blank" rel="noopener noreferrer">
              Velocity Labs.
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
