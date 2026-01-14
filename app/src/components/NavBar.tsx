'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import ActionBanner from './ActionBanner'
import TurtleIcon from './svg/TurtleIcon'

const readMoreButton = {
  label: 'Learn more',
  onClick: () => {
    window.open('https://medium.com/todo', '_blank', 'noopener,noreferrer')
  },
}

export default function NavBar() {
  return (
    <>
      <header className="relative z-50 flex flex-col w-full items-center mt-[7rem] justify-between px-6 py-5 sm:px-10 sm:py-9">
        <>
          <TurtleIcon size={40} />
          <div className="turtle-text-shadow xl-letter-spacing text-[2rem] text-white">Turtle</div>
          <div className="mt-[1px] flex h-[19px] items-center justify-center rounded-[4px] border border-white px-[5px]">
            <p className="text-[12px] font-bold text-white">DEPRECATED</p>
          </div>
        </>

        <motion.div className="flex items-center gap-1 self-center pt-1 w-[504px] text-center items-center">
          <ActionBanner
            disabled={false}
            header="Turtle is being deprecated."
            text={`Turtle will be shut down on February 15th 2026. Use at own risk meanwhile.`}
            image={<Image src="/wip.png" alt="Announcement" width={86} height={86} />}
            btn={readMoreButton}
          />
        </motion.div>
      </header>
    </>
  )
}
