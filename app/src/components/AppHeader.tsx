import { FC } from 'react'

const AppHeader: FC = () => {
  return (
    <div className="flex flex-col items-center gap-3 p-6">
      <p className="text-8xl">🐢</p>
      <h1 className="pb- bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-center font-sans text-lg font-bold text-transparent md:text-7xl">
        Turtle
      </h1>
    </div>
  )
}

export default AppHeader
