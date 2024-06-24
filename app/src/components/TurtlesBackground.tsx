import Image from 'next/image'
import { WaveLine } from './WavesBackground'

interface TurtlesBackgroundProps {
  /** Background to display. */
  src: string
  /** The image alternative text. */
  alt: string
}

export const TurtlesBackground: React.FC<TurtlesBackgroundProps> = ({ src, alt }) => {
  return (
    <div className="absolute top-0 z-0">
      <div className="relative h-screen w-screen overflow-hidden">
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
        <WaveLine
          name="blueBackground"
          withStroke={false}
          className="absolute inset-x-0 bottom-0 h-full w-full lg:h-auto"
        />
        <div className="absolute bottom-0 h-1/2 w-full bg-turtle-tertiary lg:hidden" />
      </div>
    </div>
  )
}
