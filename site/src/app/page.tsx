import { Features } from '@/components/features'
import { TurtlesBackground } from '@/components/TurtlesBackground'

export default function Home() {
  return (
    <>
      <section className="relative z-20 flex h-[40vh] h-[75vh] flex-col items-center justify-center">
        <TurtlesBackground header={'Frictionless cross-chain transfers'} />
      </section>

      {/* Features section */}
      <section className="features relative z-40 bg-info pb-36 pt-20 md:pb-72 lg:pb-96 mt-[-20px]">
        <Features />
      </section>
    </>
  )
}
