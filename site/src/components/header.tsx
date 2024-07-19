import Link from 'next/link'
import { TurtleIcon } from './assets/turtle-icon'

export default function Header() {
  return (
    <header className="absolute inset-x-4 top-0 z-50 flex items-center justify-between py-4 sm:inset-x-10 sm:top-8 sm:py-0">
      <Link href="/" className="flex items-center space-x-2">
        <TurtleIcon size={40} />
        <p className="turtle-text-shadow text-[2rem] font-medium text-white">Turtle</p>
        <span className="flex h-[19px] items-center justify-center rounded-[4px] border border-white px-[5px] text-[12px] font-bold text-white">
          ALPHA
        </span>
      </Link>

      <nav>
        <ul className="items-center space-x-6">
          <li>
            <button className="btn btn-primary flex h-[56px] w-[122px] flex-row justify-center rounded-lg border-black text-xl font-medium hover:border-black">
              <a href="https://app.turtle.cool" target="_blank">
                Transfer
              </a>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
