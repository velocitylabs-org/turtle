import { Features } from '@/components/features'
import { TurtlesBackground } from '@/components/TurtlesBackground'

export default function Home() {
  return (
    <>
      <section className="relative z-20 flex h-[40vh] flex-col items-center justify-center sm:h-[75vh] md:mb-20 lg:mb-10">
        <TurtlesBackground
          src={'/bg.png'}
          alt={'Frictionless cross-chain transfers'}
        />
      </section>

      {/* Features section */}
      <section className="bg-info pb-36 pt-20 md:pb-72 lg:pb-96">
        <Features />
      </section>
    </>
  )
}
