import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="fixed bottom-0 flex w-full items-center justify-center gap-1 border-t-2 border-turtle-level5 bg-turtle-level4 py-2 text-xs">
      <span className="text-center">Made by Velocity Labs</span>
      {/* TODO: replace velocity logo */}
      <Image src={'/snowbridge-logo.svg'} alt="snowbridge logo" height={20} width={20} />

      <span className="text-center">Powered by Snowbridge</span>
      <Image src={'/snowbridge-logo.svg'} alt="snowbridge logo" height={20} width={20} />
    </footer>
  )
}

export default Footer
