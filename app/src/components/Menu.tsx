import React from 'react'
import Button from './Button'

interface MenuProps {}

const Menu = () => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="primary" size="lg" className="rounded-xl">
        <span className="text-3xl">New</span>
      </Button>
      <Button variant="ghost">
        <span className="text-3xl text-white">Completed</span>
      </Button>
    </div>
  )
}

export default Menu
