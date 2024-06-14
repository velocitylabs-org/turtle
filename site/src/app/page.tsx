import { WaveLine } from '@/components/assets/waves-lines'
import { Features } from '@/components/features'

export default function Home() {
  return (
    <>
      <section className="relative z-20 flex h-[40vh] flex-col items-center justify-center sm:h-[60vh] md:mb-20 md:h-[80vh] lg:mb-10">
        <h1
          className={
            'z-30 p-4 text-center text-3xl font-medium sm:text-5xl md:w-5/6 lg:text-6xl xl:text-hero-xl 2xl:w-full'
          }
        >
          Easily move tokens across blockchains.
        </h1>
        {/* wave lines svg */}
        <WaveLine name="heroWaves" className="absolute inset-x-0" withStroke={true} />
        {/* waves svg */}
        <WaveLine
          name="heroBackgroundWave"
          className="absolute inset-x-0 -bottom-9 -z-10 md:-bottom-44"
        />
        {/* animated ellipse svg */}
        <WaveLine
          name="animationEllipse"
          dur={3}
          className="absolute inset-y-[calc(25%)] md:inset-y-[calc(15%)] lg:inset-y-[calc(10%)] xl:inset-y-0"
          repeatCount={'indefinite'}
        />
      </section>

      {/* Features section */}
      <section className="bg-info pb-36 pt-20 md:pb-72 lg:pb-96">
        <Features />
      </section>
    </>
  )
}
