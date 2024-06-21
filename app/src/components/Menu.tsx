import React from 'react'
import Button from './Button'

interface MenuProps {} //TODO remove comment if not usefull

const Menu = () => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="primary" size="lg" className="rounded-2xl">
        <span className="text-large">New</span>
      </Button>
      <Button variant="ghost">
        <span className="text-large text-white">Completed</span>
      </Button>
    </div>
  )
}

export default Menu
