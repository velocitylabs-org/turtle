import { NavbarBrand, NavbarContent, NavbarItem, Navbar as NextNavbar } from '@nextui-org/react'
import { FC } from 'react'
import Button from './Button'

const Navbar: FC = async () => {
  return (
    <NextNavbar className="bg-transparent" isBlurred={false}>
      <NavbarBrand className="gap-2">
        <p>🐢</p> {/* 🐢 Turtle Logo Placeholder */}
        <p className="text-xl font-semibold">Turtle</p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button label="Read the docs" size="md" variant="ghost" />
        </NavbarItem>
        <NavbarItem>
          <Button label="About Turtle" size="md" variant="ghost" />
        </NavbarItem>
      </NavbarContent>
    </NextNavbar>
  )
}

export default Navbar
