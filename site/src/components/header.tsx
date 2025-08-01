'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { TurtleIcon } from './assets/turtle-icon'
import { Button } from '@velocitylabs-org/turtle-ui'

export default function Header() {
  const pathname = usePathname()
  const isWidget = pathname.includes('widget')

  return (
    <header className="absolute inset-x-4 top-0 z-50 flex items-center justify-between py-4 sm:inset-x-10 sm:top-8 sm:py-0">
      <Link href="/" className="flex items-center space-x-2">
        <TurtleIcon size={40} />
        <p className="turtle-text-shadow hidden text-[2rem] font-medium text-white sm:block">
          Turtle
        </p>
        {isWidget && (
          <div className="hidden md:block">
            <Button
              variant="outline"
              size="sm"
              className="border-turtle-foreground bg-turtle-secondary text-white"
            >
              Docs
            </Button>
          </div>
        )}
      </Link>

      <nav>
        <ul className="flex items-center gap-2">
          <li>
            <Link className="turtle-text-shadow text-white" href={isWidget ? '/' : '/widget'}>
              {isWidget ? 'Discover Turtle' : 'Discover the widget'}
            </Link>
          </li>
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
