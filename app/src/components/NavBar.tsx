import Link from 'next/link'
import { TurtleIcon } from './svg/TurtleIcon'

export default function NavBar() {
  return (
    <header className="relative z-50 flex w-full items-center justify-between px-6 py-5 sm:px-10 sm:py-9">
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
            <a href="https://turtle.cool" target="_blank" className="turtle-text-shadow text-white">
              About
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
