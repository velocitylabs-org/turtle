import Link from 'next/link'
import { TurtleSocialIcons } from './assets/social-icons'
import { TurtleIcon } from './assets/turtle-icon'

export default function Header() {
  return (
    <header className="absolute inset-x-4 top-0 z-50 flex items-center justify-between py-4 sm:inset-x-10 sm:top-8 sm:py-0">
      <Link href="/" className="flex items-center space-x-2">
        <TurtleIcon size={36} />
        <p className="turtle-text-shadow text-[1.85rem] text-logo font-medium text-white">Turtle</p>
      </Link>

      <nav>
        {/* mobile menu */}
        <div className="drawer sm:hidden">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <label htmlFor="my-drawer" className="btn btn-circle btn-ghost drawer-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
          </div>
          {/* content mobile menu */}
          <div className="drawer-side">
            <label
              htmlFor="my-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <div className="menu min-h-full w-2/3 space-y-4 bg-secondary p-4 text-base-content">
              <Link href="/" className="flex items-center space-x-2">
                <TurtleIcon size={28} />
                <p className="text-2xl font-medium">Turtle</p>
              </Link>
              <ul className="space-y-4">
                <li>
                  <button className="btn btn-primary border-black text-sm font-medium hover:border-black">
                    <a href="https://app.turtle.cool">Start a transfer</a>
                  </button>
                </li>
              </ul>
              <div className="fixed inset-x-0 bottom-0 flex items-center justify-center space-x-4 pb-8">
                <TurtleSocialIcons />
              </div>
            </div>
          </div>
        </div>

        {/* desktop menu */}
        <ul className="hidden items-center space-x-6 sm:flex">
          <li>
            <button className="btn btn-primary flex h-[56px] w-[122px] flex-row justify-center rounded-lg border-black text-xl font-medium hover:border-black">
              <a href="https://app.turtle.cool" target="_blank">Transfer</a>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
