import { NavbarBrand, NavbarContent, NavbarItem, Navbar as NextNavbar } from '@nextui-org/react'
import { FC } from 'react'
import Button from './Button'
import { TurtleIcon } from './svg/TurtleIcon'

const Navbar: FC = async () => {
  return (
    <NextNavbar
      position="static"
      className="bg-transparent pb-10 sm:p-10"
      maxWidth="full"
      isBlurred={false}
      classNames={{ wrapper: 'px-4 sm:px-6' }}
    >
      <NavbarBrand className="gap-2">
        <TurtleIcon size={28} />
        <p className="text-lg text-white sm:text-large">Turtle</p>
        <span className="flex h-[19px] items-center justify-center rounded-[4px] border border-white px-[5px] text-[12px] font-bold text-white">
          ALPHA
        </span>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-0 sm:gap-10">
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
