import { NavbarBrand, NavbarContent, NavbarItem, Navbar as NextNavbar } from '@nextui-org/react'
import { FC } from 'react'
import Button from './Button'
import { TurtleIcon } from './svg/TurtleIcon'

const Navbar: FC = async () => {
  return (
    <NextNavbar position="static" className="bg-transparent p-10" maxWidth="full" isBlurred={false}>
      <NavbarBrand className="gap-2">
        <TurtleIcon size={28} />
        <p className="text-large text-white">Turtle</p>
        <span className="flex h-[19px] items-center justify-center rounded-[4px] border-1 border-white px-[5px] text-[12px] font-bold text-white">
          ALPHA
        </span>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-10">
        <NavbarItem>
          <Button label="Docs" size="md" variant="ghost" className="text-sm text-white" />
        </NavbarItem>
        <NavbarItem>
          <Button label="About" size="md" variant="ghost" className="text-sm text-white" />
        </NavbarItem>
      </NavbarContent>
    </NextNavbar>
  )
}

export default Navbar
