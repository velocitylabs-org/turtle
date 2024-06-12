import { WaveLine } from '@/components/assets/waves-lines'
import { Features } from '@/components/features'

export default function Home() {
  return (
    <>
      <div className="relative z-20 flex h-[40vh] flex-col items-center justify-center sm:h-[60vh] md:mb-20 md:h-[80vh]">
        <h1
          className={
            'z-30 p-4 text-center text-3xl sm:text-5xl md:w-5/6 lg:text-6xl xl:text-[106px] 2xl:w-full'
          }
        >
          Easily move tokens across blockchains.
        </h1>
        {/* wave lines svg */}
        <WaveLine name="heroWaves" className="absolute inset-x-0" />
        {/* waves svg */}
        <WaveLine
          name="heroBackgroundWave"
          className="absolute inset-x-0 -bottom-9 -z-10 md:-bottom-48"
        />
        {/* animated ellipse svg */}
        <WaveLine
          name="animationEllipse"
          dur={3}
          className="absolute xl:-inset-y-0 2xl:-inset-y-5"
          repeatCount={'indefinite'}
        />
      </div>

      {/* Features section */}
      <section className="bg-info pb-36 pt-20 md:pb-72 lg:pb-96">
        <Features />
      </section>
    </>
  )
}
