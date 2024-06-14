import { FC } from 'react'

const Navbar: FC = async () => {
  return (
    <div className="navbar">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">🐢 Turtle</a>
      </div>
      <div className="flex-none">
        <button className="btn btn-ghost">Read the Docs</button>
        <button className="btn btn-ghost">About Turtle</button>
      </div>
    </div>
  )
}

export default Navbar
