import Link from 'next/link'
import { TurtleIcon } from './assets/turtle-icon'
import { Button } from '@velocitylabs-org/turtle-ui'

export default function Header() {
  return (
    <header className="absolute inset-x-4 top-0 z-50 flex items-center justify-between py-4 sm:inset-x-10 sm:top-8 sm:py-0">
      <Link href="/" className="flex items-center space-x-2">
        <TurtleIcon size={40} />
        <p className="turtle-text-shadow text-[2rem] font-medium text-white">Turtle</p>
      </Link>

      <nav>
        <ul className="items-center space-x-6">
          <li>
            <Button
              as="a"
              href="https://app.turtle.cool"
              target="_blank"
              size="lg"
              className="text-lg sm:text-xl"
            >
              Transfer
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
