import Link from 'next/link'
import { TurtleIcon } from './svg/TurtleIcon'

export default function NavBar() {
  return (
    <header className="relative w-full z-50 flex items-center justify-between px-10 py-9">
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
              <a href="https://turtle.cool" target="_blank" className='text-white turtle-text-shadow'>
                About
              </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
