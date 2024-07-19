import Link from 'next/link'
import { TurtleIcon } from './assets/turtle-icon'

export default function Header() {
  return (
    <header className="absolute inset-x-4 top-0 z-50 flex items-center justify-between py-4 sm:inset-x-10 sm:top-8 sm:py-0">
      <Link href="/" className="flex items-center space-x-2">
        <TurtleIcon size={40} />
        <p className="turtle-text-shadow text-[2rem] font-medium text-white">Turtle</p>
        <div className="box-shadow flex h-[19px] items-center justify-center rounded-[4px] border border-white bg-white px-[5px]">
          <p className=" rainbow-text text-[12px] font-bold">BETA</p>
        </div>
      </Link>

      <nav>
        <ul className="items-center space-x-6">
          <li>
            <button className="btn btn-primary flex h-[20px] sm:h-[56px] w-[122px] flex-row justify-center rounded-lg border-black text-lg sm:text-xl font-medium hover:border-black">
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
