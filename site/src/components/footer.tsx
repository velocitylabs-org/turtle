import Link from 'next/link'
import { TurtleSocialData, TurtleSocialIcons } from './assets/social-icons'
import { TurtleIcon } from './assets/turtle-icon'

export default function Footer() {
  return (
    <footer className="relative z-10">
      {/* wave svg */}
      <svg
        viewBox="0 0 1440 501"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 -top-24 -z-10 sm:-top-28 md:-top-36 lg:-top-64"
      >
        <path
          d="M-0.5 205.455V204.955H0C128.547 204.955 225.095 158.165 325.885 109.32C330.379 107.142 334.882 104.96 339.397 102.778C445.145 51.6583 557.242 0.500031 716.864 0.500031C874.489 0.500031 971.123 36.1519 1068.89 72.2214L1072.56 73.5742C1171.56 110.09 1272.52 146.587 1440 146.587H1440.5V147.087V501.087V501.587H1440H0H-0.5V501.087V205.455Z"
          fill="#A184DC"
          // stroke="#001B04"
        />
      </svg>

      {/* footer content */}
      <div className="z-0 flex flex-col items-center justify-center space-y-6 pb-24 md:-mt-[100px] md:space-y-10">
        <TurtleIcon size={28} />

        <h2 className="space-y-2 text-center text-4xl font-semibold leading-10 sm:text-5xl md:text-[56px]">
          <p>Built to last.</p>
          <p>Built on Turtle.</p>
        </h2>

        <div className="flex flex-col items-center space-y-2 md:flex-row md:justify-between md:space-x-10 md:space-y-0">
          <div className="space-x-5 underline md:space-x-10">
            <a href="">Docs</a>
            <Link href="/">Start a transfer</Link>
          </div>
          <div className="flex items-center space-x-10 md:hidden">
            <TurtleSocialIcons />
          </div>
          <div className="mr-10 hidden space-x-10 capitalize underline md:flex">
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
        <p>
          Made with 💚 by{' '}
          <a href="https://www.velocitylabs.org/" target="_blank" rel="noopener noreferrer">
            Velocity Labs.
          </a>
        </p>
      </div>
    </footer>
  )
}
