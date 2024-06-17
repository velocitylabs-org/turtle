import { WaveLine } from '@/components/assets/waves-lines'
import { Features } from '@/components/features'

export default function Home() {
  return (
    <>
      <section className="relative z-20 flex h-[40vh] flex-col items-center justify-center sm:h-[60vh] md:mb-20 md:h-[80vh] lg:mb-10">
        <h1
          className={
            'z-30 max-w-[400px] p-4 text-center text-3xl font-medium sm:max-w-[550px] sm:text-5xl md:max-w-[600px] lg:max-w-[700px] lg:text-6xl xl:max-w-[1050px] xl:text-hero-xl'
          }
        >
          Easily move tokens across blockchains.
        </h1>
        {/* wave lines svg */}
        <WaveLine name="heroWaves" className="absolute inset-x-0" withStroke={true} />
        {/* waves svg */}
        <WaveLine
          name="heroBackgroundWave"
          withStroke={true}
          className="absolute inset-x-0 -bottom-9 -z-10 md:-bottom-44 2xl:-bottom-64"
        />
        {/* animated ellipse svg */}
        <WaveLine
          name="animationEllipse"
          dur={3}
          className="absolute inset-y-[calc(25%)] left-0 xl:-inset-y-2"
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
